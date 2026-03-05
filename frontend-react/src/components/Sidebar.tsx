import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { observer } from 'mobx-react-lite'; // Importante para reatividade futura
import '../styles/sidebar.css';

// Ícones SVG para manter o padrão do seu HTML original
const Icons = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  ),
  Cadastro: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
    </svg>
  ),
  // ... adicione os outros conforme o seu HTML original
};

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: <Icons.Dashboard />, path: '/dashboard' },
  {
    label: 'Cadastro',
    icon: <Icons.Cadastro />,
    submenu: [
      { label: 'Clientes', path: '/cadastro-clientes' },
      { label: 'Produtos', path: '/cadastro-produtos' },
      { label: 'Fornecedores', path: '/cadastro-fornecedores' },
      { label: 'Funcionários', path: '/cadastro-funcionarios' },
    ],
  },
  // ... outros itens
];

const Sidebar: React.FC = observer(() => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>('Cadastro');

  const toggleSubmenu = (label: string) => {
    setExpandedMenu(prev => (prev === label ? null : label));
  };

  return (
    <aside className="sidebar">
      {/* Perfil do Usuário conforme seu HTML */}
      <div className="user-profile">
        <div className="avatar">
          <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      <nav className="menu">
        {menuItems.map((item) => (
          <div key={item.label}>
            {item.submenu ? (
              <>
                <div 
                  className={`menu-item dropdown ${expandedMenu === item.label ? 'active' : ''}`}
                  onClick={() => toggleSubmenu(item.label)}
                >
                  {item.icon}
                  <span className="sidebar-text">{item.label}</span>
                </div>
                
                {/* Renderização Condicional do Submenu */}
                <div className={`submenu ${expandedMenu === item.label ? 'show' : ''}`}>
                  {item.submenu.map((sub) => (
                    <NavLink 
                      key={sub.path} 
                      to={sub.path} 
                      className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}
                    >
                      <span>{sub.label}</span>
                    </NavLink>
                  ))}
                </div>
              </>
            ) : (
              <NavLink 
                to={item.path!} 
                className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span className="sidebar-text">{item.label}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      <div className="bottom-menu">
        <NavLink to="/configuracoes" className="menu-item">
          <span className="sidebar-text">Configurações</span>
        </NavLink>
        {/* Link de saída usando logout via Axios futuramente */}
        <NavLink to="/login" className="menu-item">
          <span className="sidebar-text">Sair</span>
        </NavLink>
      </div>
    </aside>
  );
});

export default Sidebar;