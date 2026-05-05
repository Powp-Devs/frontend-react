import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage';
import OrdersPage from '@/pages/OrdersPage';
import CadastroFornecedor from '@/pages/cadastro/CadastroFornecedor';
import CadastroClientes from '@/pages/cadastro/CadastroClientes';
import CadastroFuncionario from '@/pages/cadastro/CadastroFuncionario';
import CadastroProduto from '@/pages/cadastro/CadastroProduto';
import CadastroSetor from '@/pages/cadastro/CadastroSetor';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/cadastro-cliente" element={<CadastroClientes />} />
      <Route path="/cadastro-produtos" element={<CadastroProduto />} />
      <Route path="/cadastro-fornecedor" element={<CadastroFornecedor />} />
      <Route path="/cadastro-funcionarios" element={<CadastroFuncionario />} />
      <Route path="/cadastro-setor" element={<CadastroSetor />} />

      <Route path="/usuarios" element={<OrdersPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
};

export default AppRouter;
