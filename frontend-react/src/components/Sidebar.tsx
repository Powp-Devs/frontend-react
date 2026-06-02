import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  ),
  Cadastro: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
    </svg>
  ),
  Pedidos: () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
      <path d="M186.67-120q-27.5 0-47.09-19.58Q120-159.17 120-186.67v-586.66q0-27.5 19.58-47.09Q159.17-840 186.67-840h192.66q7.67-35.33 35.84-57.67Q443.33-920 480-920t64.83 22.33Q573-875.33 580.67-840h192.66q27.5 0 47.09 19.58Q840-800.83 840-773.33v586.66q0 27.5-19.58 47.09Q800.83-120 773.33-120H186.67Zm0-66.67h586.66v-586.66H186.67v586.66ZM280-280h275.33v-66.67H280V-280Zm0-166.67h400v-66.66H280v66.66Zm0-166.66h400V-680H280v66.67ZM503.5-804.5q9.83-9.83 9.83-23.5t-9.83-23.5q-9.83-9.83-23.5-9.83t-23.5 9.83q-9.83 9.83-9.83 23.5t9.83 23.5q9.83 9.83 23.5 9.83t23.5-9.83ZM186.67-186.67v-586.66 586.66Z"/>
    </svg>
  ),
  ChatBot: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
      <path d="M12 3C7.03 3 3 7.03 3 12c0 2.5 1.01 4.75 2.64 6.36L5 21l2.64-2.64C8.99 19.99 10.49 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-4.5 10c-.83 0-1.5-.67-1.5-1.5S7.67 10 8.5 10s1.5.67 1.5 1.5S9.33 13 8.5 13zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5S18.33 13 17.5 13z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
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
      { label: 'Setores', path: '/cadastro-setor' },
    ],
  },
  {
    label: 'ChatBot',
    icon: <Icons.ChatBot />,
    path: '/chat'
  },
  {
    label: 'Pedidos',
    icon: <Icons.Pedidos />,
    path: '/vendas'
  }
];

const Sidebar: React.FC = observer(() => {
  const location = useLocation();

  const isCadastroActive = menuItems
    .find(i => i.label === 'Cadastro')
    ?.submenu?.some(sub => location.pathname === sub.path);
  // Se quiser que ela comece aberta, deixe false. Se quiser fechada, true.
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>('null');

  const handleSubmenuToggle = (label: string) => {
    if (isCollapsed) return;
    setExpandedMenu(prev => (prev === label ? null : label));
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
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
                    className={clsx('menu-item dropdown', { 'active': isCadastroActive })}
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
                        end
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
                  end
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
          <div className="icon-container"><Icons.Settings /></div>
          <span className="sidebar-text">Configurações</span>
        </NavLink>
        <button type="button" className="menu-item logout-button" onClick={handleLogout}>
          <div className="icon-container"><Icons.Logout /></div>
          <span className="sidebar-text">Sair</span>
        </button>
      </div>
    </aside>
  );
});

export default Sidebar;
