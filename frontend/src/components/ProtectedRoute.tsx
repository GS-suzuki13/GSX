import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoggedUser } from '../types';

interface ProtectedRouteProps {
  allowedRole: 'admin' | 'user';
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRole,
  children
}) => {
  const location = useLocation();

  const storedUser = localStorage.getItem('loggedUser');

  if (!storedUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  try {
    const user: LoggedUser = JSON.parse(storedUser);

    if (user.role !== allowedRole) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <>{children}</>;
  } catch (error) {
    localStorage.removeItem('loggedUser');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
};

export default ProtectedRoute;