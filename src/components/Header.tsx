import React, { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
}

const Header: React.FC<HeaderProps> = ({ activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { label: 'Login', link: '/login' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (link: string, target?: string) => {
    if (target === '_blank') {
      window.location.href = link;
      return;
    }

    if (link.startsWith('#')) {
      const element = document.getElementById(link.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = link;
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-primary shadow-lg">
      <div className="px-15 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-white">GSX</div>
          </div>
          
          <div className="hidden md:flex items-center">
            <button
              onClick={() => handleNavClick('/login')}
              className="flex items-center px-6 py-2.5 border-2 border-accent text-white hover:bg-accent hover:text-white transition-all duration-200 rounded-lg font-medium"
            >
              <User className="w-4 h-4 mr-2" />
              Login
            </button>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <button
              onClick={() => handleNavClick('/login')}
              className="flex items-center px-6 py-2.5 border-2 border-accent text-white hover:bg-accent hover:text-white transition-all duration-200 rounded-lg font-medium w-full justify-center"
            >
              <User className="w-4 h-4 mr-2" />
              Login
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;