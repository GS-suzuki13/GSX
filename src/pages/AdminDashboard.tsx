import React from 'react';
import { Users, DollarSign, TrendingUp, AlertCircle, Download, Settings, LogOut } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import PerformanceChart from '../components/PerformanceChart';
import PieChart from '../components/PieChart';

const AdminDashboard: React.FC = () => {
  const adminData = {
    totalClientes: 1247,
    ativosGestao: 45600000,
    receitaTotal: 2100000,
    despesasOperacionais: 800000,
    lucroLiquido: 1300000,
    novosClientes: 23,
    retencaoClientes: 92.5,
    crescimentoAum: [
      { month: 'Jan', value: 42000000 },
      { month: 'Fev', value: 43200000 },
      { month: 'Mar', value: 44100000 },
      { month: 'Abr', value: 44800000 },
      { month: 'Mai', value: 45200000 },
      { month: 'Jun', value: 45600000 }
    ],
    alocacaoAtivos: [
      { name: 'Ações', value: 45 },
      { name: 'Renda Fixa', value: 30 },
      { name: 'Fundos', value: 20 },
      { name: 'Outros', value: 5 }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary mr-8">GSX</div>
              <h1 className="text-xl font-semibold text-gray-800">Dashboard do Administrador</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center text-gray-600 hover:text-secondary transition-colors">
                <Settings className="w-5 h-5 mr-2" />
                Configurações
              </button>
              <button className="flex items-center text-gray-600 hover:text-red-600 transition-colors">
                <LogOut className="w-5 h-5 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Painel de Controle
          </h2>
          <p className="text-gray-600">Visão geral da gestão e performance da empresa</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total de Clientes"
            value={adminData.totalClientes.toLocaleString('pt-BR')}
            icon={<Users className="w-8 h-8 text-blue-600" />}
            color="blue"
            change="+12%"
          />
          <DashboardCard
            title="Ativos Sob Gestão"
            value={`R$ ${(adminData.ativosGestao / 1000000).toFixed(1)}M`}
            icon={<DollarSign className="w-8 h-8 text-green-600" />}
            color="green"
            change="+8.5%"
          />
          <DashboardCard
            title="Receita Total"
            value={`R$ ${(adminData.receitaTotal / 1000000).toFixed(1)}M`}
            icon={<TrendingUp className="w-8 h-8 text-secondary" />}
            color="yellow"
            change="+15%"
          />
          <DashboardCard
            title="Lucro Líquido"
            value={`R$ ${(adminData.lucroLiquido / 1000000).toFixed(1)}M`}
            icon={<TrendingUp className="w-8 h-8 text-green-600" />}
            color="green"
            change="+18%"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Crescimento dos Ativos
              </h3>
              <button className="flex items-center text-secondary hover:text-secondary/80 transition-colors">
                <Download className="w-4 h-4 mr-1" />
                PDF
              </button>
            </div>
            <PerformanceChart data={adminData.crescimentoAum} />
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Distribuição de Ativos
            </h3>
            <PieChart data={adminData.alocacaoAtivos} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            title="Novos Clientes (Mês)"
            value={adminData.novosClientes.toString()}
            icon={<Users className="w-8 h-8 text-blue-600" />}
            color="blue"
          />
          <DashboardCard
            title="Taxa de Retenção"
            value={`${adminData.retencaoClientes}%`}
            icon={<TrendingUp className="w-8 h-8 text-green-600" />}
            color="green"
          />
          <DashboardCard
            title="Despesas Operacionais"
            value={`R$ ${(adminData.despesasOperacionais / 1000).toFixed(0)}K`}
            icon={<AlertCircle className="w-8 h-8 text-red-600" />}
            color="red"
          />
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Ações Rápidas
            </h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-800">Gerenciar Usuários</h4>
              <p className="text-sm text-gray-600">Criar, editar ou remover usuários</p>
            </button>
            <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
              <Download className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-semibold text-gray-800">Relatórios</h4>
              <p className="text-sm text-gray-600">Exportar dados em PDF/Excel</p>
            </button>
            <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-left">
              <AlertCircle className="w-8 h-8 text-yellow-600 mb-2" />
              <h4 className="font-semibold text-gray-800">Alertas</h4>
              <p className="text-sm text-gray-600">Visualizar notificações</p>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
              <Settings className="w-8 h-8 text-purple-600 mb-2" />
              <h4 className="font-semibold text-gray-800">Configurações</h4>
              <p className="text-sm text-gray-600">Ajustar parâmetros do sistema</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;