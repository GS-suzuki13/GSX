import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { User } from '../types';
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
  const [selectedRepasseId, setSelectedRepasseId] = useState<number | null | 'all' | 'current'>('current');
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => setFullName(user?.name ?? null), [user]);

  const loadRepasses = async () => {
    try {
      const res = await fetch(`${apiUrl}/repasse/${user.id}`);
      if (!res.ok) throw new Error('Erro ao carregar repasses');
      const data = await res.json();
      const repArray: Repasse[] = Array.isArray(data.repasses) ? data.repasses : data;
      setRepasses(repArray);
      if (repArray.length > 0) setSelectedRepasseId(repArray[repArray.length - 1].id);
      else setSelectedRepasseId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReturns = async () => {
    try {
      const res = await fetch(`${apiUrl}/returns/${user.id}`);
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
    loadRepasses();
    loadReturns();
  }, [user]);

  const filteredReturns = returns
    .filter(r => {
      if (selectedRepasseId === 'all') return true;
      if (selectedRepasseId === 'current') return !r.repasseId;
      if (selectedRepasseId === null) return !r.repasseId;
      return r.repasseId === selectedRepasseId;
    })
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const filteredTotal = filteredReturns.reduce((acc, r) => acc + (r.rendimento ?? 0), 0);
  const filteredLast = filteredReturns.length > 0 ? filteredReturns[filteredReturns.length - 1] : null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
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

  const chartData = filteredReturns.map((r) => ({
    month: formatDate(r.data),
    value: r.rendimento,
  }));

  const dashboardCards = [
    {
      title: 'Valor Aportado',
      value: `R$ ${(user.valor_aportado ?? 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      icon: <DollarSign className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50 border border-blue-100 text-blue-700',
    },
    {
      title: 'Rendimento Bruto',
      value: `R$ ${filteredTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      bg: 'bg-green-50 border border-green-100 text-green-700',
    },
    {
      title: 'Rendimento Líquido',
      value: `R$ ${(filteredTotal * 0.7).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50 border border-emerald-100 text-emerald-700',
    },
    {
      title: 'Próximo Repasse',
      value: calculateNextRepasse(user.data_cadastro, repasses),
      icon: <Calendar className="w-6 h-6 text-gray-600" />,
      bg: 'bg-gray-50 border border-gray-200 text-gray-800',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header title="Dashboard do Cliente" onLogout={onLogout} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1A2433]">
            {fullName ? `Olá, ${fullName}` : 'Carregando...'}
          </h2>
          <p className="text-gray-600">Aqui está um resumo dos seus investimentos</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {dashboardCards.map((card, i) => (
            <div
              key={i}
              className={`${card.bg} rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{card.title}</p>
                {card.icon}
              </div>
              <p className="text-2xl font-bold mt-2">{card.value}</p>
            </div>
          ))}
        </div>

        {repasses.length > 0 && (
          <div className="mb-6">
            <select
              value={
                selectedRepasseId === 'current' ? 'current'
                  : selectedRepasseId === 'all' ? 'all'
                    : selectedRepasseId === null ? 'current'
                      : String(selectedRepasseId)
              }
              onChange={e => {
                const v = e.target.value;
                if (v === 'all') setSelectedRepasseId('all');
                else if (v === 'current') setSelectedRepasseId('current');
                else setSelectedRepasseId(Number(v));
              }}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">Todos os rendimentos</option>
              <option value="current">Rendimento Atual</option>
              {repasses.map(rep => (
                <option key={rep.id} value={String(rep.id)}>
                  {rep.label} ({formatDate(rep.start)} - {formatDate(rep.end)})
                </option>
              ))}
            </select>
          </div>
        )}

        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-[#1A2433]">Histórico de Rendimentos</h3>
          {isLoading ? (
            <p className="text-gray-500">Carregando rendimentos...</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl p-4 border bg-gray-50 min-h-[320px] shadow-sm">
                <PerformanceChart data={chartData} />
              </div>
              <div className="rounded-xl p-4 border bg-gray-50 min-h-[320px] shadow-sm">
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

        <section className="bg-white border rounded-2xl shadow-sm p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4 text-[#1A2433]">Valor Bruto vs Valor Líquido</h3>
          <div className="bg-gray-50 border rounded-xl p-5 shadow-sm">
            <p className="text-[#1A2433] mb-2">
              <strong>Rendimento Bruto:</strong> R$ {filteredTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[#D64545] mb-2">
              <strong>GSX (30%):</strong> R$ {(filteredTotal * 0.3).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[#00A676] font-medium">
              <strong>Rendimento Líquido:</strong> R$ {(filteredTotal * 0.7).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
