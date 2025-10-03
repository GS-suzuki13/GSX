// src/components/Header.tsx
import { LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  onLogout: () => void;
}

export default function Header({ title, onLogout }: HeaderProps) {
  return (
    <header className="shadow-sm bg-white">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src="./logo.png" alt="Logo GSX" className="w-32 h-auto mr-8" />
          <h1 className="text-xl font-semibold text-[#1A2433]">
            {title}
          </h1>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center text-[#1A2433] transition-colors hover:text-[#00A676]"
        >
          <LogOut className="w-5 h-5 mr-2" /> Sair
        </button>
      </div>
    </header>
  );
}
