import React, { useState, useEffect } from 'react';
import { vendaService } from '../../services/vendaService';
import { clienteService } from '../../services/clienteService';
import { produtoService } from '../../services/produtoService';

interface RelatorioData {
  totalVendas: number;
  totalClientes: number;
  totalProdutos: number;
  receita: number;
  ticketMedio: number;
}

const Relatorios: React.FC = () => {
  const [relatorio, setRelatorio] = useState<RelatorioData>({
    totalVendas: 0,
    totalClientes: 0,
    totalProdutos: 0,
    receita: 0,
    ticketMedio: 0
  });
  const [loading, setLoading] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    fetchRelatorio();
  }, []);

  const fetchRelatorio = async () => {
    setLoading(true);
    try {
      const [vendas, clientes, produtos] = await Promise.all([
        vendaService.listar(1, 1000),
        clienteService.listar(1, 1000),
        produtoService.listar(1, 1000)
      ]);

      const totalVendas = vendas.data.length;
      const totalReceita = vendas.data.reduce((sum, v) => sum + v.valor, 0);

      setRelatorio({
        totalVendas,
        totalClientes: clientes.data.length,
        totalProdutos: produtos.data.length,
        receita: totalReceita,
        ticketMedio: totalVendas > 0 ? totalReceita / totalVendas : 0
      });
    } catch (error) {
      console.error('Erro ao buscar relatório', error);
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
      const relatorioData = await vendaService.obterRelatorio(dataInicio, dataFim);
      // Aqui você pode processar os dados do relatório retornado
      console.log('Relatório:', relatorioData);
    } catch (error) {
      console.error('Erro ao buscar relatório', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Relatórios</h1>

      <div className="relatorio-filtros">
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
            Gerar Relatório
          </button>
        </div>
      </div>

      {loading && <p>Carregando...</p>}

      <div className="relatorio-cards">
        <div className="relatorio-card">
          <h3>Total de Vendas</h3>
          <p className="value">{relatorio.totalVendas}</p>
        </div>
        <div className="relatorio-card">
          <h3>Total de Clientes</h3>
          <p className="value">{relatorio.totalClientes}</p>
        </div>
        <div className="relatorio-card">
          <h3>Total de Produtos</h3>
          <p className="value">{relatorio.totalProdutos}</p>
        </div>
        <div className="relatorio-card">
          <h3>Receita Total</h3>
          <p className="value">R$ {relatorio.receita.toFixed(2)}</p>
        </div>
        <div className="relatorio-card">
          <h3>Ticket Médio</h3>
          <p className="value">R$ {relatorio.ticketMedio.toFixed(2)}</p>
        </div>
      </div>

      <div className="relatorio-section">
        <h2>Exportar Relatórios</h2>
        <div className="export-buttons">
          <button className="btn btn-secondary">
            📊 Exportar para Excel
          </button>
          <button className="btn btn-secondary">
            📄 Exportar para PDF
          </button>
          <button className="btn btn-secondary">
            🖨️ Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
