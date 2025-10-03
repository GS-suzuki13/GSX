import React, { Suspense } from 'react';

// Lazy load components
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
  const path = window.location.pathname;

  const renderPage = () => {
    switch (path) {
      case '/login':
        return <Login />;
      case '/dashboard-cliente':
        return <ClientDashboard 
                user={JSON.parse(localStorage.getItem("loggedUser") || "{}")}
                onLogout={() => {
                  localStorage.removeItem("loggedUser");
                  window.location.href = "/";
                }}
              />;
      case '/dashboard-admin':
        return (
          <AdminDashboard
            user={JSON.parse(localStorage.getItem("loggedUser") || "{}")}
            onLogout={() => {
              localStorage.removeItem("loggedUser");
              window.location.href = "/";
            }}
          />
        );
      default:
        return <App />;
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {renderPage()}
    </Suspense>
  );
};