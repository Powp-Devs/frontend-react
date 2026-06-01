import React, { useState } from 'react';
import DashboardVendas from './dashboard/DashboardVendas';
import DashboardEstoque from './dashboard/DashboardEstoque';
import DashboardClientes from './dashboard/DashboardClientes';
import '@/styles/dashboardPage.css';

type Tab = 'vendas' | 'estoque' | 'clientes';

const TABS: { key: Tab; label: string }[] = [
  { key: 'vendas', label: 'Painel de Vendas' },
  { key: 'estoque', label: 'Painel de Estoque' },
  { key: 'clientes', label: 'Análise de Clientes' },
];

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('vendas');

  return (
    <div className="dp-wrapper">
      <div className="dp-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`dp-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dp-content">
        {activeTab === 'vendas' && <DashboardVendas />}
        {activeTab === 'estoque' && <DashboardEstoque />}
        {activeTab === 'clientes' && <DashboardClientes />}
      </div>
    </div>
  );
};

export default DashboardPage;
