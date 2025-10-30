import React from 'react';
import { TrendingUp, Shield, Users, MapPin, FileText } from 'lucide-react';
import b3Logo from '../assets/b3-certifica.svg';
import cmlogo from '../assets/cm-capital.svg';

const HeroSection: React.FC = () => {
  return (
    <section
      id="inicio"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A2433] to-[#142737] px-6 py-20 text-white"
    >
      <div className="w-full max-w-6xl text-center">
        {/* Cabeçalho */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-secondary mb-6">
            Bem-vindo à GSX – Gestão de Ativos
          </h1>
          <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            Aqui, você encontra um ambiente digital criado para facilitar o acompanhamento dos seus investimentos. 
            Nosso portal oferece um dashboard moderno, intuitivo e transparente — para que você tenha total clareza 
            sobre seus rendimentos e a tranquilidade de saber exatamente como seu patrimônio está evoluindo.
          </p>
          <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-3xl mx-auto mt-6">
            Na GSX, acreditamos que transparência gera confiança, e é com esse propósito que desenvolvemos 
            cada detalhe da sua experiência conosco.
          </p>
        </div>

        {/* Cards de destaque */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-2xl p-8 transition-all duration-300 shadow-lg">
            <TrendingUp className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-3 text-white">Dashboard Inteligente</h3>
            <p className="text-white/80 text-sm">
              Acompanhe o desempenho do seu portfólio em tempo real com gráficos e relatórios interativos.
            </p>
          </div>

          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-2xl p-8 transition-all duration-300 shadow-lg">
            <Shield className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-3 text-white">Segurança e Transparência</h3>
            <p className="text-white/80 text-sm">
              Suas informações são protegidas e você tem total acesso a todos os detalhes dos seus investimentos.
            </p>
          </div>

          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-2xl p-8 transition-all duration-300 shadow-lg">
            <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-3 text-white">Suporte Personalizado</h3>
            <p className="text-white/80 text-sm">
              Nossa equipe está disponível para oferecer orientação especializada sempre que você precisar.
            </p>
          </div>
        </div>

        {/* Linha divisória */}
        <hr className="border-white/20 mb-10" />

        {/* Rodapé com certificações e informações */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-white/70">
          <div className="flex items-center justify-center gap-4">
            <img src={b3Logo} alt="Certificação B3" className="w-16 h-16" />
            <img src={cmlogo} alt="CM Capital" className="w-16 h-16" />
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-secondary" />
              <span>Rua XV de Novembro, 727, 2º andar, Centro, Blumenau/SC</span>
            </div>
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-secondary" />
              <span>CNPJ: 57.488.705/0001-17</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
