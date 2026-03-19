import React, { useEffect, useMemo, useState } from 'react';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { LoggedUser, User, ClientReturn } from '../types';
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
  user: LoggedUser;
  onLogout: () => void;
}

export default function ClientDashboard({ user, onLogout }: ClientDashboardProps) {
  const [clientData, setClientData] = useState<User | null>(null);
  const [repasses, setRepasses] = useState<Repasse[]>([]);
  const [returns, setReturns] = useState<ClientReturn[]>([]);
  const [selectedRepasseId, setSelectedRepasseId] = useState<number | 'all' | 'current' | null>('current');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  const formatDateOnly = (dateStr?: string) => {
    if (!dateStr) return '—';

    const raw = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [year, month, day] = raw.split('-');

    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }

    return dateStr;
  };

  const loadClientData = async (): Promise<User | null> => {
    try {
      const users = await CSVHandler.getUsers();

      const foundClient =
        users.find((u) => u.id === user.id && u.token !== 'adm') ||
        users.find((u) => u.user === user.username && u.token !== 'adm') ||
        null;

      setClientData(foundClient);
      return foundClient;
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
      setClientData(null);
      return null;
    }
  };

  const tryFetchJson = async (urls: string[]) => {
    for (const url of urls) {
      try {
        const res = await fetch(url);

        if (res.status === 404) {
          continue;
        }

        if (!res.ok) {
          console.error(`Erro ao consultar ${url}:`, res.status);
          continue;
        }

        return await res.json();
      } catch (error) {
        console.error(`Erro ao consultar ${url}:`, error);
      }
    }

    return null;
  };

  const loadRepasses = async (client: User) => {
    const data = await tryFetchJson([
      `${apiUrl}/repasse/${client.id}`,
      `${apiUrl}/repasse/${client.user}`
    ]);

    if (!data) {
      setRepasses([]);
      setSelectedRepasseId('current');
      return;
    }

    const repArray = Array.isArray(data?.repasses)
      ? data.repasses
      : Array.isArray(data)
        ? data
        : [];

    setRepasses(repArray);
    setSelectedRepasseId(repArray.length ? repArray[repArray.length - 1].id : 'current');
  };

  const loadReturns = async (client: User) => {
    const data = await tryFetchJson([
      `${apiUrl}/returns/${client.id}`,
      `${apiUrl}/returns/${client.user}`
    ]);

    if (!data) {
      setReturns([]);
      return;
    }

    const normalized: ClientReturn[] = (Array.isArray(data) ? data : []).map((r: any) => ({
      data: r.data,
      percentual: Number(r.percentual) || 0,
      variacao: Number(r.variacao) || 0,
      rendimento: Number(r.rendimento) || 0,
      repasseId: r.repasseId ?? null,
      userId: r.userId
    }));

    setReturns(normalized);
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const client = await loadClientData();

        if (!client) {
          if (isMounted) {
            setLoadError('Não foi possível localizar os dados do cliente.');
            setIsLoading(false);
          }
          return;
        }

        await Promise.all([
          loadRepasses(client),
          loadReturns(client)
        ]);

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro ao inicializar dashboard do cliente:', error);
        if (isMounted) {
          setLoadError('Erro ao carregar o dashboard do cliente.');
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [user.id, user.username]);

  const filteredReturns = useMemo(() => {
    return [...returns]
      .filter((r) => {
        if (selectedRepasseId === 'all') return true;
        if (selectedRepasseId === 'current' || selectedRepasseId === null) return !r.repasseId;
        return r.repasseId === selectedRepasseId;
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [returns, selectedRepasseId]);

  const filteredTotal = useMemo(() => {
    return filteredReturns.reduce((sum, r) => sum + (r.rendimento ?? 0), 0);
  }, [filteredReturns]);

  const calculateNextRepasse = (dataCadastro: string, list: Repasse[]) => {
    const baseDate = list.length ? new Date(list[list.length - 1].end) : new Date(dataCadastro);
    const result = new Date(baseDate);

    if (Number.isNaN(result.getTime())) return '—';

    let days = 0;
    while (days < 30) {
      result.setDate(result.getDate() + 1);
      if (![0, 6].includes(result.getDay())) days++;
    }

    return result.toLocaleDateString('pt-BR');
  };

  const chartData = filteredReturns.map((r) => ({
    month: formatDateOnly(r.data),
    value: r.rendimento
  }));

  const formatMoney = (value: number) =>
    `R$ ${Number(value || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const dashboardCards = [
    {
      title: 'Valor Aportado',
      value: formatMoney(clientData?.valor_aportado || 0),
      icon: <DollarSign className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50 border border-blue-100 text-blue-700'
    },
    {
      title: 'Rendimento Bruto',
      value: formatMoney(filteredTotal),
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      bg: 'bg-green-50 border border-green-100 text-green-700'
    },
    {
      title: 'Rendimento Líquido',
      value: formatMoney(filteredTotal * 0.7),
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50 border border-emerald-100 text-emerald-700'
    },
    {
      title: 'Próximo Repasse',
      value: clientData?.data_cadastro
        ? calculateNextRepasse(clientData.data_cadastro, repasses)
        : '—',
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
            {clientData?.name ? `Olá, ${clientData.name}` : 'Carregando...'}
          </h2>
          <p className="text-gray-600">Aqui está um resumo dos seus investimentos</p>
        </div>

        {loadError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
            {loadError}
          </div>
        ) : (
          <>
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
                    selectedRepasseId === 'current'
                      ? 'current'
                      : selectedRepasseId === 'all'
                        ? 'all'
                        : selectedRepasseId === null
                          ? 'current'
                          : String(selectedRepasseId)
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'all') setSelectedRepasseId('all');
                    else if (v === 'current') setSelectedRepasseId('current');
                    else setSelectedRepasseId(Number(v));
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

              {isLoading ? (
                <p className="text-gray-500">Carregando rendimentos...</p>
              ) : (
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
                          render: (v) => {
                            if (!v) return '—';

                            const [year, month, day] = v.split('-');
                            return `${day}/${month}/${year}`;
                          }
                        },
                        {
                          key: 'rendimento',
                          label: 'Rendimento (R$)',
                          render: (v) => (
                            <span className="text-green-600 font-medium">
                              R$ {Number(v).toLocaleString('pt-BR', {
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
              )}
            </section>

            <section className="bg-white border rounded-2xl shadow-sm p-6 mt-8">
              <h3 className="text-lg font-semibold mb-4 text-[#1A2433]">
                Valor Bruto vs Valor Líquido
              </h3>

              <div className="bg-gray-50 border rounded-xl p-5 shadow-sm">
                <p className="text-[#1A2433] mb-2">
                  <strong>Rendimento Bruto:</strong>{' '}
                  R$ {filteredTotal.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>

                <p className="text-[#D64545] mb-2">
                  <strong>GSX (30%):</strong>{' '}
                  R$ {(filteredTotal * 0.3).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>

                <p className="text-[#00A676] font-medium">
                  <strong>Rendimento Líquido:</strong>{' '}
                  R$ {(filteredTotal * 0.7).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}