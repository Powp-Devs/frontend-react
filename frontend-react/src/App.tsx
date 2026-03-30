import React from 'react';
import Sidebar from './shared/components/layout/Sidebar';
import AppRouter from './app/router';
import './app/styles/global.css';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <AppRouter />
      </main>
    </div>
  );
};

export default App;
