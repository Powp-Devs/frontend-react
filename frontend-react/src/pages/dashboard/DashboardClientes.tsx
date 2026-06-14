import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { dashboardService } from '@/services/dashboardService';
import type { DashboardClientesResponse, ClienteChurn, NovoCliente } from '@/types/Dashboard';
import '@/styles/dashboardClientes.css';

Chart.register(...registerables);

const obterDatahoje = () => {
  return new Date().toISOString().split('T')[0];
};

const obterPrimeiroDiaMes = () => {
  const data = new Date();
  const primeiroDia = new Date(data.getFullYear(), data.getMonth(), 1);

  primeiroDia.setMinutes(primeiroDia.getMinutes() - primeiroDia.getTimezoneOffset());

  return primeiroDia.toISOString().split('T')[0];
};

const formatMoeda = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

const DashboardClientes: React.FC = () => {
  const [dados, setDados] = useState<DashboardClientesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [dataInicial, setDataInicial] = useState<string>(obterPrimeiroDiaMes());
  const [dataFinal, setDataFinal] = useState<string>(obterDatahoje()); 

  const evolucaoChartRef = useRef<HTMLCanvasElement>(null);
  const segmentacaoChartRef = useRef<HTMLCanvasElement>(null);
  const topClientesChartRef = useRef<HTMLCanvasElement>(null);
  const geograficaChartRef = useRef<HTMLCanvasElement>(null);

  const evolucaoInstance = useRef<Chart | null>(null);
  const segmentacaoInstance = useRef<Chart | null>(null);
  const topClientesInstance = useRef<Chart | null>(null);
  const geograficaInstance = useRef<Chart | null>(null);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);

      const data = await dashboardService.getClientes(dataInicial, dataFinal);
      setDados(data);
    } catch (e) {
      setErro('Erro ao carregar dados do dashboard de clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (!dados) return;

    evolucaoInstance.current?.destroy();
    segmentacaoInstance.current?.destroy();
    topClientesInstance.current?.destroy();
    geograficaInstance.current?.destroy();

    if (evolucaoChartRef.current) {
      evolucaoInstance.current = new Chart(evolucaoChartRef.current, {
        type: 'line',
        data: {
          labels: dados.evolucao.labels,
          datasets: [
            {
              label: 'Novos Clientes',
              data: dados.evolucao.novos,
              borderColor: '#2196f3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              tension: 0.4,
              fill: true,
            },
            {
              label: 'Clientes Ativos',
              data: dados.evolucao.ativos,
              borderColor: '#43a047',
              backgroundColor: 'rgba(67, 160, 71, 0.1)',
              tension: 0.4,
              fill: true,
            },
            {
              label: 'Clientes Inativos',
              data: dados.evolucao.inativos,
              borderColor: '#e53935',
              backgroundColor: 'rgba(229, 57, 53, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { position: 'top' } },
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    if (segmentacaoChartRef.current) {
      segmentacaoInstance.current = new Chart(segmentacaoChartRef.current, {
        type: 'doughnut',
        data: {
          labels: dados.segmentacao.labels,
          datasets: [{
            data: dados.segmentacao.valores,
            backgroundColor: [
              'rgba(33, 150, 243, 0.8)',
              'rgba(67, 160, 71, 0.8)',
              'rgba(156, 39, 176, 0.8)',
              'rgba(255, 152, 0, 0.8)',
            ],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { position: 'bottom' } },
        },
      });
    }

    if (topClientesChartRef.current) {
      topClientesInstance.current = new Chart(topClientesChartRef.current, {
        type: 'bar',
        data: {
          labels: dados.top_clientes.labels,
          datasets: [{
            label: 'Faturamento (R$)',
            data: dados.top_clientes.faturamento,
            backgroundColor: 'rgba(0, 77, 64, 0.8)',
            borderRadius: 6,
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              beginAtZero: true,
              ticks: { callback: (v) => formatMoeda(Number(v)) },
            },
          },
        },
      });
    }

    if (geograficaChartRef.current) {
      geograficaInstance.current = new Chart(geograficaChartRef.current, {
        type: 'pie',
        data: {
          labels: dados.distribuicao_geografica.labels,
          datasets: [{
            data: dados.distribuicao_geografica.valores,
            backgroundColor: [
              'rgba(0, 77, 64, 0.8)',
              'rgba(0, 121, 107, 0.8)',
              'rgba(38, 166, 154, 0.8)',
              'rgba(77, 182, 172, 0.8)',
              'rgba(128, 203, 196, 0.8)',
              'rgba(178, 223, 219, 0.8)',
            ],
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { position: 'right' } },
        },
      });
    }

    return () => {
      evolucaoInstance.current?.destroy();
      segmentacaoInstance.current?.destroy();
      topClientesInstance.current?.destroy();
      geograficaInstance.current?.destroy();
    };
  }, [dados]);

  if (loading) return <div className="dashboard-loading">Carregando...</div>;
  if (erro) return <div className="dashboard-erro">{erro}</div>;
  if (!dados) return null;

  return (
    <div className="dc-container">
      {/* BARRA DE FILTROS */}
      <div className="dv-filter-bar">
        <div className="dv-filter-group">
          <label>Data Inicial:</label>
          <input 
            type="date" 
            value={dataInicial} 
            onChange={(e) => setDataInicial(e.target.value)} 
            className="dv-date-input"
          />
        </div>
        <div className="dv-filter-group">
          <label>Data Final:</label>
          <input 
            type="date" 
            value={dataFinal} 
            onChange={(e) => setDataFinal(e.target.value)} 
            className="dv-date-input"
          />
        </div>
        <button 
          onClick={carregarDados} 
          className="dv-btn-filtrar"
          disabled={loading}
        >
          {loading ? 'Filtrando...' : 'Filtrar'}
        </button>
      </div>
      {/* KPIs */}
      <div className="dc-kpi-cards">
        <div className="dc-kpi-card blue">
          <div className="dc-kpi-icon">👥</div>
          <div className="dc-kpi-content">
            <h3>Total de Clientes</h3>
            <div className="dc-kpi-value">{dados.total_clientes.toLocaleString('pt-BR')}</div>
          </div>
        </div>
        <div className="dc-kpi-card green">
          <div className="dc-kpi-icon">✅</div>
          <div className="dc-kpi-content">
            <h3>Clientes Ativos</h3>
            <div className="dc-kpi-value">{dados.clientes_ativos.toLocaleString('pt-BR')}</div>
          </div>
        </div>
        <div className="dc-kpi-card purple">
          <div className="dc-kpi-icon">💵</div>
          <div className="dc-kpi-content">
            <h3>Ticket Médio</h3>
            <div className="dc-kpi-value">{formatMoeda(dados.ticket_medio)}</div>
          </div>
        </div>
        <div className="dc-kpi-card orange">
          <div className="dc-kpi-icon">🔄</div>
          <div className="dc-kpi-content">
            <h3>Taxa de Retenção</h3>
            <div className="dc-kpi-value">{dados.taxa_retencao.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Gráficos linha 1 */}
      <div className="dc-charts-row">
        <div className="dc-chart-box large">
          <div className="dc-chart-header"><h3>Evolução de Clientes</h3></div>
          <canvas ref={evolucaoChartRef}></canvas>
        </div>
        <div className="dc-chart-box">
          <div className="dc-chart-header"><h3>Segmentação por Tipo</h3></div>
          <canvas ref={segmentacaoChartRef}></canvas>
        </div>
      </div>

      {/* Gráficos linha 2 */}
      <div className="dc-charts-row">
        <div className="dc-chart-box">
          <div className="dc-chart-header"><h3>Top Clientes por Faturamento</h3></div>
          <canvas ref={topClientesChartRef}></canvas>
        </div>
        <div className="dc-chart-box">
          <div className="dc-chart-header"><h3>Distribuição Geográfica</h3></div>
          <canvas ref={geograficaChartRef}></canvas>
        </div>
      </div>

      {/* Tabelas */}
      <div className="dc-tables-row">
        <div className="dc-table-card">
          <div className="dc-table-header">
            <h3>Clientes em Risco de Churn</h3>
          </div>
          <table className="dc-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Última Compra</th>
                <th>Valor Total</th>
                <th>Risco</th>
              </tr>
            </thead>
            <tbody>
              {dados.clientes_churn.map((item: ClienteChurn, idx: number) => (
                <tr key={idx}>
                  <td>{item.cliente}</td>
                  <td>{item.ultima_compra}</td>
                  <td>{formatMoeda(item.valor_total)}</td>
                  <td>
                    <span className={`dc-risk-badge ${item.risco}`}>
                      {item.risco === 'alto' ? 'Alto' : item.risco === 'medio' ? 'Médio' : 'Baixo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dc-table-card">
          <div className="dc-table-header">
            <h3>Novos Clientes do Mês</h3>
          </div>
          <table className="dc-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Data Cadastro</th>
                <th>Primeira Compra</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dados.novos_clientes.map((item: NovoCliente, idx: number) => (
                <tr key={idx}>
                  <td>{item.cliente}</td>
                  <td>{item.data_cadastro}</td>
                  <td>{item.primeira_compra > 0 ? formatMoeda(item.primeira_compra) : '-'}</td>
                  <td>
                    <span className={`dc-status-badge ${item.status}`}>
                      {item.status === 'ativo' ? 'Ativo' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardClientes;
