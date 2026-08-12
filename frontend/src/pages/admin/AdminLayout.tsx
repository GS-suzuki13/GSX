import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  TrendingUp,
  CalendarDays,
  LogOut
} from 'lucide-react';
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
    <div className="min-h-screen bg-[#0b1120]">
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50
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

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => handleNavigate('/admin/dashboard')}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-white/5 transition text-gray-200 hover:text-white"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            onClick={() => handleNavigate('/admin/clientes')}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-white/5 transition text-gray-200 hover:text-white"
          >
            <Users size={18} />
            Clientes
          </button>

          <button
            onClick={() => handleNavigate('/admin/rendimentos')}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-white/5 transition text-gray-200 hover:text-white"
          >
            <TrendingUp size={18} />
            Rendimentos
          </button>

          <button
            onClick={() => handleNavigate('/admin/eventos')}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-white/5 transition text-gray-200 hover:text-white"
          >
            <CalendarDays size={18} />
            Eventos
          </button>
        </nav>

        <div className="mt-auto">
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-3 mt-8 w-full rounded-xl transition text-white font-medium"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col min-w-0 lg:ml-64">
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

        <main className="flex-1 min-h-screen p-4 sm:p-6 md:p-8 bg-[#0b1120]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;