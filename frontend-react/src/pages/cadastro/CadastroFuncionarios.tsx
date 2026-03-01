import React, { useState, useEffect } from 'react';
import { Funcionario } from '../../types';
import { funcionarioService } from '../../services/funcionarioService';

const CadastroFuncionarios: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
  const [formData, setFormData] = useState<Partial<Funcionario>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchFuncionarios();
  }, [currentPage]);

  const fetchFuncionarios = async () => {
    setLoading(true);
    try {
      const response = await funcionarioService.listar(currentPage, itemsPerPage);
      setFuncionarios(response.data);
    } catch (error) {
      console.error('Erro ao buscar funcionários', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'salario' ? parseFloat(value) : value 
    }));
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
      if (editingFuncionario) {
        await funcionarioService.atualizar(editingFuncionario.id, formData);
      } else {
        await funcionarioService.criar(formData as Omit<Funcionario, 'id'>);
      }
      
      fetchFuncionarios();
      setIsModalOpen(false);
      setEditingFuncionario(null);
      setFormData({});
    } catch (err) {
      console.error('Erro ao salvar funcionário', err);
    }
  };

  const handleEdit = (funcionario: Funcionario) => {
    setEditingFuncionario(funcionario);
    setFormData(funcionario);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja realmente deletar este funcionário?')) {
      try {
        await funcionarioService.deletar(id);
        fetchFuncionarios();
      } catch (err) {
        console.error('Erro ao deletar funcionário', err);
      }
    }
  };

  const handleOpenNewModal = () => {
    setEditingFuncionario(null);
    setFormData({});
    setIsModalOpen(true);
  };

  return (
    <div className="container">
      <h1>Gerenciamento de Funcionários</h1>
      <button onClick={handleOpenNewModal} className="btn btn-primary">
        Novo Funcionário
      </button>

      {loading && <p>Carregando...</p>}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>CPF</th>
            <th>E-mail</th>
            <th>Cargo</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.map(funcionario => (
            <tr key={funcionario.id}>
              <td>{funcionario.id}</td>
              <td>{funcionario.nome}</td>
              <td>{funcionario.cpf}</td>
              <td>{funcionario.email}</td>
              <td>{funcionario.cargo}</td>
              <td>{funcionario.telefone}</td>
              <td>
                <button onClick={() => handleEdit(funcionario)} className="btn btn-sm btn-secondary">
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(funcionario.id)} 
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
              <h2>{editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
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
                <label>CPF:</label>
                <input 
                  name="cpf" 
                  value={formData.cpf || ''} 
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
                <label>Cargo:</label>
                <input 
                  name="cargo" 
                  value={formData.cargo || ''} 
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Salário:</label>
                <input 
                  type="number"
                  step="0.01"
                  name="salario" 
                  value={formData.salario || ''} 
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

              <div className="form-group">
                <label>Data de Admissão:</label>
                <input 
                  type="date"
                  name="dataAdmissao" 
                  value={formData.dataAdmissao || ''} 
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

export default CadastroFuncionarios;
