import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      {/* replicate the markup from old html but using NavLink for routing */}
      <nav className="menu">
        <NavLink to="/dashboard" className="menu-item">
          <span className="sidebar-text">Dashboard</span>
        </NavLink>
        <div className="menu-item dropdown">
          <span className="sidebar-text">Cadastro</span>
          <div className="submenu">
            <NavLink to="/cadastro-cliente" className="submenu-item">
              Clientes
            </NavLink>
            {/* other submenu links */}
          </div>
        </div>
        {/* add remaining static menu entries as needed */}
      </nav>
    </div>
  );
};

export default Sidebar;
