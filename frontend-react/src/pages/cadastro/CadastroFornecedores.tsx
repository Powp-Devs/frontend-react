import React, { useState, useEffect } from 'react';
import { Fornecedor } from '../../types';
import { fornecedorService } from '../../services/fornecedorService';

const CadastroFornecedores: React.FC = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  const [formData, setFormData] = useState<Partial<Fornecedor>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchFornecedores();
  }, [currentPage]);

  const fetchFornecedores = async () => {
    setLoading(true);
    try {
      const response = await fornecedorService.listar(currentPage, itemsPerPage);
      setFornecedores(response.data);
    } catch (error) {
      console.error('Erro ao buscar fornecedores', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCepBlur = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          endereco: data.logradouro,
          cidade: data.localidade,
          estado: data.uf
        }));
      }
    } catch (err) {
      console.error('Erro ao buscar CEP', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingFornecedor) {
        await fornecedorService.atualizar(editingFornecedor.id, formData);
      } else {
        await fornecedorService.criar(formData as Omit<Fornecedor, 'id'>);
      }
      
      fetchFornecedores();
      setIsModalOpen(false);
      setEditingFornecedor(null);
      setFormData({});
    } catch (err) {
      console.error('Erro ao salvar fornecedor', err);
    }
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor);
    setFormData(fornecedor);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente deletar este fornecedor?')) {
      try {
        await fornecedorService.deletar(id);
        fetchFornecedores();
      } catch (err) {
        console.error('Erro ao deletar fornecedor', err);
      }
    }
  };

  const handleOpenNewModal = () => {
    setEditingFornecedor(null);
    setFormData({});
    setIsModalOpen(true);
  };

  return (
    <div className="container">
      <h1>Gerenciamento de Fornecedores</h1>
      <button onClick={handleOpenNewModal} className="btn btn-primary">
        Novo Fornecedor
      </button>

      {loading && <p>Carregando...</p>}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Razão Social</th>
            <th>CNPJ</th>
            <th>E-mail</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {fornecedores.map(fornecedor => (
            <tr key={fornecedor.id}>
              <td>{fornecedor.id}</td>
              <td>{fornecedor.razaoSocial}</td>
              <td>{fornecedor.cnpj}</td>
              <td>{fornecedor.email}</td>
              <td>{fornecedor.telefone}</td>
              <td>
                <button onClick={() => handleEdit(fornecedor)} className="btn btn-sm btn-secondary">
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(fornecedor.id)} 
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
              <h2>{editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Razão Social:</label>
                <input 
                  name="razaoSocial" 
                  value={formData.razaoSocial || ''} 
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nome Fantasia:</label>
                <input 
                  name="nomeFantasia" 
                  value={formData.nomeFantasia || ''} 
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>CNPJ:</label>
                <input 
                  name="cnpj" 
                  value={formData.cnpj || ''} 
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>E-mail:</label>
                <input 
                  type="email"
                  name="email" 
                  value={formData.email || ''} 
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Telefone:</label>
                <input 
                  name="telefone" 
                  value={formData.telefone || ''} 
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>CEP:</label>
                <input 
                  name="cep" 
                  value={formData.cep || ''} 
                  onChange={handleInputChange}
                  onBlur={(e) => handleCepBlur(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Endereço:</label>
                <input 
                  name="endereco" 
                  value={formData.endereco || ''} 
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Cidade:</label>
                <input 
                  name="cidade" 
                  value={formData.cidade || ''} 
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Estado:</label>
                <input 
                  name="estado" 
                  value={formData.estado || ''} 
                  onChange={handleInputChange}
                  maxLength={2}
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

export default CadastroFornecedores;
