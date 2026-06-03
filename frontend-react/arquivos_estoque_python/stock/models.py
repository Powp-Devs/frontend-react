from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base

class Estoque(Base):
    __tablename__ = "pwestoque"

    codestoque = Column(Integer, primary_key=True, index=True)

    codproduto = Column(Integer, ForeignKey("pwproduto.codproduto"))
    estoque = Column(Numeric(12,2), nullable=False)
    estoque_minimo = Column(Numeric(12,2), nullable=False, default=0)
    estoque_reservado = Column(Numeric(12,2), nullable=False, default=0)
    estoque_bloqueado = Column(Numeric(12,2), nullable=False, default=0)
    data_cadastro = Column(DateTime)
    data_ultent = Column(DateTime)
    obs = Column(Text, nullable=True)

class MovimentacaoEstoque(Base):
    __tablename__ = "pwmovestoque"

    codmov = Column(Integer, primary_key=True, index=True)
    data = Column(DateTime)
    codproduto = Column(Integer, ForeignKey("pwproduto.codproduto"))
    tipo_mov = Column(String(1), nullable=False)
    quantidade = Column(Numeric(12,2), nullable=False)
    obs = Column(Text, nullable=True)
    codfuncmov = Column(Integer, nullable=False)


'''
Tipo de movimentação:
E = Entrada
S = Saida
'''