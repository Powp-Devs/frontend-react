from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from decimal import Decimal

from . import schemas, models 
from app.modules.products import models as products_models

def create_stock(db: Session, dados: schemas.EstoqueCreate):
    if dados.estoque < 0:
        raise HTTPException(status_code=422, detail="Não pode existir estoque negativo")

    if dados.estoque_minimo is None:
        raise HTTPException(status_code=422, detail="O campo de estoque mínimo não pode ser nulo")

    estoque_reservado = dados.estoque_reservado if dados.estoque_reservado is not None else 0
    estoque_bloqueado = dados.estoque_bloqueado if dados.estoque_bloqueado is not None else 0
    
    product_db = db.query(products_models.Produto).filter(products_models.Produto.codproduto == dados.codproduto).first()

    if not product_db:
        raise HTTPException(status_code=404, detail="Produto não encontrado no sistema, verifique o código.")
    
    estoque_db = db.query(models.Estoque).filter(models.Estoque.codproduto == dados.codproduto).first()
    if estoque_db:
        raise HTTPException(status_code=409, detail="Produto já tem estoque cadastrado.")

    try: 
        new_stock = models.Estoque(
            codproduto=dados.codproduto,
            estoque=dados.estoque,
            estoque_minimo=dados.estoque_minimo,
            estoque_reservado=estoque_reservado,
            estoque_bloqueado=estoque_bloqueado,
            data_cadastro=datetime.now(),
            data_ultent=datetime.now(),
            obs=dados.obs
        )

        db.add(new_stock)
        db.flush()
        db.commit()
        db.refresh(new_stock)

        return {
            "status": 201,
            "message": "Estoque do produto cadastrado com sucesso",
            "data": new_stock
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao cadastrar o estoque do produto no sistema. ERRO => {str(e)}")


def _get_stock_or_404(db: Session, codproduto: int):
    estoque_db = db.query(models.Estoque).filter(models.Estoque.codproduto == codproduto).first()
    if not estoque_db:
        raise HTTPException(status_code=404, detail="Estoque do item não encontrado")
    return estoque_db


def list_stock(db: Session, page: int = 1, per_page: int = 10):
    offset = (page - 1) * per_page
    total = db.query(models.Estoque).count()
    estoques = db.query(models.Estoque).offset(offset).limit(per_page).all()

    return {
        "status": 200,
        "message": "Listagem de estoque cadastrados",
        "data": estoques,
        "total": total,
        "page": page,
        "per_page": per_page
    }


def get_stock_by_product(db: Session, codproduto: int):
    estoque_db = _get_stock_or_404(db=db, codproduto=codproduto)
    return {
        "status": 200,
        "message": "Estoque do produto encontrado com sucesso",
        "data": estoque_db
    }


def update_stock(db: Session, codproduto: int, usuario_logado_id: int, dados: schemas.EstoqueUpdate):
    estoque_db = db.query(models.Estoque).filter(models.Estoque.codproduto == codproduto).first()
    if not estoque_db:
        raise HTTPException(status_code=404, detail="Estoque do item não encontrado")

    try:
        if dados.estoque is not None and dados.estoque != estoque_db.estoque:
            if dados.estoque < 0:
                raise HTTPException(status_code=422, detail="Não pode existir estoque negativo")
            
            diferenca = dados.estoque - estoque_db.estoque
            tipo_movimento = 'E' if diferenca > 0 else 'S'
            quantidade_movimentada = abs(diferenca)

            estoque_db.estoque = dados.estoque

            log_movimentacao = models.MovimentacaoEstoque(
                data=datetime.now(),
                codproduto=codproduto,
                tipo_mov=tipo_movimento,
                quantidade=quantidade_movimentada,
                obs=dados.obs or "Atualização manual de estoque",
                codfuncmov=usuario_logado_id
            )
            db.add(log_movimentacao)

        if dados.estoque_minimo is not None:
            estoque_db.estoque_minimo = dados.estoque_minimo

        if dados.estoque_reservado is not None:
            estoque_db.estoque_reservado = dados.estoque_reservado

        if dados.estoque_bloqueado is not None:
            estoque_db.estoque_bloqueado = dados.estoque_bloqueado

        if dados.obs is not None:
            estoque_db.obs = dados.obs

        estoque_db.data_ultent = datetime.now()

        db.commit()
        db.refresh(estoque_db)

        return {
            "status": 200,
            "message": "Estoque do produto atualizado com sucesso",
            "data": estoque_db
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar o estoque do produto. ERRO => {str(e)}")


def delete_stock(db: Session, codproduto: int):
    estoque_db = db.query(models.Estoque).filter(models.Estoque.codproduto == codproduto).first()
    if not estoque_db:
        raise HTTPException(status_code=404, detail="Estoque do item não encontrado")

    try:
        db.delete(estoque_db)
        db.commit()
        return {
            "status": 200,
            "message": "Estoque do produto excluído com sucesso"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao excluir o estoque do produto. ERRO => {str(e)}")


def validar_estoque_item(db, codproduto: int):
    estoque_db = _get_stock_or_404(db=db, codproduto=codproduto)

    try:
        estoque_reservado = estoque_db.estoque_reservado or 0
        estoque_bloqueado = estoque_db.estoque_bloqueado or 0
        estoque = estoque_db.estoque or 0

        return estoque - estoque_reservado - estoque_bloqueado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao consultar estoque do produto. ERRO => {str(e)}")
    
def update_stock_for_orders(db: Session, dados: schemas.EstoqueUpdateToOrder):
    estoque_db = db.query(models.Estoque).filter(models.Estoque.codproduto == dados.codproduto).first()
    
    if not estoque_db:
         raise HTTPException(status_code=404, detail=f"Produto {dados.codproduto} não possui controle de estoque.")

    estoque_disponivel = validar_estoque_item(db, dados.codproduto)
    if estoque_disponivel < dados.quantidade_vendida:
        raise HTTPException(status_code=400, detail=f"Estoque insuficiente para o produto {dados.codproduto}.")

    try:
        estoque_db.estoque -= dados.quantidade_vendida
        estoque_db.data_ultent = datetime.now()

        log_venda = models.MovimentacaoEstoque(
            data=datetime.now(),
            codproduto=dados.codproduto,
            tipo_mov='S',
            quantidade=dados.quantidade_vendida,
            obs=f"Baixa automática - Pedido de Venda nº {dados.codpedido}",
            codfuncmov=dados.usuario_logado_id
        )
        db.add(log_venda)
        db.flush() 

    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Erro ao baixar estoque do item {dados.codproduto}. ERRO: {str(e)}")

def create_log_stock(db: Session, dados: schemas.MovimentacaoCreate):
    if dados.quantidade <= 0:
        raise HTTPException(status_code=400, detail="Não é possível movimentar 0 ou quantidades negativas")
    
    estoque_db = db.query(models.Estoque).filter(models.Estoque.codproduto == dados.codproduto).first()
    
    try:
        new_movimentacao = models.MovimentacaoEstoque(
            data = datetime.now(),
            codproduto = dados.codproduto,
            tipo_mov = dados.tipo_mov,
            quantidade = dados.quantidade,
            obs = dados.obs,
            codfuncmov = dados.codfuncmov
        )

        db.add(new_movimentacao)
        db.commit()
        db.refresh(new_movimentacao)

        return {
            "status": 200,
            "message": "Log gravado com sucesso"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gravar a movimentação do estoque. ERRO => {str(e)}")