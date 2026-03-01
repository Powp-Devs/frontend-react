import React, { useState } from 'react';
import '../styles/header.css';

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Implementar lógica de busca global
      console.log('Pesquisando:', searchTerm);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <header className="header" role="banner">
      <form className="search-container" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Pesquisar..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Campo de pesquisa"
        />
        <button
          type="submit"
          className="search-button"
          title="Realizar busca"
          aria-label="Botão de pesquisa"
        >
          🔍
        </button>
      </form>

      <div className="actions">
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            title="Limpar busca"
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#666',
            }}
          >
            Limpar
          </button>
        )}
        {/* Adicione mais ações aqui, como notificações, perfil do usuário, etc. */}
      </div>
    </header>
  );
};

export default Header;

