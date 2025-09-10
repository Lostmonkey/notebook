import React from 'react';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { LoginForm } from './LoginForm';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = useNotebookStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <>{children}</>;
};