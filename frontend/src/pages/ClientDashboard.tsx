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
      <div className="min-h-screen bg-white">
        <Header title="Dashboard do Cliente" onLogout={onLogout} />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-white">
        <Header title="Dashboard do Cliente" onLogout={onLogout} />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
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
      icon: <DollarSign className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50 border border-blue-100 text-blue-700'
    },
    {
      title: 'Rendimento Bruto',
      value: formatMoney(totalBruto),
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      bg: 'bg-green-50 border border-green-100 text-green-700'
    },
    {
      title: 'Rendimento Líquido',
      value: formatMoney(totalBruto * 0.7),
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50 border border-emerald-100 text-emerald-700'
    },
    {
      title: 'Próximo Repasse',
      value: nextRepasse,
      icon: <Calendar className="w-6 h-6 text-gray-600" />,
      bg: 'bg-gray-50 border border-gray-200 text-gray-800'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header title="Dashboard do Cliente" onLogout={onLogout} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1A2433]">
            Olá, {client.name}
          </h2>
          <p className="text-gray-600">Aqui está um resumo dos seus investimentos</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
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
              className="px-3 py-2 border rounded-md text-sm"
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
        )}

        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-[#1A2433]">
            Histórico de Rendimentos
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl p-4 border bg-gray-50 min-h-[320px] shadow-sm">
              {chartData.length > 0 ? (
                <PerformanceChart data={chartData} />
              ) : (
                <div className="h-full min-h-[260px] flex items-center justify-center text-gray-500 text-sm">
                  Nenhum dado disponível para o gráfico
                </div>
              )}
            </div>

            <div className="rounded-xl p-4 border bg-gray-50 min-h-[320px] shadow-sm">
              <ReturnsTable
                data={filteredReturns}
                columns={[
                  {
                    key: 'data',
                    label: 'Data',
                    render: (value) => formatDateOnly(String(value))
                  },
                  {
                    key: 'rendimento',
                    label: 'Rendimento (R$)',
                    render: (value) => (
                      <span className="text-green-600 font-medium">
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

        <section className="bg-white border rounded-2xl shadow-sm p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4 text-[#1A2433]">
            Valor Bruto vs Valor Líquido
          </h3>

          <div className="bg-gray-50 border rounded-xl p-5 shadow-sm">
            <p className="text-[#1A2433] mb-2">
              <strong>Rendimento Bruto:</strong> {formatMoney(totalBruto)}
            </p>

            <p className="text-[#D64545] mb-2">
              <strong>GSX (30%):</strong> {formatMoney(totalBruto * 0.3)}
            </p>

            <p className="text-[#00A676] font-medium">
              <strong>Rendimento Líquido:</strong> {formatMoney(totalBruto * 0.7)}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}