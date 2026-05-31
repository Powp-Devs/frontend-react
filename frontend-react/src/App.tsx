import React from 'react';
import Sidebar from '@/shared/components/layout/Sidebar';
import { ToastProvider } from "@/components/ToastContext";
import AppRouter from '@/app/router';
import '@/app/styles/global.css';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <AppRouter />
        </main>
      </div>
    </ToastProvider>
  );
};

export default App;

