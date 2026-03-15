import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ClientsPage from './pages/admin/ClientsPage';
import ReturnsPage from './pages/admin/ReturnsPage';
import ReportsPage from './pages/admin/ReportsPage';
import ClientDashboard from './pages/ClientDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const handleLogout = () => {
    localStorage.removeItem('loggedUser');
    window.location.href = '/login';
  };

  const storedUser = localStorage.getItem('loggedUser');
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard-cliente"
          element={
            <ProtectedRoute allowedRole="user">
              <ClientDashboard user={user} onLogout={handleLogout} />
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
          {/* <Route path="relatorios" element={<ReportsPage />} /> */}
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;