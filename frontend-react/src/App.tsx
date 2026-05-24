import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '@/shared/components/layout/Sidebar';
import AppRouter from '@/app/router';
import '@/app/styles/global.css';

const App: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="app-container">
      {!isLoginPage && <Sidebar />}
      <main className="main-content" style={isLoginPage ? { width: '100%' } : {}}>
        <AppRouter />
      </main>
    </div>
  );
};

export default App;
