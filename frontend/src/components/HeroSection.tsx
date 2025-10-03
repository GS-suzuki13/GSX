import React from 'react';
import { TrendingUp, Shield, Users } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section
      id="inicio"
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1A2433 0%, #142737 100%)',
        padding: '0 20px'
      }}
    >
      <div className="container mx-auto text-center">
        {/* Título */}
        <div className="mb-16">
          <h1
            className="text-white"
            style={{
              fontSize: '56px',
              fontWeight: '700',
              marginBottom: '20px'
            }}
          >
            GSX Gestão de Ativos
          </h1>
          <p
            className="text-white/80"
            style={{
              fontSize: '20px',
              marginBottom: '40px',
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            Plataforma moderna, confiável e intuitiva para gestão de ativos e operações financeiras.
          </p>
        </div>

        {/* Cards de informações */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center hover:bg-white/20 transition-all duration-300">
            <TrendingUp className="w-12 h-12 text-[#00C896] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4 text-white">Estratégias Personalizadas</h3>
            <p className="text-white/80">
              Desenvolvemos estratégias únicas baseadas no seu perfil de risco e objetivos financeiros.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center hover:bg-white/20 transition-all duration-300">
            <Shield className="w-12 h-12 text-[#00C896] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4 text-white">Transparência Total</h3>
            <p className="text-white/80">
              Relatórios detalhados e acesso completo às informações dos seus investimentos.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center hover:bg-white/20 transition-all duration-300">
            <Users className="w-12 h-12 text-[#00C896] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4 text-white">Suporte Especializado</h3>
            <p className="text-white/80">
              Equipe de especialistas disponível para orientá-lo em suas decisões de investimento.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
