import React, { useState, useEffect } from 'react';
import { Produto } from '../../types';
import { produtoService } from '../../services/produtoService';

const CadastroProdutos: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState<Partial<Produto>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProdutos();
  }, [currentPage]);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const response = await produtoService.listar(currentPage, itemsPerPage);
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'preco' || name === 'quantidade' ? parseFloat(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduto) {
        await produtoService.atualizar(editingProduto.id, formData);
      } else {
        await produtoService.criar(formData as Omit<Produto, 'id'>);
      }
      
      fetchProdutos();
      setIsModalOpen(false);
      setEditingProduto(null);
      setFormData({});
    } catch (err) {
      console.error('Erro ao salvar produto', err);
    }
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData(produto);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente deletar este produto?')) {
      try {
        await produtoService.deletar(id);
        fetchProdutos();
      } catch (err) {
        console.error('Erro ao deletar produto', err);
      }
    }
  };

  const handleOpenNewModal = () => {
    setEditingProduto(null);
    setFormData({});
    setIsModalOpen(true);
  };

  return (
    <div className="container">
      <h1>Gerenciamento de Produtos</h1>
      <button onClick={handleOpenNewModal} className="btn btn-primary">
        Novo Produto
      </button>

      {loading && <p>Carregando...</p>}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Preço</th>
            <th>Quantidade</th>
            <th>SKU</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map(produto => (
            <tr key={produto.id}>
              <td>{produto.id}</td>
              <td>{produto.nome}</td>
              <td>{produto.descricao}</td>
              <td>R$ {produto.preco.toFixed(2)}</td>
              <td>{produto.quantidade}</td>
              <td>{produto.sku}</td>
              <td>
                <button onClick={() => handleEdit(produto)} className="btn btn-sm btn-secondary">
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(produto.id)} 
                  className="btn btn-sm btn-danger"
                >
                  Deletar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome:</label>
                <input 
                  name="nome" 
                  value={formData.nome || ''} 
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição:</label>
                <textarea 
                  name="descricao" 
                  value={formData.descricao || ''} 
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Preço:</label>
                <input 
                  type="number"
                  step="0.01"
                  name="preco" 
                  value={formData.preco || ''} 
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Quantidade:</label>
                <input 
                  type="number"
                  name="quantidade" 
                  value={formData.quantidade || ''} 
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>SKU:</label>
                <input 
                  name="sku" 
                  value={formData.sku || ''} 
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Salvar
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CadastroProdutos;
