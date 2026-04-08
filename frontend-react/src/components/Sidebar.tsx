import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import '../styles/sidebar.css';

interface SubmenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  submenu?: SubmenuItem[];
}

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
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  )
};

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: <Icons.Dashboard />, path: '/dashboard' },
  {
    label: 'Cadastro',
    icon: <Icons.Cadastro />,
    submenu: [
      { label: 'Clientes', path: '/cadastro-cliente' },
      { label: 'Produtos', path: '/cadastro-produtos' },
      { label: 'Fornecedores', path: '/cadastro-fornecedor' },
      { label: 'Funcionários', path: '/cadastro-funcionarios' },
    ],
  },
];

const Sidebar: React.FC = observer(() => {
  // Se quiser que ela comece aberta, deixe false. Se quiser fechada, true.
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>('Cadastro');

  const handleSubmenuToggle = (label: string) => {
    if (isCollapsed) return;
    setExpandedMenu(prev => (prev === label ? null : label));
  };

  return (
    <aside
      className={clsx('sidebar', { 'collapsed': isCollapsed })}
      onMouseEnter={() => setIsCollapsed(false)} // Opcional: abre ao passar o mouse
      onMouseLeave={() => setIsCollapsed(true)}  // Opcional: fecha ao tirar o mouse
    >
      <div className="user-profile">
        <div className="avatar">
          <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      <nav className="menu">
        {menuItems.map((item) => {
          const hasSubmenu = !!item.submenu;
          const isExpanded = expandedMenu === item.label;

          return (
            <div key={item.label} className="menu-group">
              {hasSubmenu ? (
                <>
                  <div
                    className={clsx('menu-item dropdown', { 'active': isExpanded })}
                    onClick={() => handleSubmenuToggle(item.label)}
                  >
                    <div className="icon-container">{item.icon}</div>
                    <span className="sidebar-text">{item.label}</span>
                    <div className={clsx('arrow-icon', { 'rotated': isExpanded })}>
                      <Icons.ChevronDown />
                    </div>
                  </div>

                  <div className={clsx('submenu', { 'show': isExpanded && !isCollapsed })}>
                    {item.submenu?.map((sub) => (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        className={({ isActive }) => clsx('submenu-item', { 'active': isActive })}
                      >
                        <span className="sidebar-text">{sub.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </>
              ) : (
                <NavLink
                  to={item.path!}
                  className={({ isActive }) => clsx('menu-item', { 'active': isActive })}
                >
                  <div className="icon-container">{item.icon}</div>
                  <span className="sidebar-text">{item.label}</span>
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      <div className="bottom-menu">
        <NavLink to="/configuracoes" className="menu-item">
          <div className="icon-container">⚙️</div>
          <span className="sidebar-text">Configurações</span>
        </NavLink>
        <NavLink to="/login" className="menu-item">
          <div className="icon-container">🚪</div>
          <span className="sidebar-text">Sair</span>
        </NavLink>
      </div>
    </aside>
  );
});

export default Sidebar;