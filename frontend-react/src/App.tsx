import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './styles/global.css';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DashboardFinanceiro = lazy(() => import('./pages/dashboard/DashboardFinanceiro'));

// Cadastro pages
const CadastroCliente = lazy(() => import('./pages/cadastro/CadastroClientes'));
const CadastroProdutos = lazy(() => import('./pages/cadastro/CadastroProdutos'));
const CadastroFornecedores = lazy(() => import('./pages/cadastro/CadastroFornecedores'));
const CadastroFuncionarios = lazy(() => import('./pages/cadastro/CadastroFuncionarios'));

// Financeiro
const NovoLancamento = lazy(() => import('./pages/financeiro/NovoLancamento'));

// Vendas
const PedidoVenda = lazy(() => import('./pages/vendas/PedidoVenda'));

// Estoque
const ControleEstoque = lazy(() => import('./pages/estoque/ControleEstoque'));

// Relatórios
const Relatorios = lazy(() => import('./pages/relatorios/Relatorios'));

// Loading component
const LoadingFallback = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <p>Carregando...</p>
  </div>
);

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <section
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '1.5rem',
          }}
        >
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard-financeiro" element={<DashboardFinanceiro />} />
              
              {/* Cadastro */}
              <Route path="/cadastro-clientes" element={<CadastroCliente />} />
              <Route path="/cadastro-produtos" element={<CadastroProdutos />} />
              <Route path="/cadastro-fornecedores" element={<CadastroFornecedores />} />
              <Route path="/cadastro-funcionarios" element={<CadastroFuncionarios />} />
              
              {/* Financeiro */}
              <Route path="/lancamento-financeiro" element={<NovoLancamento />} />
              
              {/* Vendas */}
              <Route path="/pedido-venda" element={<PedidoVenda />} />
              
              {/* Estoque */}
              <Route path="/controle-estoque" element={<ControleEstoque />} />
              
              {/* Relatórios */}
              <Route path="/relatorios" element={<Relatorios />} />
              
              {/* Fallback para rotas antigas */}
              <Route path="/cadastro-cliente" element={<Navigate to="/cadastro-clientes" replace />} />
              <Route path="/estoque" element={<Navigate to="/controle-estoque" replace />} />
            </Routes>
          </Suspense>
        </section>
      </main>
    </div>
  );
}

export default App;
