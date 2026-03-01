import React, { useState, useEffect } from 'react';
import { Venda, Cliente } from '../../types';
import { vendaService } from '../../services/vendaService';
import { clienteService } from '../../services/clienteService';

const PedidoVenda: React.FC = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenda, setEditingVenda] = useState<Venda | null>(null);
  const [formData, setFormData] = useState<Partial<Venda>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchVendas();
    fetchClientes();
  }, [currentPage]);

  const fetchVendas = async () => {
    setLoading(true);
    try {
      const response = await vendaService.listar(currentPage, itemsPerPage);
      setVendas(response.data);
    } catch (error) {
      console.error('Erro ao buscar vendas', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await clienteService.listar(1, 1000);
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'valor' ? parseFloat(value) : name === 'clienteId' ? parseInt(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingVenda) {
        await vendaService.atualizar(editingVenda.id, formData);
      } else {
        await vendaService.criar(formData as Omit<Venda, 'id'>);
      }
      
      fetchVendas();
      setIsModalOpen(false);
      setEditingVenda(null);
      setFormData({});
    } catch (err) {
      console.error('Erro ao salvar venda', err);
    }
  };

  const handleEdit = (venda: Venda) => {
    setEditingVenda(venda);
    setFormData(venda);
    setIsModalOpen(true);
  };

  const handleCancelar = async (id: number) => {
    if (window.confirm('Deseja cancelar esta venda?')) {
      try {
        await vendaService.cancelar(id);
        fetchVendas();
      } catch (err) {
        console.error('Erro ao cancelar venda', err);
      }
    }
  };

  const handleOpenNewModal = () => {
    setEditingVenda(null);
    setFormData({ status: 'pendente' });
    setIsModalOpen(true);
  };

  const getNomeCliente = (clienteId: number) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.cliente || 'Cliente desconhecido';
  };

  return (
    <div className="container">
      <h1>Gestão de Vendas</h1>
      <button onClick={handleOpenNewModal} className="btn btn-primary">
        Nova Venda
      </button>

      {loading && <p>Carregando...</p>}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {vendas.map(venda => (
            <tr key={venda.id}>
              <td>{venda.id}</td>
              <td>{getNomeCliente(venda.clienteId)}</td>
              <td>{new Date(venda.data).toLocaleDateString('pt-BR')}</td>
              <td>R$ {venda.valor.toFixed(2)}</td>
              <td>
                <span className={`badge badge-${venda.status}`}>
                  {venda.status}
                </span>
              </td>
              <td>
                <button onClick={() => handleEdit(venda)} className="btn btn-sm btn-secondary">
                  Editar
                </button>
                <button 
                  onClick={() => handleCancelar(venda.id)} 
                  className="btn btn-sm btn-warning"
                >
                  Cancelar
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
              <h2>{editingVenda ? 'Editar Venda' : 'Nova Venda'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Cliente:</label>
                <select 
                  name="clienteId" 
                  value={formData.clienteId || ''} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.cliente}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Data:</label>
                <input 
                  type="date"
                  name="data" 
                  value={formData.data || ''} 
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Valor:</label>
                <input 
                  type="number"
                  step="0.01"
                  name="valor" 
                  value={formData.valor || ''} 
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status:</label>
                <select 
                  name="status" 
                  value={formData.status || 'pendente'} 
                  onChange={handleInputChange}
                >
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="entregue">Entregue</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div className="form-group">
                <label>Observações:</label>
                <textarea 
                  name="observacoes" 
                  value={formData.observacoes || ''} 
                  onChange={e => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
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

export default PedidoVenda;
