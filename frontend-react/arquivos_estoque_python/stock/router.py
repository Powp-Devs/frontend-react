from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status

from . import schemas, services
from app.core.database import get_db
from app.core.security import get_current_user

router = APIRouter(prefix="/estoque", tags=["Rotas de estoque dos produtos"])

@router.get("/listar", summary="Listar registros de estoque cadastrados")
def listar_estoque(page: int = 1, per_page: int = 10, db: Session = Depends(get_db), usuario_logado: dict = Depends(get_current_user)):
    return services.list_stock(db=db, page=page, per_page=per_page)

@router.get("/buscar/{codproduto}", summary="Buscar estoque por código do produto")
def buscar_estoque(codproduto: int, db: Session = Depends(get_db), usuario_logado: dict = Depends(get_current_user)):
    return services.get_stock_by_product(db=db, codproduto=codproduto)

@router.get("/validar/{codproduto}", summary="Validar estoque disponível do produto")
def validar_estoque(codproduto: int, db: Session = Depends(get_db), usuario_logado: dict = Depends(get_current_user)):
    estoque_disponivel = services.validar_estoque_item(db=db, codproduto=codproduto)
    return {
        "status": 200,
        "message": "Estoque disponível calculado com sucesso",
        "codproduto": codproduto,
        "estoque_disponivel": estoque_disponivel,
    }

@router.post("/cadastrar", summary="Rota para cadastrar o estoque no sistema do item.")
def cadastrar_estoque(dados: schemas.EstoqueCreate, db: Session = Depends(get_db), usuario_logado: dict = Depends(get_current_user)):
    return services.create_stock(db=db, dados=dados)

@router.put("/atualizar/{codproduto}", summary="Atualizar estoque do produto")
def atualizar_estoque(codproduto: int, usuario_logado_id: int, dados: schemas.EstoqueUpdate, db: Session = Depends(get_db), usuario_logado: dict = Depends(get_current_user)):
    return services.update_stock(db=db, usuario_logado_id=usuario_logado_id, codproduto=codproduto, dados=dados)

@router.delete("/excluir/{codproduto}", status_code=status.HTTP_200_OK, summary="Excluir estoque do produto")
def excluir_estoque(codproduto: int, db: Session = Depends(get_db), usuario_logado: dict = Depends(get_current_user)):
    return services.delete_stock(db=db, codproduto=codproduto)