import React from 'react';

export const Router: React.FC = () => {
  const path = window.location.pathname;

  switch (path) {
    case '/login':
      return React.lazy(() => import('./pages/Login'));
    case '/dashboard-cliente':
      return React.lazy(() => import('./pages/ClientDashboard'));
    case '/dashboard-admin':
      return React.lazy(() => import('./pages/AdminDashboard'));
    default:
      return React.lazy(() => import('./App'));
  }
};