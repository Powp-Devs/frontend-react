import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CadastroClientes from './pages/cadastro/CadastroClientes';
import Dashboard from './pages/Dashboard';
import './styles/global.css';

const App = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cadastro-cliente" element={<CadastroClientes />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;