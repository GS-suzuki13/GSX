import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';

interface AdminLayoutProps {
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          h-screen w-64 bg-black text-white p-6 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex items-center justify-between mb-8 lg:block">
          <img
            src={logo}
            alt="Logo"
            className="w-32 object-contain"
          />

          <button
            onClick={() => setMenuOpen(false)}
            className="lg:hidden text-white hover:text-gray-300 transition"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          <button
            onClick={() => handleNavigate('/admin/dashboard')}
            className="text-left hover:text-gray-300 transition"
          >
            Dashboard
          </button>

          <button
            onClick={() => handleNavigate('/admin/clientes')}
            className="text-left hover:text-gray-300 transition"
          >
            Clientes
          </button>

          <button
            onClick={() => handleNavigate('/admin/rendimentos')}
            className="text-left hover:text-gray-300 transition"
          >
            Rendimentos
          </button>
        </nav>

        <div className="mt-auto">
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 mt-8 w-full transition"
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-black text-white px-4 py-4 flex items-center justify-between sticky top-0 z-30">
          <img
            src={logo}
            alt="Logo"
            className="w-32 object-contain"
          />

          <button
            onClick={() => setMenuOpen(true)}
            className="text-white hover:text-gray-300 transition"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-[#0b1120]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;