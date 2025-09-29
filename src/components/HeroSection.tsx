import React from 'react';
import { TrendingUp, Shield, Users } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section id="inicio" className="pt-32 pb-16 bg-gradient-to-br from-primary to-primary/90">
      <div className="container mx-auto px-6">
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Bem-vindo à <span className="text-secondary">GSX</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed">
            A GSX é especialista em gestão de investimentos, oferecendo estratégias seguras e 
            personalizadas para maximizar seus resultados. Nosso compromisso é com transparência, 
            inovação e credibilidade.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center hover:bg-white/20 transition-all duration-300">
            <TrendingUp className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4 text-white">Estratégias Personalizadas</h3>
            <p className="text-white/80">
              Desenvolvemos estratégias únicas baseadas no seu perfil de risco e objetivos financeiros.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center hover:bg-white/20 transition-all duration-300">
            <Shield className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4 text-white">Transparência Total</h3>
            <p className="text-white/80">
              Relatórios detalhados e acesso completo às informações dos seus investimentos.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center hover:bg-white/20 transition-all duration-300">
            <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
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