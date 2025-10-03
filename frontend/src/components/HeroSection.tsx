import React from 'react';
import { TrendingUp, Shield, Users, MapPin, Phone, FileText } from 'lucide-react';
import b3Logo from '../assets/b3-certifica.svg';
import cmlogo from '../assets/cm-capital.svg';

const HeroSection: React.FC = () => {
  return (
    <section
      id="inicio"
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1A2433 0%, #142737 100%)', // Gradiente de fundo
        padding: '0 20px',
      }}
    >
      <div className="container mx-auto text-center">
        <div className="mb-16">
          <h1
            className="text-secondary"
            style={{
              fontSize: '56px',
              fontWeight: '700',
              marginBottom: '20px',
            }}
          >
            GSX - Gestão de Ativos
          </h1>
          <p
            className="text-white/80"
            style={{
              fontSize: '20px',
              marginBottom: '40px',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            Plataforma moderna, confiável e intuitiva para gestão de ativos e operações financeiras.
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

        <hr className="my-16 border-t-2 border-white" />

        {/* Aumento da margem superior para ficar mais próximo da linha de separação */}
        <div className="mt-12 flex justify-between gap-8"> {/* Aumento de margem superior aqui */}
          <div className="flex items-center">
            <img src={b3Logo} alt="Certificado B3" className="w-16 h-16 mr-2" />
            <img src={cmlogo} alt="Certificado CM" className="w-16 h-16 mr-2" />
          </div>

          <div className="flex flex-col items-start text-secondary text-sm">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>Rua Heinruch Hemmer, 1900 - Blumenau, SC</span>
            </div>
            <div className="flex items-center mb-4">
              <Phone className="w-5 h-5 mr-2" />
              <span>(47) 99231-5995</span>
            </div>
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              <span>CNPJ: 57.488.705/0001-17</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
