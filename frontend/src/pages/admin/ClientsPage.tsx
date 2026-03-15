import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, CalendarDays, Search } from 'lucide-react';
import { User } from '../../types';
import { CSVHandler } from '../../utils/csvHandler';
import ClientRegistrationForm from '../../components/ClientRegistrationForm';
import ClientDetailsModal from '../../components/ClientDetailsModal';
import ClientNextBusinessDay from '../../components/admin/ClientNextBusinessDay';
import ClientTable from '../../components/admin/ClientTable';
import { calculateNextRepasseBusinessDays } from '../../utils/calculateNextRepasse';

type SortBy = 'nome' | 'percentual' | 'data' | 'data_modificacao';

export default function ClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('nome');
  const [loading, setLoading] = useState(true);

  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showNextBusinessDay, setShowNextBusinessDay] = useState(false);

  const [clientesProximoRepasse, setClientesProximoRepasse] = useState<
    (User & { proximoRepasse: string })[]
  >([]);

  const getNextBusinessDay = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    while ([0, 6].includes(date.getDay())) {
      date.setDate(date.getDate() + 1);
    }

    return date.toLocaleDateString('pt-BR');
  };

  const fetchClients = useCallback(async () => {
    setLoading(true);

    try {
      const data = await CSVHandler.getUsers();
      const onlyClients = data.filter((user) => user.token !== 'adm');

      setClients(onlyClients);

      const nextBusinessDate = getNextBusinessDay();

      const clientesComRepasse = onlyClients
        .filter((cliente) => cliente.data_cadastro)
        .filter(
          (cliente) =>
            calculateNextRepasseBusinessDays(cliente.data_cadastro) === nextBusinessDate
        )
        .map((cliente) => ({
          ...cliente,
          proximoRepasse: nextBusinessDate
        }));

      setClientesProximoRepasse(clientesComRepasse);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setClients([]);
      setClientesProximoRepasse([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleClientUpdated = (updated: User, action: 'edit' | 'delete') => {
    setClients((prev) =>
      action === 'delete'
        ? prev.filter((c) => c.user !== updated.user)
        : prev.map((c) => (c.user === updated.user ? updated : c))
    );
  };

  const filteredClients = useMemo(() => {
    const searched = clients.filter((client) =>
      client.name?.toLowerCase().includes(search.toLowerCase())
    );

    return searched.sort((a, b) => {
      const compare = (valA: any, valB: any) =>
        valA > valB ? 1 : valA < valB ? -1 : 0;

      switch (sortBy) {
        case 'nome':
          return compare(a.name, b.name);

        case 'percentual':
          return compare(
            b.percentual_contrato || 0,
            a.percentual_contrato || 0
          );

        case 'data':
          return compare(
            new Date(b.data_cadastro).getTime(),
            new Date(a.data_cadastro).getTime()
          );

        case 'data_modificacao':
          return compare(
            new Date(b.data_modificacao).getTime(),
            new Date(a.data_modificacao).getTime()
          );

        default:
          return 0;
      }
    });
  }, [clients, search, sortBy]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Clientes</h2>
          <p className="text-gray-400 text-sm">
            Gerencie investidores cadastrados, edite informações e acompanhe repasses
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowNextBusinessDay(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-[#1a2332] border border-white/10 text-white px-4 py-2 rounded-lg transition"
          >
            <CalendarDays size={18} />
            Próximos Repasses
          </button>

          <button
            onClick={() => setShowClientForm(true)}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={18} />
            Novo Cliente
          </button>
        </div>
      </div>

      <div className="bg-[#111827] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0f172a] border border-white/10 text-white rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="bg-[#0f172a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="nome">Ordenar por Nome</option>
          <option value="percentual">Ordenar por Percentual</option>
          <option value="data">Ordenar por Cadastro</option>
          <option value="data_modificacao">Ordenar por Última Alteração</option>
        </select>
      </div>

      <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">
            Carregando clientes...
          </div>
        ) : (
          <ClientTable
            clients={filteredClients}
            onSelectClient={setSelectedClient}
            onClientUpdated={handleClientUpdated}
          />
        )}
      </div>

      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onUpdated={fetchClients}
        />
      )}

      {showNextBusinessDay && (
        <ClientNextBusinessDay
          data={clientesProximoRepasse}
          onClose={() => setShowNextBusinessDay(false)}
        />
      )}

      {showClientForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
          <div className="max-w-2xl w-full">
            <ClientRegistrationForm
              onClientRegistered={(newUser) => {
                if (newUser.token !== 'adm') {
                  setClients((prev) => [...prev, newUser]);
                }
                setShowClientForm(false);
              }}
            />

            <button
              onClick={() => setShowClientForm(false)}
              className="mt-4 w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-red-600 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}