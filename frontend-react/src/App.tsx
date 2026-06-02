import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '@/shared/components/layout/Sidebar';
import { ToastProvider } from "@/components/ToastContext";
import AppRouter from '@/app/router';
import '@/app/styles/global.css';

const App: React.FC = () => {
  const location = useLocation();
  const routesWithoutSidebar = ['/login', '/register'];
  const showSidebar = !routesWithoutSidebar.includes(location.pathname);

  return (
    <ToastProvider>
      <div className="app-container">
        {showSidebar && <Sidebar />}
        <main className="main-content">
          <AppRouter />
        </main>
      </div>
    </ToastProvider>
  );
};

export default App;
