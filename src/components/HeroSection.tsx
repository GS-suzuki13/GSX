import React from 'react';

const HeroSection: React.FC = () => {
  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  return (
    <section id="inicio" className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
      <div className="px-5 text-center">
        <div className="text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            GSX Gestão de Ativos
          </h1>
          <p className="text-xl text-light mb-10 max-w-4xl mx-auto leading-relaxed">
            Plataforma moderna, confiável e intuitiva para gestão de ativos e operações financeiras.
          </p>
          <button
            onClick={handleLoginClick}
            className="bg-accent hover:bg-accent/90 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Entrar na Plataforma
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;