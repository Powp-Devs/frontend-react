import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import '../styles/sidebar.css';

interface MenuItem {
  label: string;
  icon?: string;
  path?: string;
  submenu?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: '📊',
    path: '/dashboard',
  },
  {
    label: 'Dashboard Financeiro',
    icon: '💰',
    path: '/dashboard-financeiro',
  },
  {
    label: 'Cadastro',
    icon: '📝',
    submenu: [
      {
        label: 'Clientes',
        path: '/cadastro-clientes',
      },
      {
        label: 'Produtos',
        path: '/cadastro-produtos',
      },
      {
        label: 'Fornecedores',
        path: '/cadastro-fornecedores',
      },
      {
        label: 'Funcionários',
        path: '/cadastro-funcionarios',
      },
    ],
  },
  {
    label: 'Financeiro',
    icon: '💳',
    submenu: [
      {
        label: 'Novo Lançamento',
        path: '/lancamento-financeiro',
      },
      {
        label: 'Dashboard',
        path: '/dashboard-financeiro',
      },
    ],
  },
  {
    label: 'Vendas',
    icon: '🛍️',
    path: '/pedido-venda',
  },
  {
    label: 'Estoque',
    icon: '📦',
    path: '/controle-estoque',
  },
  {
    label: 'Relatórios',
    icon: '📈',
    path: '/relatorios',
  },
  {
    label: 'Fiscal',
    icon: '🏛️',
    path: '/fiscal',
  },
];

const Sidebar: React.FC = () => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const location = useLocation();

  const handleMenuClick = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  return (
    <aside className="sidebar">
      <nav className="menu" role="navigation" aria-label="Menu principal">
        {menuItems.map((item) => (
          <div key={item.label}>
            {item.submenu ? (
              <button
                className={`menu-item dropdown ${expandedMenu === item.label ? 'open' : ''}`}
                onClick={() => handleMenuClick(item.label)}
                aria-expanded={expandedMenu === item.label}
              >
                <span>{item.icon}</span>
                <span className="sidebar-text">{item.label}</span>
              </button>
            ) : (
              <NavLink
                to={item.path || '#'}
                className={({ isActive }) =>
                  `menu-item ${isActive ? 'active' : ''}`
                }
              >
                <span>{item.icon}</span>
                <span className="sidebar-text">{item.label}</span>
              </NavLink>
            )}

            {item.submenu && (
              <ul className="submenu">
                {item.submenu.map((subitem) => (
                  <li key={subitem.path}>
                    <NavLink
                      to={subitem.path || '#'}
                      className={({ isActive }) =>
                        `submenu-item ${isActive ? 'active' : ''}`
                      }
                    >
                      {subitem.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

