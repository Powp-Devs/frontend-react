import React, { useState, useEffect } from 'react';
import { Lancamento } from '../../types';
import { lancamentoService } from '../../services/lancamentoService';

const DashboardFinanceiro: React.FC = () => {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    fetchDados();
  }, []);

  useEffect(() => {
    // Recalcular totais quando lancamentos mudam
    const receitas = lancamentos
      .filter(l => l.tipo === 'receita')
      .reduce((sum, l) => sum + l.valor, 0);
    
    const despesas = lancamentos
      .filter(l => l.tipo === 'despesa')
      .reduce((sum, l) => sum + l.valor, 0);

    setTotalReceitas(receitas);
    setTotalDespesas(despesas);
    setSaldo(receitas - despesas);
  }, [lancamentos]);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const response = await lancamentoService.listar(1, 100);
      setLancamentos(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados financeiros', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarPeriodo = async () => {
    if (!dataInicio || !dataFim) {
      alert('Selecione um período');
      return;
    }

    setLoading(true);
    try {
      const response = await lancamentoService.buscarPorPeriodo(dataInicio, dataFim);
      setLancamentos(response.data);
    } catch (error) {
      console.error('Erro ao buscar período', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Dashboard Financeiro</h1>

      <div className="dashboard-stats">
        <div className="stat-card receita">
          <h3>Total Receitas</h3>
          <p className="value">R$ {totalReceitas.toFixed(2)}</p>
        </div>
        <div className="stat-card despesa">
          <h3>Total Despesas</h3>
          <p className="value">R$ {totalDespesas.toFixed(2)}</p>
        </div>
        <div className={`stat-card saldo ${saldo >= 0 ? 'positivo' : 'negativo'}`}>
          <h3>Saldo</h3>
          <p className="value">R$ {saldo.toFixed(2)}</p>
        </div>
      </div>

      <div className="filter-section">
        <h3>Filtrar por Período</h3>
        <div className="filter-inputs">
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            placeholder="Data Início"
          />
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            placeholder="Data Fim"
          />
          <button onClick={handleBuscarPeriodo} className="btn btn-primary">
            Buscar
          </button>
        </div>
      </div>

      {loading && <p>Carregando...</p>}

      <div className="lancamentos-table">
        <h3>Lançamentos Financeiros</h3>
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
                  <span className={lancamento.pago ? 'badge-success' : 'badge-warning'}>
                    {lancamento.pago ? 'Sim' : 'Não'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardFinanceiro;
