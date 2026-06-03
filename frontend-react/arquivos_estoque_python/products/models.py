from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Produto(Base):
    __tablename__ = "pwproduto"

    codproduto = Column(Integer, primary_key=True, index=True)

    produto = Column(String(255), nullable=False)
    sku = Column(String(20), nullable=False)
    embalagem = Column(String(20), nullable=False)
    unidade = Column(String(10), nullable=False)
    ean = Column(String(20), nullable=False)
    gtin = Column(String(10), nullable=False)
    status = Column(String(1), default="A", nullable=False)
    obs = Column(String(255))
    diretorio_foto = Column(String(255))
    dtcadastro = Column(DateTime, default=datetime.now(), nullable=False)
    dtalteracao = Column(DateTime, nullable=True)

    codfornecedor = Column(Integer, ForeignKey("pwfornecedor.codfornecedor"), nullable=False)
    codcategoria = Column(Integer, ForeignKey("pwcategoria.codcategoria"), nullable=False)
    codpreco = Column(Integer, ForeignKey("pwtabpr.codpreco"))

class ProdutoLog(Base):
    __tablename__ = "pwlogproduto"
    
    cod_logproduto = Column(Integer, primary_key=True, index=True)

    data = Column(DateTime, default=datetime.now())
    codproduto = Column(Integer, nullable=False)
    tipo = Column(String(20), nullable=False)
    campo = Column(String(100), nullable=True)
    valor_ant = Column(String(255), nullable=True)
    valor_new = Column(String(255), nullable=True)
    obs = Column(String(255), nullable=True)
    cod_func_alter = Column(Integer)
    

class Preco(Base):
    __tablename__ = "pwtabpr"

    codpreco = Column(Integer, primary_key=True, index=True)

    #codproduto = Column(Integer, ForeignKey("pwproduto.codproduto"))
    preco_custo = Column(Numeric(12,2), nullable=False)
    preco_venda = Column(Numeric(12,2), nullable=False)
    margem = Column(Numeric(12,2), nullable=False)
    
    dtcadastro = Column(DateTime, default=datetime.now, nullable=False)
    dtalteracao = Column(DateTime, nullable=True)
    cod_func_alter = Column(Integer, nullable=True)

class PrecoLog(Base):
    __tablename__ = "pwtabpr_log"

    codLog = Column(Integer, primary_key=True, index=True)

    codproduto = Column(Integer)
    codpreco = Column(Integer)
    custo_ant = Column(Numeric(12,2))
    custo_new = Column(Numeric(12,2))
    venda_ant = Column(Numeric(12,2))
    venda_new = Column(Numeric(12,2))
    margem_ant = Column(Numeric(12,2))
    margem_new = Column(Numeric(12,2))
    cod_func_alter = Column(Integer)
    
    data = Column(DateTime, default=datetime.now)