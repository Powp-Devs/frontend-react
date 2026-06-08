import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import OrdersPage from '@/pages/OrdersPage';
import Chat from '@/pages/ia/Chat';
import CadastroFornecedor from '@/pages/cadastro/CadastroFornecedor';
import CadastroClientes from '@/pages/cadastro/CadastroClientes';
import CadastroFuncionario from '@/pages/cadastro/CadastroFuncionario';
import CadastroProduto from '@/pages/cadastro/CadastroProduto';
import CadastroSetor from '@/pages/cadastro/CadastroSetor';
import CadastroCategoria from '@/pages/cadastro/CadastroCategoria';
import CadastroUsuario from '@/pages/cadastro/cadastroUsuario';
import NovoPedido from '@/pages/vendas/NovoPedido';
import ControleEstoque from '@/pages/estoque/ControleEstoque';
import authService from '@/services/authService';

const ProtectedRoute = () => {
  return authService.isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  return authService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cadastro-cliente" element={<CadastroClientes />} />
        <Route path="/cadastro-produtos" element={<CadastroProduto />} />
        <Route path="/cadastro-fornecedor" element={<CadastroFornecedor />} />
        <Route path="/cadastro-funcionarios" element={<CadastroFuncionario />} />
        <Route path="/cadastro-setor" element={<CadastroSetor />} />
        <Route path="/cadastro-categoria" element={<CadastroCategoria />} />
        <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
        <Route path="/usuarios" element={<OrdersPage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/vendas" element={<NovoPedido />} />
        <Route path="/estoque" element={<ControleEstoque />} />
      </Route>

      <Route
        path="*"
        element={
          authService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
};

export default AppRouter;
