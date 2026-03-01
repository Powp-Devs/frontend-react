import React, { useEffect, useState } from 'react';
import { clienteService } from '@/services/clienteService';
import { Cliente } from '@/types/index.d';
import '../styles/cadastroCliente.css';

const CadastroCliente: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<Partial<Cliente>>({
    cliente: '',
    fantasia: '',
    email: '',
    cnpj: '',
    cpf: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement pagination if needed
      // const response = await clienteService.listar();
      // setClientes(response.data);
      console.log('Carregando clientes...');
    } catch (err) {
      setError('Falha ao carregar clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim()) {
      try {
        // const response = await clienteService.buscar(term);
        // setClientes(response.data || []);
        console.log('Buscando:', term);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
      }
    } else {
      loadClientes();
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // await clienteService.atualizar(editingId, formData);
        console.log('Atualizando cliente:', editingId, formData);
      } else {
        // await clienteService.criar(formData as Omit<Cliente, 'id'>);
        console.log('Criando cliente:', formData);
      }
      resetForm();
      loadClientes();
    } catch (err) {
      setError('Erro ao salvar cliente');
      console.error(err);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setFormData(cliente);
    setEditingId(cliente.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
      try {
        // await clienteService.deletar(id);
        console.log('Deletando cliente:', id);
        await loadClientes();
      } catch (err) {
        setError('Erro ao deletar cliente');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      cliente: '',
      fantasia: '',
      email: '',
      cnpj: '',
      cpf: '',
      telefone: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="cadastro-cliente">
      <h1>Cadastro de Clientes</h1>

      {error && <div className="error-message">{error}</div>}

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          placeholder="Pesquisar clientes..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            flex: 1,
            minWidth: '250px',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'background 0.3s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = '#229954')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = '#27ae60')
          }
        >
          + Novo Cliente
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: '#fff',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <input
              type="text"
              name="cliente"
              placeholder="Nome do Cliente *"
              value={formData.cliente || ''}
              onChange={handleFormChange}
              required
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <input
              type="text"
              name="fantasia"
              placeholder="Nome Fantasia"
              value={formData.fantasia || ''}
              onChange={handleFormChange}
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={formData.email || ''}
              onChange={handleFormChange}
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <input
              type="text"
              name="cnpj"
              placeholder="CNPJ"
              value={formData.cnpj || ''}
              onChange={handleFormChange}
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <input
              type="text"
              name="cpf"
              placeholder="CPF"
              value={formData.cpf || ''}
              onChange={handleFormChange}
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <input
              type="tel"
              name="telefone"
              placeholder="Telefone"
              value={formData.telefone || ''}
              onChange={handleFormChange}
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <input
              type="text"
              name="endereco"
              placeholder="Endereço"
              value={formData.endereco || ''}
              onChange={handleFormChange}
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <input
              type="text"
              name="cidade"
              placeholder="Cidade"
              value={formData.cidade || ''}
              onChange={handleFormChange}
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <input
              type="text"
              name="estado"
              placeholder="Estado"
              value={formData.estado || ''}
              onChange={handleFormChange}
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <input
              type="text"
              name="cep"
              placeholder="CEP"
              value={formData.cep || ''}
              onChange={handleFormChange}
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1.5rem',
            }}
          >
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'background 0.3s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = '#2980b9')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = '#3498db')
              }
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'background 0.3s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = '#7f8c8d')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = '#95a5a6')
              }
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#888' }}>Carregando...</p>
      ) : clientes.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>
          Nenhum cliente encontrado.
        </p>
      ) : (
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}
          >
            <thead
              style={{
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid #ddd',
              }}
            >
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Nome</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>E-mail</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Telefone</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  style={{
                    borderBottom: '1px solid #eee',
                    transition: 'background-color 0.3s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#f9f9f9')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = '#fff')
                  }
                >
                  <td style={{ padding: '1rem' }}>{cliente.id}</td>
                  <td style={{ padding: '1rem' }}>{cliente.cliente}</td>
                  <td style={{ padding: '1rem' }}>{cliente.email}</td>
                  <td style={{ padding: '1rem' }}>{cliente.telefone}</td>
                  <td
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      display: 'flex',
                      gap: '0.5rem',
                      justifyContent: 'center',
                    }}
                  >
                    <button
                      onClick={() => handleEdit(cliente)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'background 0.3s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = '#2980b9')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = '#3498db')
                      }
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'background 0.3s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = '#c0392b')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = '#e74c3c')
                      }
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CadastroCliente;

