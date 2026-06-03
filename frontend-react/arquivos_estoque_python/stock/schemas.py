from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal
from decimal import Decimal

class EstoqueCreate(BaseModel):
    codproduto: int
    estoque: Decimal
    estoque_minimo: Decimal
    estoque_reservado: Optional[Decimal] = 0
    estoque_bloqueado: Optional[Decimal] = 0
    obs: Optional[str] = Field(None, max_length=255)

class EstoqueUpdate(BaseModel):
    estoque: Optional[Decimal]
    estoque_minimo: Optional[Decimal]
    estoque_reservado: Optional[Decimal] = 0
    estoque_bloqueado: Optional[Decimal] = 0
    obs: Optional[str] = Field(None, max_length=255)

class MovimentacaoCreate(BaseModel):
    codproduto: int
    tipo_mov: str
    quantidade: Decimal
    obs: Optional[str]
    codfuncmov: int

class EstoqueUpdateToOrder(BaseModel):
    codproduto: int
    quantidade_vendida: Decimal
    codpedido: int
    usuario_logado_id: int