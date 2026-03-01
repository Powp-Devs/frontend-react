import React, { useState, useEffect } from 'react';
import { Lancamento } from '../../types';
import { lancamentoService } from '../../services/lancamentoService';

const NovoLancamento: React.FC = () => {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<Lancamento | null>(null);
  const [formData, setFormData] = useState<Partial<Lancamento>>({
    tipo: 'despesa'
  });

  useEffect(() => {
    fetchLancamentos();
  }, []);

  const fetchLancamentos = async () => {
    setLoading(true);
    try {
      const response = await lancamentoService.listar(1, 100);
      setLancamentos(response.data);
    } catch (error) {
      console.error('Erro ao buscar lançamentos', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor' ? parseFloat(value) : name === 'pago' ? value === 'true' : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingLancamento) {
        await lancamentoService.atualizar(editingLancamento.id, formData);
      } else {
        await lancamentoService.criar(formData as Omit<Lancamento, 'id'>);
      }

      fetchLancamentos();
      setIsModalOpen(false);
      setEditingLancamento(null);
      setFormData({ tipo: 'despesa' });
    } catch (err) {
      console.error('Erro ao salvar lançamento', err);
    }
  };

  const handleEdit = (lancamento: Lancamento) => {
    setEditingLancamento(lancamento);
    setFormData(lancamento);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deseja deletar este lançamento?')) {
      try {
        await lancamentoService.deletar(id);
        fetchLancamentos();
      } catch (err) {
        console.error('Erro ao deletar lançamento', err);
      }
    }
  };

  const handleOpenNewModal = () => {
    setEditingLancamento(null);
    setFormData({ tipo: 'despesa' });
    setIsModalOpen(true);
  };

  const receitas = lancamentos.filter(l => l.tipo === 'receita').reduce((sum, l) => sum + l.valor, 0);
  const despesas = lancamentos.filter(l => l.tipo === 'despesa').reduce((sum, l) => sum + l.valor, 0);

  return (
    <div className="container">
      <h1>Lançamentos Financeiros</h1>

      <div className="lancamento-resumo">
        <div className="resumo-card positivo">
          <h3>Total Receitas</h3>
          <p>R$ {receitas.toFixed(2)}</p>
        </div>
        <div className="resumo-card negativo">
          <h3>Total Despesas</h3>
          <p>R$ {despesas.toFixed(2)}</p>
        </div>
        <div className={`resumo-card ${receitas - despesas >= 0 ? 'positivo' : 'negativo'}`}>
          <h3>Saldo</h3>
          <p>R$ {(receitas - despesas).toFixed(2)}</p>
        </div>
      </div>

      <button onClick={handleOpenNewModal} className="btn btn-primary">
        Novo Lançamento
      </button>

      {loading && <p>Carregando...</p>}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Data</th>
            <th>Categoria</th>
            <th>Pago</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {lancamentos.map(lancamento => (
            <tr key={lancamento.id} className={lancamento.tipo}>
              <td>{lancamento.id}</td>
              <td>{lancamento.descricao}</td>
              <td>
                <span className={`badge badge-${lancamento.tipo}`}>
                  {lancamento.tipo === 'receita' ? 'Receita' : 'Despesa'}
                </span>
              </td>
              <td>R$ {lancamento.valor.toFixed(2)}</td>
              <td>{new Date(lancamento.data).toLocaleDateString('pt-BR')}</td>
              <td>{lancamento.categoria}</td>
              <td>
                {lancamento.pago ? (
                  <span className="badge-success">Pago</span>
                ) : (
                  <span className="badge-warning">Pendente</span>
                )}
              </td>
              <td>
                <button onClick={() => handleEdit(lancamento)} className="btn btn-sm btn-secondary">
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(lancamento.id)} 
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
              <h2>{editingLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Descrição:</label>
                <input 
                  name="descricao" 
                  value={formData.descricao || ''} 
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipo:</label>
                <select 
                  name="tipo" 
                  value={formData.tipo || 'despesa'} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
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
                <label>Categoria:</label>
                <input 
                  name="categoria" 
                  value={formData.categoria || ''} 
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Observações:</label>
                <textarea 
                  name="observacoes" 
                  value={formData.observacoes || ''} 
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group checkbox">
                <input 
                  type="checkbox"
                  name="pago" 
                  checked={formData.pago || false} 
                  onChange={(e) => setFormData(prev => ({ ...prev, pago: e.target.checked }))}
                />
                <label>Pago</label>
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

export default NovoLancamento;
