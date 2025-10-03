import React, { useState, useEffect } from 'react';
import { Menu, User, X } from 'lucide-react';
import logo from '../assets/white-logo.png'

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
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-primary shadow-lg' : 'bg-primary/95 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
            <img
              src={logo}
              alt="Logo GSX"
              className="w-32 h-auto mr-8"
            />
          
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavClick(item.link, item.label)}
                className={`flex items-center text-white hover:bg-secondary hover:text-primary transition-all duration-200 py-2 px-4 rounded-md ${
                  activeSection === item.link.slice(1) ? 'text-secondary bg-primary' : ''
                }`}
              >
                {item.label === 'Login' && <User className="mr-2 w-5 h-5" />}
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
                  onClick={() => handleNavClick(item.link, item.label)}
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