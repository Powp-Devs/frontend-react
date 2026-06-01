import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { dashboardService } from '@/services/dashboardService';
import type { DashboardEstoqueResponse, ProdutoValidar } from '@/types/Dashboard';
import '@/styles/dashboardEstoque.css';

Chart.register(...registerables);

const formatMoeda = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

const DashboardEstoque: React.FC = () => {
  const [dados, setDados] = useState<DashboardEstoqueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const categoriasChartRef = useRef<HTMLCanvasElement>(null);
  const categoriasChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getEstoque();
        setDados(data);
      } catch (e) {
        setErro('Erro ao carregar dados do dashboard de estoque.');
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  useEffect(() => {
    if (!dados) return;

    categoriasChartInstance.current?.destroy();

    if (categoriasChartRef.current && dados.categorias.length > 0) {
      categoriasChartInstance.current = new Chart(categoriasChartRef.current, {
        type: 'doughnut',
        data: {
          labels: dados.categorias.map((c) => c.categoria),
          datasets: [{
            data: dados.categorias.map((c) => c.qtd_produto),
            backgroundColor: [
              'rgba(33, 150, 243, 0.8)',
              'rgba(67, 160, 71, 0.8)',
              'rgba(255, 152, 0, 0.8)',
              'rgba(156, 39, 176, 0.8)',
              'rgba(255, 87, 34, 0.8)',
              'rgba(96, 125, 139, 0.8)',
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
      categoriasChartInstance.current?.destroy();
    };
  }, [dados]);

  if (loading) return <div className="dashboard-loading">Carregando...</div>;
  if (erro) return <div className="dashboard-erro">{erro}</div>;
  if (!dados) return null;

  return (
    <div className="de-container">
      {/* KPIs */}
      <div className="de-kpi-cards">
        <div className="de-kpi-card blue">
          <div className="de-kpi-icon">📦</div>
          <div className="de-kpi-content">
            <h3>Total de Produtos</h3>
            <div className="de-kpi-value">{dados.qtd_produto.toLocaleString('pt-BR')}</div>
            <div className="de-kpi-subtitle">Itens cadastrados</div>
          </div>
        </div>

        <div className="de-kpi-card green">
          <div className="de-kpi-icon">💰</div>
          <div className="de-kpi-content">
            <h3>Valor Total em Estoque</h3>
            <div className="de-kpi-value">{formatMoeda(dados.valor_estoque)}</div>
            <div className="de-kpi-subtitle">Custo médio</div>
          </div>
        </div>

        <div className="de-kpi-card orange">
          <div className="de-kpi-icon">⚠️</div>
          <div className="de-kpi-content">
            <h3>Produtos em Alerta</h3>
            <div className="de-kpi-value">{dados.estoque_minimo}</div>
            <div className="de-kpi-subtitle">Estoque mínimo</div>
          </div>
        </div>

        <div className="de-kpi-card red">
          <div className="de-kpi-icon">🚫</div>
          <div className="de-kpi-content">
            <h3>Produtos Zerados</h3>
            <div className="de-kpi-value">{dados.estoque_zerado}</div>
            <div className="de-kpi-subtitle">Sem estoque</div>
          </div>
        </div>
      </div>

      {/* Gráfico de categorias */}
      <div className="de-charts-row">
        <div className="de-chart-box large">
          <div className="de-chart-header">
            <h3>Categorias de Produtos</h3>
          </div>
          {dados.categorias.length > 0 ? (
            <canvas ref={categoriasChartRef}></canvas>
          ) : (
            <p className="de-empty">Nenhuma categoria encontrada.</p>
          )}
        </div>

        <div className="de-chart-box">
          <div className="de-chart-header">
            <h3>Resumo por Categoria</h3>
          </div>
          <table className="de-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Qtd. Produtos</th>
              </tr>
            </thead>
            <tbody>
              {dados.categorias.map((cat) => (
                <tr key={cat.codcategoria}>
                  <td>{cat.categoria}</td>
                  <td>{cat.qtd_produto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de produtos a validar */}
      <div className="de-table-section">
        <div className="de-table-card">
          <div className="de-table-header">
            <h3>Produtos com Estoque Crítico</h3>
            <span className="de-badge-count">{dados.estoque_validar.length} itens</span>
          </div>
          {dados.estoque_validar.length > 0 ? (
            <table className="de-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Produto</th>
                  <th>Estoque Atual</th>
                  <th>Estoque Mínimo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dados.estoque_validar.map((item: ProdutoValidar, idx: number) => {
                  const status = item.estoque_atual === 0 ? 'zerado' : 'alerta';
                  return (
                    <tr key={idx}>
                      <td>{item.codigo}</td>
                      <td>{item.produto}</td>
                      <td>{item.estoque_atual}</td>
                      <td>{item.estoque_minimo}</td>
                      <td>
                        <span className={`de-status-badge ${status}`}>
                          {status === 'zerado' ? 'Zerado' : 'Alerta'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="de-empty">Nenhum produto com estoque crítico.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardEstoque;
