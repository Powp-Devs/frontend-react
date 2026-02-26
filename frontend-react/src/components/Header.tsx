import React from 'react';
import '../styles/header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="search-container">
        <input type="text" placeholder="Pesquisar" className="search-input" />
        <button className="search-button">🔍</button>
      </div>
      <div className="actions">
        {/* actions buttons could be passed as props if needed */}
      </div>
    </header>
  );
};

export default Header;
