from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, File, UploadFile, Form

from . import schemas, services
from app.core.database import get_db
from app.core.security import get_current_user

router = APIRouter(prefix="/produtos", tags=["Rotas de Produtos e Precificação"])

@router.get("/listar")
def listar_produtos(page: int = 1, per_page: int = 10, db: Session = Depends(get_db), usuario_logado: dict = Depends(get_current_user)):
    return services.getProduct_paginate(db=db, page=page, per_page=per_page)

@router.get("/buscar/{codproduto}", summary="Rota para buscar um produto específico.")
def buscar_produto(codproduto: int, db: Session = Depends(get_db), usuario_logado: dict = Depends(get_current_user)):
    return services.get_product_by_id(codproduto, db)

@router.get("/imagem/{codproduto}", summary="Rota para buscar a imagem do produto.", description="Rota para buscar a imagem do produto. O sistema irá retornar o caminho da imagem do produto, caso exista, ou uma imagem padrão caso o produto não tenha uma foto cadastrada.")
def buscar_imagem(codproduto: int, db: Session = Depends(get_db), usuario_logado: dict = Depends(get_current_user)):
    return services.get_photo_by_product_id(codproduto, db)

@router.post("/cadastrar", summary="Rota para realizar o cadastro.", description="Rota para cadastrar os dados de um produto junto com a sua precificação inicial")
def cadastrar_product(produto: schemas.ProdutoCreate, db: Session = Depends(get_db), usuario_logado: dict = Depends(get_current_user)):
    return services.create_product(db=db, dados=produto)

@router.put("/atualizar/{codproduto}", summary="Rota para atualizar um produto", description="Rota para atualizar os dados cadastrais de um cadastro do produto no sistema")
def atualizar_produto(codproduto: int, dados: schemas.ProdutoUpdate, db: Session = Depends(get_db), usuario_logado: dict = Depends(get_current_user)):
    return services.update_product(db=db, codproduto=codproduto, dados=dados)

@router.put("/atualizar/preco/{codproduto}", summary="Rota para atualizar o preço do produto", description="Está rota atualiza o preço do produto e grava todo o LOG de alteração do mesmo.")
def atualizar_preco(codproduto: int, dados: schemas.PrecoUpdate, db: Session = Depends(get_db), usuario_logado: dict = Depends(get_current_user)):
    return services.update_price(codproduto=codproduto, dados=dados, db=db)

@router.delete("/excluir/{codproduto}", summary="Rota para excluir produto", description="Está rota faz com que chame uma função que exclui o item do sistema junto com a sua precificação. Esta rota será temporária!!!")
def excluir_prod(codproduto: int, db: Session = Depends(get_db), usuario_logado: dict = Depends(get_current_user)):
    return services.delete_product(db=db, codproduto=codproduto)