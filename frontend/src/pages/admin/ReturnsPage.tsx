import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Save, Search, Plus, ClipboardList, TrendingUp } from 'lucide-react';
import { CSVHandler } from '../../utils/csvHandler';
import type { User, ClientReturn } from '../../types';
import ReturnsManagerModal from '../../components/ReturnsManagerModal';

interface ClientWithLastReturn extends User {
  ultimoRendimento?: number;
  ultimoPercentual?: number;
}

export default function ReturnsPage() {
  const [clients, setClients] = useState<ClientWithLastReturn[]>([]);
  const [percentualGeral, setPercentualGeral] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);

    try {
      const data = await CSVHandler.getUsers();
      const onlyClients = data.filter((user) => user.token !== 'adm');

      const clientsWithLastReturn: ClientWithLastReturn[] = await Promise.all(
        onlyClients.map(async (client) => {
          try {
            const returns: ClientReturn[] = await CSVHandler.getClientReturns(client.id);

            const ordered = [...(Array.isArray(returns) ? returns : [])].sort(
              (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
            );

            const latestReturn = ordered[0];

            return {
              ...client,
              ultimoRendimento: Number(latestReturn?.rendimento || 0),
              ultimoPercentual: Number(latestReturn?.percentual || 0)
            };
          } catch (error) {
            console.error(`Erro ao buscar retornos de ${client.name}.`, error);

            return {
              ...client,
              ultimoRendimento: 0,
              ultimoPercentual: 0
            };
          }
        })
      );

      setClients(clientsWithLastReturn);
    } catch (error) {
      console.error('Erro ao carregar clientes.', error);
      alert('Erro ao carregar clientes.');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchClients();
  }, [fetchClients]);

  const handleAddGeneralReturn = async () => {
    const parsedPercentualGeral = Number(percentualGeral);

    if (Number.isNaN(parsedPercentualGeral) || parsedPercentualGeral <= 0) {
      alert('Informe um percentual geral válido.');
      return;
    }

    if (!clients.length) {
      alert('Nenhum cliente disponível para aplicar o rendimento.');
      return;
    }

    const confirmApply = window.confirm(
      `Aplicar ${parsedPercentualGeral}% de rendimento geral para todos os clientes?`
    );

    if (!confirmApply) return;

    try {
      setSubmitting(true);

      const today = new Date().toISOString().split('T')[0];

      const results = await Promise.allSettled(
        clients.map(async (client) => {
          const percentualAplicado =
            (parsedPercentualGeral / 100) * ((client.percentual_contrato || 0) / 100);

          const percentualFinal = percentualAplicado * 100;
          const rendimento = (client.valor_aportado || 0) * percentualAplicado;
          const variacao = percentualFinal - (client.ultimoPercentual || 0);

          const returnData: ClientReturn = {
            data: today,
            percentual: Number(percentualFinal.toFixed(3)),
            variacao: Number(variacao.toFixed(3)),
            rendimento: Number(rendimento.toFixed(2))
          };

          await CSVHandler.addClientReturn(client.id, returnData);

          return client.name;
        })
      );

      const errors = results
        .map((result, index) =>
          result.status === 'rejected' ? clients[index].name : null
        )
        .filter((name): name is string => Boolean(name));

      if (errors.length > 0) {
        alert(`Rendimento aplicado parcialmente.\nFalha para: ${errors.join(', ')}`);
      } else {
        alert('Rendimento geral registrado com sucesso para todos os clientes!');
      }

      setPercentualGeral('');
      await fetchClients();
    } catch (error) {
      console.error('Erro ao registrar rendimento geral.', error);
      alert('Erro ao registrar rendimento geral.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return clients.filter((client) =>
      client.name.toLowerCase().includes(normalizedSearch)
    );
  }, [clients, search]);

  const formatCurrency = (value: number) =>
    Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

  const formatDateTime = (date?: string) => {
    if (!date) return '—';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return '—';

    return (
      parsed.toLocaleDateString('pt-BR') +
      ' ' +
      parsed.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">
          Rendimentos
        </h2>
        <p className="text-gray-400 text-sm">
          Aplique rendimento geral para todos os clientes e gerencie o histórico individual
        </p>
      </div>

      <div className="bg-[#111827] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Plus size={18} className="text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">
            Adição Geral de Rendimento
          </h3>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:items-end">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Percentual Geral (%)
              </label>

              <div className="relative">
                <TrendingUp
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="number"
                  step="0.01"
                  value={percentualGeral}
                  onChange={(e) => setPercentualGeral(e.target.value)}
                  className="w-full h-12 bg-[#0f172a] border border-white/10 text-white rounded-lg pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: 2.50"
                />
              </div>
            </div>

            <button
              onClick={handleAddGeneralReturn}
              disabled={submitting || loading}
              className="h-12 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition px-5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
            >
              <Save size={18} />
              {submitting ? 'Aplicando...' : 'Aplicar para Todos'}
            </button>
          </div>

          <p className="text-xs text-gray-500">
            O sistema aplicará esse percentual para todos os clientes com base no percentual de contrato de cada um.
          </p>
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
      </div>

      <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">
            Carregando clientes...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="bg-[#0f172a] text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Última alteração</th>
                  <th className="px-6 py-4">Último rendimento</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-t border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {client.name}
                    </td>

                    <td className="px-6 py-4 text-gray-300">
                      {formatDateTime(client.data_modificacao)}
                    </td>

                    <td className="px-6 py-4 text-emerald-400 font-medium">
                      {formatCurrency(client.ultimoRendimento || 0)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="inline-flex items-center gap-2 bg-[#0f172a] hover:bg-[#162033] border border-white/10 text-white px-3 py-2 rounded-lg transition"
                        >
                          <ClipboardList size={16} />
                          Gerenciar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedClient && (
        <ReturnsManagerModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onUpdated={fetchClients}
        />
      )}
    </div>
  );
}