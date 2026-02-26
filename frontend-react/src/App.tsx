import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CadastroCliente from './pages/CadastroCliente';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cadastro-cliente" element={<CadastroCliente />} />
          {/* add other routes here as you migrate them */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
