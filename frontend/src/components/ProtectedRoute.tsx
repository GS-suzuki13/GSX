import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { LoggedUser } from '../types';

interface ProtectedRouteProps {
  allowedRole: 'admin' | 'user';
  children?: React.ReactNode;
}

function getStoredUser(): LoggedUser | null {
  const storedUser = localStorage.getItem('loggedUser');

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as LoggedUser;
  } catch (error) {
    console.error('Erro ao validar usuário salvo:', error);
    localStorage.removeItem('loggedUser');
    return null;
  }
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRole,
  children
}) => {
  const location = useLocation();
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== allowedRole) {
    const redirectTo = user.role === 'admin' ? '/admin/dashboard' : '/dashboard-cliente';
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;