import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ClientsPage from './pages/admin/ClientsPage';
import ReturnsPage from './pages/admin/ReturnsPage';
import ClientDashboard from './pages/ClientDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { LoggedUser } from './types';

function App() {
  const handleLogout = () => {
    localStorage.removeItem('loggedUser');
    window.location.href = '/login';
  };

  const storedUser = localStorage.getItem('loggedUser');
  const user: LoggedUser | null = storedUser ? JSON.parse(storedUser) : null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard-cliente"
          element={
            <ProtectedRoute allowedRole="user">
              {user ? (
                <ClientDashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )}
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