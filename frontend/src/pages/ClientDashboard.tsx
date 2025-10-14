import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { User } from '../types';
import { useClientReturns } from '../hooks/useClientReturns';
import Header from '../components/layout/Header';
import DashboardCard from '../components/DashboardCard';
import PerformanceChart from '../components/PerformanceChart';
import ReturnsTable from '../components/ReturnsTable';

interface Repasse {
  id: number;
  label: string;
  start: string;
  end: string;
}

interface ClientDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function ClientDashboard({ user, onLogout }: ClientDashboardProps) {
  const [fullName, setFullName] = useState<string | null>(null);
  const [repasses, setRepasses] = useState<Repasse[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [selectedRepasseId, setSelectedRepasseId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;
  const { total, last } = useClientReturns(user);

  useEffect(() => setFullName(user?.name ?? null), [user]);

  // Carrega repasses
  const loadRepasses = async () => {
    try {
      const res = await fetch(`${apiUrl}/repasse/${user.user}`);
      if (!res.ok) throw new Error('Erro ao carregar repasses');
      const data = await res.json();
      const repArray: Repasse[] = Array.isArray(data.repasses) ? data.repasses : data;
      setRepasses(repArray);

      // Seleciona o último repasse automaticamente
      if (repArray.length > 0) {
        setSelectedRepasseId(repArray[repArray.length - 1].id);
      } else {
        setSelectedRepasseId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Carrega rendimentos
  const loadReturns = async () => {
    try {
      const res = await fetch(`${apiUrl}/returns/${user.user}`);
      if (!res.ok) throw new Error('Erro ao carregar rendimentos');
      const data = await res.json();
      const parsed = data.map((r: any) => ({
        data: r.data,
        percentual: parseFloat(r.percentual),
        rendimento: parseFloat(r.rendimento),
        repasseId: r.repasseId,
        userId: r.userId,
      }));
      setReturns(parsed);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadRepasses();
      loadReturns();
    }
  }, [user]);

  // Filtro igual ao ClientDetailsModal
  const filteredReturns =
    returns
      .filter((r) =>
        selectedRepasseId ? r.repasseId === selectedRepasseId : r.userId === user.user
      )
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()) ?? [];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const getNextBusinessDay = (date: Date): Date => {
    const newDate = new Date(date);
    while (newDate.getDay() === 0 || newDate.getDay() === 6) newDate.setDate(newDate.getDate() + 1);
    return newDate;
  };

  const calculateNextRepasse = (dataCadastro: string, repasses: Repasse[]) => {
    const lastRepasseEnd = repasses.length
      ? new Date(repasses[repasses.length - 1].end)
      : new Date(dataCadastro);

    let result = new Date(lastRepasseEnd);
    let addedDays = 0;
    while (addedDays < 30) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) addedDays++;
    }
    return result.toLocaleDateString('pt-BR');
  };

  // Dados para gráfico
  const chartData = filteredReturns.map((r) => ({
    month: formatDate(r.data),
    value: r.rendimento,
  }));

  // Cards resumo
  const dashboardCards = [
    {
      title: 'Valor Aportado',
      value: `R$ ${user.valor_aportado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-8 h-8 text-[#1A2433]" />,
      color: 'blue' as const,
    },
    {
      title: 'Rendimento Bruto',
      value: `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: last ? `+${(last.percentual ?? 0).toFixed(2)}%` : '',
      icon: <TrendingUp className="w-8 h-8 text-[#00A676]" />,
      color: 'green' as const,
    },
    {
      title: 'Rendimento Líquido',
      value: `R$ ${(total * 0.7).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: last ? `+${(((total * 0.7) / (user.valor_aportado || 1)) * 100).toFixed(2)}%` : '',
      icon: <TrendingUp className="w-8 h-8 text-[#00A676]" />,
      color: 'green' as const,
    },
    {
      title: 'Seu Próximo Repasse',
      value: calculateNextRepasse(user.data_cadastro, repasses),
      icon: <Calendar className="w-8 h-8 text-[#1A2433]" />,
      color: 'purple' as const,
    },
  ];

  return (
    <div className="min-h-screen font-[Inter,sans-serif] bg-[#F4F5F7]">
      <Header title="Dashboard do Cliente" onLogout={onLogout} />

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

        {/* Dropdown de Repasse */}
        {repasses.length > 0 && (
          <div className="mb-4">
            <select
              value={selectedRepasseId ?? ''}
              onChange={(e) => setSelectedRepasseId(Number(e.target.value) || null)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Todos os rendimentos</option>
              {repasses.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  {rep.label} ({formatDate(rep.start)} - {formatDate(rep.end)})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Histórico de Rendimentos */}
        <section className="rounded-2xl p-8 shadow-sm bg-white">
          <h3 className="text-xl font-semibold mb-6 text-[#1A2433]">Histórico de Rendimentos</h3>

          {isLoading ? (
            <p className="text-gray-500">Carregando rendimentos...</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl p-4 shadow-sm min-h-[320px] bg-[#F4F5F7]">
                <PerformanceChart data={chartData} />
              </div>
              <div className="rounded-xl p-4 shadow-sm min-h-[320px] bg-[#F4F5F7]">
                <ReturnsTable
                  data={filteredReturns}
                  columns={[
                    { key: 'data', label: 'Data' },
                    {
                      key: 'rendimento',
                      label: 'Rendimento (R$)',
                      render: (v) => (
                        <span className="text-green-600 font-medium">
                          R$ {Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      ),
                      align: 'right',
                    },
                  ]}
                />
              </div>
            </div>
          )}
        </section>

        {/* Valor Bruto vs Valor Líquido */}
        <section className="rounded-2xl p-8 shadow-sm mt-8 bg-white">
          <h3 className="text-xl font-semibold mb-6 text-[#1A2433]">Valor Bruto vs Valor Líquido</h3>
          <div className="rounded-xl p-6 shadow-sm bg-[#F4F5F7]">
            <p className="text-[#1A2433] mb-2">
              <strong>Rendimento Bruto:</strong>{' '}
              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[#D64545] mb-2">
              <strong>GSX (30%):</strong>{' '}
              R$ {(total * 0.3).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[#00A676]">
              <strong>Rendimento Líquido:</strong>{' '}
              R$ {(total * 0.7).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
