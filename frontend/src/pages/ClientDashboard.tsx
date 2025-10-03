import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, PieChart, Calendar } from 'lucide-react';
import { User } from '../types';
import { useClientReturns } from '../hooks/useClientReturns';
import MonthTabs from '../components/dashboard/MonthTabs';
import Header from '../components/layout/Header';
import DashboardCard from '../components/DashboardCard';
import PerformanceChart from '../components/PerformanceChart';
import ReturnsTable from '../components/ReturnsTable';

interface ClientDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function ClientDashboard({ user, onLogout }: ClientDashboardProps) {
  const [fullName, setFullName] = useState<string | null>(null);

  const {
    total,
    last,
    monthsGrouped,
    current,
    chart,
    selectedMonth,
    setSelectedMonth,
  } = useClientReturns(user);

  useEffect(() => setFullName(user?.name ?? null), [user]);

  const calculateNextRepasse = (dataCadastro: string): string => {
    const cadastroDate = new Date(dataCadastro);
    cadastroDate.setDate(cadastroDate.getDate() + 1);
    const today = new Date();

    cadastroDate.setFullYear(today.getFullYear(), today.getMonth(), cadastroDate.getDate());

    if (cadastroDate <= today) {
      cadastroDate.setMonth(cadastroDate.getMonth() + 1);
    }

    return cadastroDate.toLocaleDateString('pt-BR');
  };

  // Cards resumo
  const dashboardCards = [
    {
      title: 'Valor Aportado',
      value: `R$ ${user.valor_aportado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-8 h-8 text-[#1A2433]" />,
      color: 'blue' as const,
    },
    {
      title: 'Rendimento Bruto',
      value: `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: last ? `+${(last.percentual ?? 0).toFixed(2)}%` : '',
      icon: <TrendingUp className="w-8 h-8 text-[#00A676]" />,
      color: 'green' as const,
    },
    {
      title: 'Rendimento Líquido',
      value: `R$ ${(total * 0.7).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: last ? `+${((((total * 0.7 ) / (user.valor_aportado || 1)) * 100)).toFixed(2)}%` : '',
      icon: <TrendingUp className="w-8 h-8 text-[#00A676]" />,
      color: 'green' as const,
    },
    {
      title: 'Seu Proximo Repasse',
      value: calculateNextRepasse(user.data_cadastro),
      icon: <Calendar className="w-8 h-8 text-[#1A2433]" />,
      color: 'purple' as const,
    },
  ];

  return (
    <div className="min-h-screen font-[Inter,sans-serif] bg-[#F4F5F7]">
      <Header
        title="Dashboard do Cliente"
        onLogout={onLogout}
      />

      <main className="container mx-auto px-6 py-8">
        {/* Saudação */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2 text-[#1A2433]">
            {fullName ? `Olá, ${fullName}` : 'Carregando...'}
          </h2>
          <p className="text-[#4A5568]">Aqui está um resumo dos seus investimentos</p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, i) => (
            <DashboardCard key={i} {...card} />
          ))}
        </div>

        {/* Histórico de Rendimentos */}
        <section className="rounded-2xl p-8 shadow-sm bg-white">
          <h3 className="text-xl font-semibold mb-6 text-[#1A2433]">Histórico de Rendimentos</h3>

          <MonthTabs
            months={monthsGrouped}
            selected={selectedMonth}
            onSelect={setSelectedMonth}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl p-4 shadow-sm min-h-[320px] bg-[#F4F5F7]">
              <PerformanceChart data={chart} />
            </div>
            <div className="rounded-xl p-4 shadow-sm min-h-[320px] bg-[#F4F5F7]">
              <ReturnsTable
                data={current?.items ?? []}
                columns={[
                  { key: 'data', label: 'Data' },
                  {
                    key: 'rendimento',
                    label: 'Rendimento (R$)',
                    render: (v) => (
                      <span className="text-green-600 font-medium">
                        R$ {Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    ),
                    align: 'right',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Valor Bruto vs Valor Líquido */}
        <section className="rounded-2xl p-8 shadow-sm mt-8 bg-white">
          <h3 className="text-xl font-semibold mb-6 text-[#1A2433]">Valor Bruto vs Valor Líquido</h3>
          <div className="rounded-xl p-6 shadow-sm bg-[#F4F5F7]">
            <p className="text-[#1A2433] mb-2">
              <strong>Rendimento Bruto:</strong>{' '}
              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[#D64545] mb-2">
              <strong>GSX (30%):</strong>{' '}
              R$ {(total * 0.3).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[#00A676]">
              <strong>Rendimento Líquido:</strong>{' '}
              R$ {(total * 0.7).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
