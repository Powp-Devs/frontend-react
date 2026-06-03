import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { dashboardService } from '@/services/dashboardService';
import type { DashboardVendasResponse } from '@/types/Dashboard';
import '@/styles/dashboardVendas.css';

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

const DashboardVendas: React.FC = () => {
  const [dados, setDados] = useState<DashboardVendasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [dataInicial, setDataInicial] = useState<string>(obterPrimeiroDiaMes());
  const [dataFinal, setDataFinal] = useState<string>(obterDatahoje());

  const salesChartRef = useRef<HTMLCanvasElement>(null);
  const productsChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const paymentChartRef = useRef<HTMLCanvasElement>(null);

  const salesChartInstance = useRef<Chart | null>(null);
  const productsChartInstance = useRef<Chart | null>(null);
  const barChartInstance = useRef<Chart | null>(null);
  const paymentChartInstance = useRef<Chart | null>(null);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);

      const data = await dashboardService.getVendas(dataInicial, dataFinal);
      setDados(data);
    } catch (e) {
      setErro('Erro ao carregar dados do dashboard de vendas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  

  useEffect(() => {
    if (!dados) return;

    // Destroi instâncias anteriores
    salesChartInstance.current?.destroy();
    productsChartInstance.current?.destroy();
    barChartInstance.current?.destroy();
    paymentChartInstance.current?.destroy();

    if (salesChartRef.current) {
      salesChartInstance.current = new Chart(salesChartRef.current, {
        type: 'line',
        data: {
          labels: dados.grafico_vendas.labels,
          datasets: [{
            label: 'Vendas (R$)',
            data: dados.grafico_vendas.data,
            borderColor: '#8e44ad',
            backgroundColor: 'rgba(142, 68, 173, 0.1)',
            tension: 0.4,
            fill: true,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: (v) => formatMoeda(Number(v)) },
            },
          },
        },
      });
    }

    if (productsChartRef.current) {
      productsChartInstance.current = new Chart(productsChartRef.current, {
        type: 'doughnut',
        data: {
          labels: dados.vendas_por_produto.labels,
          datasets: [{
            data: dados.vendas_por_produto.data,
            backgroundColor: ['#f39c12', '#e74c3c', '#3498db', '#9b59b6', '#8b0000'],
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 15 } } },
        },
      });
    }

    if (barChartRef.current) {
      barChartInstance.current = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: dados.vendas_por_dia.labels,
          datasets: [{
            label: 'Qtd. vendas',
            data: dados.vendas_por_dia.data,
            backgroundColor: ['#2ecc71', '#f39c12', '#9b59b6', '#f1c40f', '#8b0000', '#27ae60', '#8e44ad'],
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    if (paymentChartRef.current) {
      paymentChartInstance.current = new Chart(paymentChartRef.current, {
        type: 'doughnut',
        data: {
          labels: dados.meio_pagamento.labels,
          datasets: [{
            data: dados.meio_pagamento.data,
            backgroundColor: ['#2ecc71', '#f1c40f', '#3498db', '#9b59b6', '#e74c3c'],
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 15 } } },
        },
      });
    }

    return () => {
      salesChartInstance.current?.destroy();
      productsChartInstance.current?.destroy();
      barChartInstance.current?.destroy();
      paymentChartInstance.current?.destroy();
    };
  }, [dados]);

  if (loading) return <div className="dashboard-loading">Carregando...</div>;
  if (erro) return <div className="dashboard-erro">{erro}</div>;
  if (!dados) return null;

  return (
    <div className="dv-container">
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

      <div className="dv-cards">
        <div className="dv-card yellow">
          <div className="dv-card-content">
            <h3>Qtd. vendas de hoje</h3>
            <div className="dv-card-value">{dados.sales_today_count}</div>
          </div>
        </div>
        <div className="dv-card green">
          <div className="dv-card-content">
            <h3>Valor vendas de hoje</h3>
            <div className="dv-card-value">{formatMoeda(dados.sales_value_today)}</div>
          </div>
        </div>
        <div className="dv-card blue">
          <div className="dv-card-content">
            <h3>Clientes ativos</h3>
            <div className="dv-card-value">{dados.active_clients_count}</div>
          </div>
        </div>
        <div className="dv-card red">
          <div className="dv-card-content">
            <h3>Ticket médio</h3>
            <div className="dv-card-value">{formatMoeda(dados.ticket_medio)}</div>
          </div>
        </div>
      </div>

      <div className="dv-charts-row">
        <div className="dv-chart-box">
          <div className="dv-chart-header">
            <h3>Comparativo de vendas</h3>
          </div>
          <canvas ref={salesChartRef}></canvas>
        </div>
        <div className="dv-chart-box">
          <div className="dv-chart-header">
            <h3>Vendas por produtos</h3>
          </div>
          <div className="dv-donut-wrapper">
            <canvas ref={productsChartRef}></canvas>
            <div className="dv-donut-center">{dados.vendas_por_produto.total_itens} itens</div>
          </div>
        </div>
      </div>

      <div className="dv-charts-row">
        <div className="dv-chart-box">
          <div className="dv-chart-header">
            <h3>Vendas por dia</h3>
          </div>
          <canvas ref={barChartRef}></canvas>
        </div>
        <div className="dv-chart-box">
          <div className="dv-chart-header">
            <h3>Meio de Pagamento</h3>
          </div>
          <div className="dv-donut-wrapper">
            <canvas ref={paymentChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardVendas;