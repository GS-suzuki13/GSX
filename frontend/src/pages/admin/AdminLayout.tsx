import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-black text-white p-6 flex flex-col">
        <h1 className="text-xl font-bold mb-8">Painel Admin</h1>

        <nav className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-left hover:text-gray-300 transition"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate('/admin/clientes')}
            className="text-left hover:text-gray-300 transition"
          >
            Clientes
          </button>

          <button
            onClick={() => navigate('/admin/rendimentos')}
            className="text-left hover:text-gray-300 transition"
          >
            Rendimentos
          </button>

          {/* <button
            onClick={() => navigate('/admin/relatorios')}
            className="text-left hover:text-gray-300 transition"
          >
            Relatórios
          </button> */}
        </nav>

        <div className="mt-auto">
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 mt-8 w-full"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 bg-[#0b1120]">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;