from pydantic import BaseModel, Field, constr
from datetime import datetime
from typing import Literal, Optional
from decimal import Decimal

class ProdutoCreate(BaseModel):
    #Campos PWPRODUTO
    produto: str = Field(..., max_length=255)
    sku: str = Field(..., max_length=20)
    embalagem: str = Field(..., max_length=255)
    unidade: str = Field(..., max_length=10)
    gtin: str = Field(..., max_length=3)
    ean: str = Field(..., max_length=13)
    status: Literal['A', 'I']
    obs: Optional[str] = Field(None, max_length=255)
    codfornecedor: int 
    codcategoria: int
    
    #Campos PWTABPR
    custo: Decimal
    preco_venda: Decimal
    margem: Decimal

class ProdutoLogCreate(BaseModel):
    codproduto: int
    tipo: str = Field(..., max_length=20)
    valor_ant: Optional[str] = Field(None, max_length=255)
    valor_new: Optional[str] = Field(None, max_length=255)
    obs: Optional[str] = Field(None, max_length=255)
    cod_func_alter: int

class ProdutoUpdate(BaseModel):
    produto: str = Field(..., max_length=255)
    sku: str = Field(..., max_length=20)
    embalagem: str = Field(..., max_length=255)
    unidade: str = Field(..., max_length=10)
    gtin: str = Field(..., max_length=3)
    ean: str = Field(..., max_length=13)
    status: Literal['A', 'I']
    obs: Optional[str] = Field(None, max_length=255)
    codfornecedor: int 
    codcategoria: int

class PrecoUpdate(BaseModel):
    preco_custo: Decimal
    preco_venda: Decimal
    margem: Decimal
    cod_func_alter: int

class PrecoLogCreate(BaseModel):
    codproduto: int 
    codpreco: int
    custo_ant: Decimal
    custo_new: Decimal
    venda_ant: Decimal
    venda_new: Decimal
    margem_ant: Decimal
    margem_new: Decimal
    cod_func_alter: int
    data: datetime