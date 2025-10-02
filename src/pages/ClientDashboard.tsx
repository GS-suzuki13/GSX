import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, LogOut } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import PerformanceChart from '../components/PerformanceChart';

const ClientDashboard: React.FC = () => {
  const clientData = {
    valorAportado: 150000,
    rendimentoBruto: 18500,
    rendimentoLiquido: 15200,
    rendimentoTotal: 165200,
    rendimentoUltimoMes: 2100,
    rendimentosMensais: [
      { month: 'Jan', value: 152000 },
      { month: 'Fev', value: 154500 },
      { month: 'Mar', value: 157200 },
      { month: 'Abr', value: 159800 },
      { month: 'Mai', value: 162100 },
      { month: 'Jun', value: 165200 }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-primary shadow-lg">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-white mr-8">GSX</div>
              <h1 className="text-xl font-semibold text-white">Dashboard do Cliente</h1>
            </div>
            <button className="flex items-center text-light hover:text-white transition-colors">
              <LogOut className="w-5 h-5 mr-2" />
              <span onClick={() => window.location.href = '/'}>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Olá, João Silva
          </h2>
          <p className="text-gray-600">Aqui está um resumo dos seus investimentos</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            title="Valor Aportado"
            value={`R$ ${clientData.valorAportado.toLocaleString('pt-BR')}`}
            icon={<DollarSign className="w-8 h-8 text-blue-600" />}
            color="blue"
          />
          <DashboardCard
            title="Rendimento Bruto"
            value={`R$ ${clientData.rendimentoBruto.toLocaleString('pt-BR')}`}
            icon={<TrendingUp className="w-8 h-8 text-green-600" />}
            color="green"
          />
          <DashboardCard
            title="Rendimento Líquido"
            value={`R$ ${clientData.rendimentoLiquido.toLocaleString('pt-BR')}`}
            icon={<TrendingUp className="w-8 h-8 text-green-600" />}
            color="green"
          />
          <DashboardCard
            title="Rendimento Total"
            value={`R$ ${clientData.rendimentoTotal.toLocaleString('pt-BR')}`}
            icon={<DollarSign className="w-8 h-8 text-purple-600" />}
            color="purple"
          />
          <DashboardCard
            title="Rendimento Último Mês"
            value={`R$ ${clientData.rendimentoUltimoMes.toLocaleString('pt-BR')}`}
            icon={<Calendar className="w-8 h-8 text-purple-600" />}
            color="purple"
          />
          <DashboardCard
            title="Rentabilidade"
            value={`${((clientData.rendimentoLiquido / clientData.valorAportado) * 100).toFixed(2)}%`}
            icon={<TrendingUp className="w-8 h-8 text-green-600" />}
            color="green"
          />
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Histórico de Rendimentos
          </h3>
          <PerformanceChart data={clientData.rendimentosMensais} />
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;