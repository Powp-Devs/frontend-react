import os
from dotenv import load_dotenv

import uuid
import shutil
from pathlib import Path

from fastapi import UploadFile, HTTPException
from fastapi.responses import FileResponse

from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime

from . import schemas, models

DIRETORIO_FOTO = os.getenv("PASTA_FOTOS_PRODUTO", "docs/imagens")

def create_product(db: Session, dados: schemas.ProdutoCreate):
    try:
        new_price = models.Preco (
            preco_custo = dados.custo,
            preco_venda = dados.preco_venda,
            margem = dados.margem,
            dtcadastro = datetime.now()
        )

        db.add(new_price)
        db.flush()

        new_product = models.Produto(
            produto = dados.produto,
            sku = dados.sku,
            embalagem = dados.embalagem,
            unidade = dados.unidade,
            ean = dados.ean,
            gtin = dados.gtin,
            status = dados.status,
            codfornecedor = dados.codfornecedor,
            codcategoria = dados.codcategoria,
            codpreco = new_price.codpreco,
            dtcadastro = datetime.now()
        )

        db.add(new_product)
        db.flush()

        caminho_foto = f"{DIRETORIO_FOTO}/{new_product.codproduto}.jpg"
        new_product.diretorio_foto = caminho_foto

        db.commit()
        db.refresh(new_product)

        return {
            "status": 201,
            "message": "Produto cadastrado e precificado com sucesso",
            "produto": new_product,
            "preco": new_price
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao cadastrar um novo produto no sistema. ERRO => {str(e)}")

def getProduct_paginate(db: Session, page: int = 1, per_page: int = 10):

    offset = (page - 1) * per_page
    total_produtos = db.query(models.Produto).count()

    produtos_db = db.query(models.Produto).offset(offset).limit(per_page).all()

    return {
        "status": 200,
        "message": "Listagem de produtos cadastrados",
        "produtos": produtos_db,
        "total": total_produtos,
        "page": page,
        "per_page": per_page
    }

def get_product_by_id(codproduto: int, db: Session):
    product_db = db.query(models.Produto).filter(models.Produto.codproduto == codproduto).first()

    if not product_db: 
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    preco = db.query(models.Preco).filter(models.Preco.codpreco == product_db.codpreco).first() if product_db.codpreco else None
    
    return {
        "status": 200,
        "message": "Produto encontrado com sucesso",
        "data": {
            **product_db.__dict__,
            "preco": preco.__dict__ if preco else None
        }
    }

def update_product(db: Session, codproduto: int, dados: schemas.ProdutoUpdate):
    produto_db = db.query(models.Produto).filter(models.Produto.codproduto == codproduto).first()

    if not produto_db:
        return {
            "status": 404,
            "message": "Produto não localizado",
            "success": False
        }

    try:
        produto_db.produto = dados.produto
        produto_db.sku = dados.sku
        produto_db.embalagem = dados.embalagem
        produto_db.unidade = dados.unidade
        produto_db.gtin = dados.gtin
        produto_db.ean = dados.ean
        produto_db.status = dados.status
        produto_db.obs = dados.obs
        produto_db.codfornecedor = dados.codfornecedor
        produto_db.codcategoria = dados.codcategoria


        db.commit()
        db.refresh(produto_db)

        return{
            "status": 200,
            "message": "Produto atualizado com sucesso",
            "success": True,
            "data": produto_db
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Não foi possível atualizar o produto selecionado!")

def update_price(codproduto: int, dados: schemas.PrecoUpdate, db: Session):
    produto_db = db.query(models.Produto).filter(models.Produto.codproduto == codproduto).first()

    if not produto_db:
        return {
            "status": 404,
            "message": "Produto não localizado",
            "success": False
        }

    codpreco = produto_db.codpreco

    preco_db = db.query(models.Preco).filter(models.Preco.codpreco == codpreco).first()

    try :
        new_log = models.PrecoLog(
            codproduto = codproduto,
            codpreco = codpreco,
            custo_ant = preco_db.preco_custo,
            custo_new = dados.preco_custo,
            venda_ant = preco_db.preco_venda,
            venda_new = dados.preco_venda,
            margem_ant = preco_db.margem,
            margem_new = dados.margem,
            cod_func_alter = dados.cod_func_alter,
            data = datetime.now()
        )

        db.add(new_log)
        db.flush()

        preco_db.preco_custo = dados.preco_custo
        preco_db.preco_venda = dados.preco_venda
        preco_db.margem = dados.margem
        preco_db.dtalteracao = datetime.now()
        preco_db.cod_func_alter = dados.cod_func_alter

        db.commit()
        db.refresh(preco_db)

        return{
            "status": 200,
            "message": "Preço atualizado com sucesso",
            "success": True,
            "data": preco_db
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar o preço do produto {codproduto}. ERRO => {str(e)}")

#Ajustar o LOG de exclusão
def delete_product(db: Session, codproduto: int): 
    try:
        produto_db = db.query(models.Produto).filter(models.Produto.codproduto == codproduto).first()

        if not produto_db:
            return {
                "status": 404,
                "message": "Produto não encontrado",
                "success": False
            }

        id_preco = produto_db.codpreco

        db.delete(produto_db)  
        db.flush()

        if id_preco:
            db.query(models.Preco).filter(models.Preco.codpreco == id_preco).delete()
            db.flush()

        db.commit()

        return {
            "status": 200,
            "message": "Produto excluído com sucesso",
            "success": True
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao excluir o produto. ERRO => {str(e)}")

def get_photo_by_product_id(codproduto: int, db: Session):
    produto_db = db.query(models.Produto).filter(models.Produto.codproduto == codproduto).first()

    if not produto_db:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    
    if not produto_db.diretorio_foto:
        raise HTTPException(status_code=404, detail="Produto não possui foto cadastrada.")
    
    caminho = produto_db.diretorio_foto
    caminho_absoluto = Path.cwd() / caminho

    pasta_imagens = Path.cwd() / DIRETORIO_FOTO
    if not pasta_imagens.exists():
        pasta_imagens.mkdir(parents=True, exist_ok=True)
        raise HTTPException(status_code=404, detail="A imagem física não foi encontrada no servidor.")

    if not caminho_absoluto.is_file():
        raise HTTPException(
            status_code=404, 
            detail=f"Arquivo não encontrado no servidor. (Procurado em: {caminho_absoluto})"
        )
    

    try:
        return FileResponse(caminho)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar imagem do produto. ERRO => {str(e)}")