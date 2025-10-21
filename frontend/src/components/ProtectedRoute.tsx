import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'admin' | 'user';
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const storedUser = localStorage.getItem('loggedUser');

  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(storedUser);

    if (allowedRole && user.role !== allowedRole) {
      return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Erro ao validar login:", error);
    return <Navigate to="/login" replace />;
  }
}
