import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load das páginas
const App = React.lazy(() => import('./App'));
const Login = React.lazy(() => import('./pages/Login'));
const ClientDashboard = React.lazy(() => import('./pages/ClientDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

export const Router: React.FC = () => {
  const storedUser = localStorage.getItem('loggedUser');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem('loggedUser');
    window.location.href = '/';
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<App />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard-cliente"
            element={
              <ProtectedRoute allowedRole="user">
                {user && <ClientDashboard user={user} onLogout={handleLogout} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-admin"
            element={
              <ProtectedRoute allowedRole="admin">
                {user && <AdminDashboard user={user} onLogout={handleLogout} />}
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
