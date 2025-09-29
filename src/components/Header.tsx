import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
}

const Header: React.FC<HeaderProps> = ({ activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { label: 'Início', link: '#inicio' },
    { label: 'Simule Agora', link: '#simule' },
    { label: 'Contato', link: '#contato' },
    { label: 'Login', link: '/login', target: '_blank' }
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
      window.open(link, '_blank');
      return;
    }

    if (link.startsWith('#')) {
      const element = document.getElementById(link.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-primary shadow-lg' : 'bg-primary/95 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white">GSX</div>
          
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavClick(item.link, item.target)}
                className={`text-white hover:text-secondary transition-colors duration-200 ${
                  activeSection === item.link.slice(1) ? 'text-secondary' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(item.link, item.target)}
                  className="text-white hover:text-secondary transition-colors duration-200 text-left"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;