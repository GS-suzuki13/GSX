import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DollarSign, Users, Calendar } from 'lucide-react';
import { CSVHandler } from '../../utils/csvHandler';
import { User } from '../../types';
import { calculateNextRepasseBusinessDays } from '../../utils/calculateNextRepasse';

export default function DashboardPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const getNextBusinessDay = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    while ([0, 6].includes(date.getDay())) {
      date.setDate(date.getDate() + 1);
    }

    return date.toLocaleDateString('pt-BR');
  };

  const loadDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const data = await CSVHandler.getUsers();
      const onlyClients = data.filter((user) => user.token !== 'adm');
      setClients(onlyClients);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const nextBusinessDate = useMemo(() => getNextBusinessDay(), []);

  const totalAportado = useMemo(() => {
    return clients.reduce((acc, client) => acc + Number(client.valor_aportado || 0), 0);
  }, [clients]);

  const clientesProximoRepasse = useMemo(() => {
    return clients
      .filter((cliente) => cliente.data_cadastro)
      .filter(
        (cliente) =>
          calculateNextRepasseBusinessDays(cliente.data_cadastro) === nextBusinessDate
      )
      .map((cliente) => ({
        ...cliente,
        proximoRepasse: nextBusinessDate
      }));
  }, [clients, nextBusinessDate]);

  const clientesRecentes = useMemo(() => {
    return [...clients]
      .filter((client) => client.data_cadastro)
      .sort(
        (a, b) =>
          new Date(b.data_cadastro).getTime() - new Date(a.data_cadastro).getTime()
      )
      .slice(0, 5);
  }, [clients]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">
          Dashboard
        </h2>
        <p className="text-gray-400 mt-1 text-sm">
          Visão geral do sistema com dados reais do banco
        </p>
      </div>

      {loading ? (
        <div className="bg-[#111827] rounded-2xl p-10 border border-white/5 text-center text-gray-400">
          Carregando dados do dashboard...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <Card
              title="Total Aportado"
              value={formatCurrency(totalAportado)}
              icon={<DollarSign size={22} />}
              iconClassName="bg-indigo-600/20 text-indigo-400"
            />

            <Card
              title="Clientes Ativos"
              value={String(clients.length)}
              icon={<Users size={22} />}
              iconClassName="bg-blue-600/20 text-blue-400"
            />

            <Card
              title="Clientes com Próximo Repasse"
              value={String(clientesProximoRepasse.length)}
              icon={<Calendar size={22} />}
              iconClassName="bg-yellow-600/20 text-yellow-400"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-[#111827] rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">
                Resumo Financeiro
              </h3>

              <div className="space-y-4">
                <div className="bg-[#0f172a] border border-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Total aportado em carteira</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {formatCurrency(totalAportado)}
                  </p>
                </div>

                <div className="bg-[#0f172a] border border-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Clientes ativos</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {clients.length}
                  </p>
                </div>

                <div className="bg-[#0f172a] border border-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Clientes com próximo repasse</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {clientesProximoRepasse.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Data considerada: {nextBusinessDate}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#111827] rounded-2xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">
                Próximos Repasses
              </h3>

              {clientesProximoRepasse.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  Nenhum cliente com repasse previsto para {nextBusinessDate}.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientesProximoRepasse.map((client) => (
                    <div
                      key={client.user}
                      className="bg-[#0f172a] border border-white/5 rounded-xl p-4"
                    >
                      <p className="text-white font-medium">{client.name}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Usuário: {client.user}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Próximo repasse: {client.proximoRepasse}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#111827] rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">
              Clientes Recentes
            </h3>

            {clientesRecentes.length === 0 ? (
              <div className="text-gray-500 text-sm">
                Nenhum cliente cadastrado.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                {clientesRecentes.map((client) => (
                  <div
                    key={client.user}
                    className="bg-[#0f172a] border border-white/5 rounded-xl p-4"
                  >
                    <p className="text-white font-medium">{client.name}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Usuário: {client.user}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Cadastro:{' '}
                      {client.data_cadastro
                        ? new Date(client.data_cadastro).toLocaleDateString('pt-BR')
                        : '-'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Aportado: {formatCurrency(Number(client.valor_aportado || 0))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface CardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconClassName: string;
}

function Card({ title, value, icon, iconClassName }: CardProps) {
  return (
    <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm">{title}</span>

        <div className={`p-2 rounded-lg ${iconClassName}`}>
          {icon}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white break-words">
        {value}
      </h3>
    </div>
  );
}