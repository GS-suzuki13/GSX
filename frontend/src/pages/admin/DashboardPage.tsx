import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DollarSign, Users, Calendar, CalendarDays } from 'lucide-react';
import { CSVHandler } from '../../utils/csvHandler';
import type { User, Evento } from '../../types';
import { calculateNextRepasseBusinessDays } from '../../utils/calculateNextRepasse';
import RepasseCalendar from '../../components/admin/RepasseCalendar';

interface Repasse {
  id: number;
  label: string;
  start: string;
  end: string;
}

interface ClientWithRepasse extends User {
  proximoRepasse: string;
}

export default function DashboardPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [clientesProximoRepasse, setClientesProximoRepasse] = useState<ClientWithRepasse[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const parsePtBrDate = (date: string) => {
    const [day, month, year] = date.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const fetchRepasses = async (client: User): Promise<Repasse[]> => {
    try {
      const response = await fetch(`${apiUrl}/repasse/${client.id}`);
      if (!response.ok) return [];

      const data = await response.json();

      return Array.isArray(data?.repasses)
        ? data.repasses
        : Array.isArray(data)
          ? data
          : [];
    } catch {
      return [];
    }
  };

  const loadDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const [usersData, eventosData] = await Promise.all([
        CSVHandler.getUsers(),
        CSVHandler.getEventos(),
      ]);

      const onlyClients = usersData.filter((user) => user.token !== 'adm');

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const clientsWithRepasse = await Promise.all(
        onlyClients
          .filter((cliente) => cliente.data_cadastro)
          .map(async (cliente) => {
            const repasses = await fetchRepasses(cliente);

            const proximoRepasse = calculateNextRepasseBusinessDays(
              cliente.data_cadastro,
              repasses
            );

            return { ...cliente, proximoRepasse };
          })
      );

      const clientesDoMes = clientsWithRepasse.filter((cliente) => {
        if (!cliente.proximoRepasse || cliente.proximoRepasse === '—') return false;

        const date = parsePtBrDate(cliente.proximoRepasse);

        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      setClients(onlyClients);
      setEventos(eventosData);
      setClientesProximoRepasse(clientesDoMes);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setClients([]);
      setEventos([]);
      setClientesProximoRepasse([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const totalAportado = useMemo(() => {
    return clients.reduce((acc, client) => acc + Number(client.valor_aportado || 0), 0);
  }, [clients]);

  const eventosAtivos = eventos.filter((evento) => evento.status !== 'cancelado');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 mt-1 text-sm">
          Visão geral do sistema com repasses e eventos
        </p>
      </div>

      {loading ? (
        <div className="bg-[#111827] rounded-2xl p-10 border border-white/5 text-center text-gray-400">
          Carregando dados do dashboard...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
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
              title="Próximos Repasses"
              value={String(clientesProximoRepasse.length)}
              icon={<Calendar size={22} />}
              iconClassName="bg-yellow-600/20 text-yellow-400"
            />

            <Card
              title="Eventos Ativos"
              value={String(eventosAtivos.length)}
              icon={<CalendarDays size={22} />}
              iconClassName="bg-emerald-600/20 text-emerald-400"
            />
          </div>

          <RepasseCalendar
            clientesProximoRepasse={clientesProximoRepasse}
            eventos={eventos}
            onEventoUpdated={loadDashboardData}
          />
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
        <div className={`p-2 rounded-lg ${iconClassName}`}>{icon}</div>
      </div>

      <h3 className="text-2xl font-bold text-white break-words">{value}</h3>
    </div>
  );
}