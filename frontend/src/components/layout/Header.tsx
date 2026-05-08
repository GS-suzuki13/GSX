import React, { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';

interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1120]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={logo}
            alt="Logo GSX"
            className="w-24 sm:w-28 h-auto object-contain shrink-0"
          />

          <div className="hidden sm:block w-px h-6 bg-white/10" />

        </div>

        <div className="hidden md:flex items-center">
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-white hover:bg-white/5 transition"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#111827] px-4 py-4">
          <div className="flex flex-col gap-3">

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLogout();
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      )}
    </header>
  );
}