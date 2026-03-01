import React, { useState, useEffect } from 'react';
import { Estoque, Produto } from '../../types';

const ControleEstoque: React.FC = () => {
  const [estoque, setEstoque] = useState<Estoque[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEstoque, setEditingEstoque] = useState<Estoque | null>(null);
  const [formData, setFormData] = useState<Partial<Estoque>>({});
  const [filtroAlerta, setFiltroAlerta] = useState(false);

  useEffect(() => {
    fetchEstoque();
  }, []);

  const fetchEstoque = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/estoque');
      const data = await response.json();
      setEstoque(data.data);
    } catch (error) {
      console.error('Erro ao buscar estoque', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'quantidade' ? parseInt(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingEstoque ? 'PUT' : 'POST';
      const url = editingEstoque 
        ? `http://127.0.0.1:8000/api/estoque/${editingEstoque.id}`
        : 'http://127.0.0.1:8000/api/estoque';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchEstoque();
        setIsModalOpen(false);
        setEditingEstoque(null);
        setFormData({});
      }
    } catch (err) {
      console.error('Erro ao salvar estoque', err);
    }
  };

  const handleEdit = (item: Estoque) => {
    setEditingEstoque(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja deletar este item do estoque?')) {
      try {
        await fetch(`http://127.0.0.1:8000/api/estoque/${id}`, {
          method: 'DELETE'
        });
        fetchEstoque();
      } catch (err) {
        console.error('Erro ao deletar', err);
      }
    }
  };

  const estoqueAlerta = estoque.filter(item => item.quantidade < 10);
  const estoqueExibir = filtroAlerta ? estoqueAlerta : estoque;

  return (
    <div className="container">
      <h1>Controle de Estoque</h1>
      
      <div className="estoque-controls">
        <button onClick={() => { setEditingEstoque(null); setFormData({}); setIsModalOpen(true); }} 
          className="btn btn-primary">
          Adicionar Item
        </button>
        <button 
          onClick={() => setFiltroAlerta(!filtroAlerta)}
          className={`btn ${filtroAlerta ? 'btn-danger' : 'btn-secondary'}`}
        >
          {filtroAlerta ? `Exibindo Alertas (${estoqueAlerta.length})` : 'Mostrar Alertas'}
        </button>
      </div>

      {loading && <p>Carregando...</p>}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Produto ID</th>
            <th>Quantidade</th>
            <th>Localização</th>
            <th>Data Atualização</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {estoqueExibir.map(item => (
            <tr key={item.id} className={item.quantidade < 10 ? 'alerta' : ''}>
              <td>{item.id}</td>
              <td>{item.produtoId}</td>
              <td>
                <strong>{item.quantidade}</strong>
              </td>
              <td>{item.localizacao}</td>
              <td>{new Date(item.dataAtualizacao || '').toLocaleDateString('pt-BR')}</td>
              <td>
                {item.quantidade < 5 && <span className="badge-danger">Crítico</span>}
                {item.quantidade >= 5 && item.quantidade < 10 && <span className="badge-warning">Baixo</span>}
                {item.quantidade >= 10 && <span className="badge-success">OK</span>}
              </td>
              <td>
                <button onClick={() => handleEdit(item)} className="btn btn-sm btn-secondary">
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(item.id)} 
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
              <h2>{editingEstoque ? 'Editar Estoque' : 'Adicionar ao Estoque'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Produto ID:</label>
                <input 
                  type="number"
                  name="produtoId" 
                  value={formData.produtoId || ''} 
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
                <label>Localização:</label>
                <input 
                  name="localizacao" 
                  value={formData.localizacao || ''} 
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

export default ControleEstoque;
