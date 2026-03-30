import React, { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import QueryProvider from './QueryProvider';

interface AppProvidersProps {
  children: ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <QueryProvider>{children}</QueryProvider>
    </BrowserRouter>
  );
};

export default AppProviders;
