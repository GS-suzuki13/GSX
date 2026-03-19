import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ClientsPage from './pages/admin/ClientsPage';
import ReturnsPage from './pages/admin/ReturnsPage';
import ClientDashboard from './pages/ClientDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import type { LoggedUser } from './types';

function getStoredUser(): LoggedUser | null {
  const storedUser = localStorage.getItem('loggedUser');

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as LoggedUser;
  } catch (error) {
    console.error('Erro ao ler usuário salvo:', error);
    localStorage.removeItem('loggedUser');
    return null;
  }
}

function App() {
  const handleLogout = () => {
    localStorage.removeItem('loggedUser');
    window.location.replace('/login');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard-cliente"
          element={
            <ProtectedRoute allowedRole="user">
              <ClientDashboard
                user={getStoredUser()}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="clientes" element={<ClientsPage />} />
          <Route path="rendimentos" element={<ReturnsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;