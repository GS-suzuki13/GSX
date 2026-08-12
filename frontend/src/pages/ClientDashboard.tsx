import React, { useEffect, useMemo, useState } from 'react';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import type { LoggedUser, User, ClientReturn } from '../types';
import { CSVHandler } from '../utils/csvHandler';
import Header from '../components/layout/Header';
import PerformanceChart from '../components/PerformanceChart';
import ReturnsTable from '../components/ReturnsTable';

interface Repasse {
  id: number;
  label: string;
  start: string;
  end: string;
}

interface ClientDashboardProps {
  user: LoggedUser | null;
  onLogout: () => void;
}

export default function ClientDashboard({ user, onLogout }: ClientDashboardProps) {
  const [client, setClient] = useState<User | null>(null);
  const [repasses, setRepasses] = useState<Repasse[]>([]);
  const [returns, setReturns] = useState<ClientReturn[]>([]);
  const [selectedRepasseId, setSelectedRepasseId] = useState<number | 'all' | 'current'>('current');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  const formatDateOnly = (dateStr?: string) => {
    if (!dateStr) return '—';

    const raw = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [year, month, day] = raw.split('-');

    return year && month && day ? `${day}/${month}/${year}` : dateStr;
  };

  const parseLocalDate = (dateStr?: string) => {
    if (!dateStr) return new Date(0);

    const raw = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [year, month, day] = raw.split('-').map(Number);

    if (!year || !month || !day) return new Date(0);

    return new Date(year, month - 1, day);
  };

  const formatMoney = (value: number) =>
    `R$ ${Number(value || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const fetchJson = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      if (cancelled) return;

      setLoading(true);
      setError('');

      try {
        const users = await CSVHandler.getUsers();
        if (cancelled) return;

        const storedUser = user;

        if (!storedUser?.id && !storedUser?.username) {
          setClient(null);
          setRepasses([]);
          setReturns([]);
          setError('Usuário inválido.');
          setLoading(false);
          return;
        }

        const foundClient =
          users.find((u) => u.id === storedUser.id && u.token !== 'adm') ||
          users.find((u) => u.user === storedUser.username && u.token !== 'adm') ||
          null;

        if (!foundClient) {
          setClient(null);
          setRepasses([]);
          setReturns([]);
          setError('Não foi possível localizar os dados do cliente.');
          setLoading(false);
          return;
        }

        const [repasseResponse, returnsResponse] = await Promise.all([
          fetchJson(`${apiUrl}/repasse/${foundClient.id}`),
          fetchJson(`${apiUrl}/returns/${foundClient.id}`)
        ]);

        if (cancelled) return;

        const repassesData: Repasse[] = (
          Array.isArray((repasseResponse as any)?.repasses)
            ? (repasseResponse as any).repasses
            : Array.isArray(repasseResponse)
              ? repasseResponse
              : []
        )
          .filter((item: any) => item && item.id != null)
          .map((item: any) => ({
            id: Number(item.id),
            label: String(item.label ?? `Repasse ${item.id}`),
            start: String(item.start ?? ''),
            end: String(item.end ?? '')
          }));

        const returnsData: ClientReturn[] = (Array.isArray(returnsResponse) ? returnsResponse : [])
          .filter((item: any) => item)
          .map((item: any) => ({
            id: item.id,
            data: String(item.data ?? ''),
            percentual: Number(item.percentual) || 0,
            variacao: Number(item.variacao) || 0,
            rendimento: Number(item.rendimento) || 0,
            repasseId: item.repasseId ?? null,
            userId: item.userId
          }));

        setClient(foundClient);
        setRepasses(repassesData);
        setReturns(returnsData);
        setSelectedRepasseId('current');
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);

        if (cancelled) return;

        setClient(null);
        setRepasses([]);
        setReturns([]);
        setError('Erro ao carregar o dashboard do cliente.');
        setLoading(false);
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [apiUrl, user]);

  const filteredReturns = useMemo(() => {
    return [...returns]
      .filter((item) => {
        if (selectedRepasseId === 'all') return true;
        if (selectedRepasseId === 'current') return !item.repasseId;
        return item.repasseId === selectedRepasseId;
      })
      .sort((a, b) => parseLocalDate(a.data).getTime() - parseLocalDate(b.data).getTime());
  }, [returns, selectedRepasseId]);

  const totalBruto = useMemo(() => {
    return filteredReturns.reduce((sum, item) => sum + item.rendimento, 0);
  }, [filteredReturns]);

  const nextRepasse = useMemo(() => {
    if (!client?.data_cadastro) return '—';

    const baseDate = repasses.length
      ? parseLocalDate(repasses[repasses.length - 1].end)
      : parseLocalDate(client.data_cadastro);

    const result = new Date(baseDate);

    if (Number.isNaN(result.getTime())) return '—';

    let days = 0;

    while (days < 30) {
      result.setDate(result.getDate() + 1);
      if (![0, 6].includes(result.getDay())) days++;
    }

    return result.toLocaleDateString('pt-BR');
  }, [client, repasses]);

  const chartData = filteredReturns.map((item) => ({
    month: formatDateOnly(item.data),
    value: item.rendimento
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120]">
        <Header onLogout={onLogout} />

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl px-8 py-10 text-center shadow-2xl">
            <div className="w-10 h-10 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300 text-sm">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-[#0b1120]">
        <Header onLogout={onLogout} />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-300 shadow-lg">
            {error || 'Não foi possível carregar o cliente.'}
          </div>
        </main>
      </div>
    );
  }

  const cards = [
    {
      title: 'Valor Aportado',
      value: formatMoney(client.valor_aportado || 0),
      icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />,
      iconBg: 'bg-indigo-500/15',
      valueColor: 'text-white'
    },
    {
      title: 'Rendimento Bruto',
      value: formatMoney(totalBruto),
      icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />,
      iconBg: 'bg-emerald-500/15',
      valueColor: 'text-white'
    },
    {
      title: 'Rendimento Líquido',
      value: formatMoney(totalBruto * 0.7),
      icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />,
      iconBg: 'bg-green-500/15',
      valueColor: 'text-white'
    },
    {
      title: 'Próximo Repasse',
      value: nextRepasse,
      icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />,
      iconBg: 'bg-yellow-500/15',
      valueColor: 'text-white'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b1120]">
      <Header onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <section className="mb-8">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Olá, {client.name}
            </h2>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              Aqui está um resumo dos seus investimentos
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-white/20 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400 font-medium">{card.title}</p>
                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                  {card.icon}
                </div>
              </div>

              <p className={`text-2xl sm:text-3xl font-bold ${card.valueColor} break-words`}>
                {card.value}
              </p>
            </div>
          ))}
        </section>

        {repasses.length > 0 && (
          <section className="mb-6">
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 shadow-xl">
              <label className="block text-sm text-gray-400 mb-2">
                Filtrar rendimentos
              </label>

              <select
                value={
                  selectedRepasseId === 'all'
                    ? 'all'
                    : selectedRepasseId === 'current'
                      ? 'current'
                      : String(selectedRepasseId)
                }
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === 'all') setSelectedRepasseId('all');
                  else if (value === 'current') setSelectedRepasseId('current');
                  else setSelectedRepasseId(Number(value));
                }}
                className="w-full sm:w-auto min-w-[240px] bg-[#0f172a] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todos os rendimentos</option>
                <option value="current">Rendimento Atual</option>

                {repasses.map((rep) => (
                  <option key={rep.id} value={String(rep.id)}>
                    {rep.label} ({formatDateOnly(rep.start)} - {formatDateOnly(rep.end)})
                  </option>
                ))}
              </select>
            </div>
          </section>
        )}

        <section className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="mb-5">
            <h3 className="text-lg sm:text-xl font-semibold text-white">
              Histórico de Rendimentos
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Visualize a evolução dos seus rendimentos no período selecionado
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-2xl p-4 border border-white/10 bg-[#0f172a] min-h-[320px] shadow-lg">
              {chartData.length > 0 ? (
                <PerformanceChart data={chartData} />
              ) : (
                <div className="h-full min-h-[260px] flex items-center justify-center text-gray-500 text-sm text-center px-4">
                  Nenhum dado disponível para o gráfico
                </div>
              )}
            </div>

            <div className="rounded-2xl p-4 border border-white/10 bg-[#0f172a] min-h-[320px] shadow-lg">
              <ReturnsTable
                data={filteredReturns}
                columns={[
                  {
                    key: 'data',
                    label: 'Data',
                    render: (value) => (
                      <span className="text-gray-200">
                        {formatDateOnly(String(value))}
                      </span>
                    )
                  },
                  {
                    key: 'rendimento',
                    label: 'Rendimento (R$)',
                    render: (value) => (
                      <span className="text-emerald-400 font-medium">
                        R$ {Number(value).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    ),
                    align: 'right'
                  }
                ]}
              />
            </div>
          </div>
        </section>

        <section className="bg-[#111827] border border-white/10 rounded-2xl p-4 sm:p-6 mt-8 shadow-xl">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-white">
            Valor Bruto vs Valor Líquido
          </h3>

          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 shadow-lg space-y-3">
            <p className="text-gray-200">
              <strong className="text-white">Rendimento Bruto:</strong>{' '}
              {formatMoney(totalBruto)}
            </p>

            <p className="text-red-400">
              <strong className="text-red-300">GSX (30%):</strong>{' '}
              {formatMoney(totalBruto * 0.3)}
            </p>

            <p className="text-emerald-400 font-medium">
              <strong className="text-emerald-300">Rendimento Líquido:</strong>{' '}
              {formatMoney(totalBruto * 0.7)}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}