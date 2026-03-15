import React, { useEffect, useMemo, useState } from 'react';
import { X, TrendingUp, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { User, ClientReturn } from '../types';
import { calculateNextRepasseBusinessDays } from '../utils/calculateNextRepasse';

interface Repasse {
  id: number;
  label: string;
  start: string;
  end: string;
}

interface ClientDetailsModalProps {
  client: User;
  onClose: () => void;
  onUpdated: () => void;
}

export default function ClientDetailsModal({
  client,
  onClose
}: ClientDetailsModalProps) {
  const [returns, setReturns] = useState<ClientReturn[]>([]);
  const [repasses, setRepasses] = useState<Repasse[]>([]);
  const [selectedRepasseId, setSelectedRepasseId] = useState<number | null | 'all' | 'current'>('current');
  const [loadingReturns, setLoadingReturns] = useState(true);
  const [loadingRepasses, setLoadingRepasses] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  const formatMoney = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';

    const parsed = new Date(dateStr);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('pt-BR');
    }

    const [year, month, day] = dateStr.split('-');
    if (year && month && day) return `${day}/${month}/${year}`;

    return dateStr;
  };

  const loadClientReturns = async () => {
    try {
      setLoadingReturns(true);

      const response = await fetch(`${apiUrl}/returns/${client.id}`);

      if (response.status === 404) {
        setReturns([]);
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao carregar rendimentos');
      }

      const data = await response.json();

      const parsed: ClientReturn[] = (Array.isArray(data) ? data : []).map((item: any) => ({
        data: item.data,
        percentual: Number(item.percentual) || 0,
        variacao:
          item.variacao === null || item.variacao === undefined || item.variacao === ''
            ? NaN
            : Number(item.variacao),
        rendimento: Number(item.rendimento) || 0,
        repasseId: item.repasseId ?? null
      }));

      const ordered = [...parsed].sort(
        (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
      );

      const normalized = ordered.map((item, index, arr) => {
        const previous = arr[index - 1];
        const apiVariacao = Number(item.variacao);

        const shouldRecalculate =
          !Number.isFinite(apiVariacao) ||
          (apiVariacao === 0 && index > 0 && item.percentual !== previous?.percentual);

        const calculatedVariacao = previous
          ? Number((item.percentual - previous.percentual).toFixed(2))
          : Number(item.percentual.toFixed(2));

        return {
          ...item,
          variacao: shouldRecalculate ? calculatedVariacao : Number(apiVariacao.toFixed(2))
        };
      });

      setReturns(normalized);
    } catch (err) {
      console.error(err);
      setReturns([]);
    } finally {
      setLoadingReturns(false);
    }
  };

  const loadRepasses = async () => {
    try {
      setLoadingRepasses(true);

      const response = await fetch(`${apiUrl}/repasse/${client.id}`);

      if (response.status === 404) {
        setRepasses([]);
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao carregar repasses');
      }

      const data = await response.json();
      const repassesArray = Array.isArray(data?.repasses) ? data.repasses : Array.isArray(data) ? data : [];

      setRepasses(repassesArray);
      setSelectedRepasseId('current');
    } catch (err) {
      console.error(err);
      setRepasses([]);
    } finally {
      setLoadingRepasses(false);
    }
  };

  useEffect(() => {
    if (!client) return;

    loadClientReturns();
    loadRepasses();
  }, [client]);

  const filteredReturns = useMemo(() => {
    return [...returns]
      .filter((r) => {
        if (selectedRepasseId === 'all') return true;
        if (selectedRepasseId === 'current' || selectedRepasseId === null) return !r.repasseId;
        return r.repasseId === selectedRepasseId;
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [returns, selectedRepasseId]);

  const totalReturn = useMemo(() => {
    return filteredReturns.reduce((sum, r) => sum + (r.rendimento || 0), 0);
  }, [filteredReturns]);

  const mediaPercentual = useMemo(() => {
    if (!filteredReturns.length) return 0;
    return (
      filteredReturns.reduce((sum, r) => sum + (r.percentual || 0), 0) /
      filteredReturns.length
    );
  }, [filteredReturns]);

  const getValueColorClass = (value: number) => {
    if (value > 0) return 'text-emerald-400 font-medium';
    if (value < 0) return 'text-red-400 font-medium';
    return 'text-gray-300';
  };

  const isLoading = loadingReturns || loadingRepasses;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {client.name}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {client.email}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Usuário: {client.user}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-76px)] overflow-y-auto p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <InfoCard
              title="Valor Aportado"
              value={formatMoney(client.valor_aportado || 0)}
              icon={<DollarSign size={22} />}
              iconClassName="bg-indigo-600/20 text-indigo-400"
            />

            <InfoCard
              title="Rendimento Total"
              value={formatMoney(totalReturn)}
              icon={<TrendingUp size={22} />}
              iconClassName="bg-emerald-600/20 text-emerald-400"
            />

            <InfoCard
              title="Rendimento Líquido"
              value={formatMoney(totalReturn * 0.7)}
              icon={<BarChart3 size={22} />}
              iconClassName="bg-green-600/20 text-green-400"
            />

            <InfoCard
              title="Próximo Repasse"
              value={calculateNextRepasseBusinessDays(client.data_cadastro, repasses)}
              icon={<Calendar size={22} />}
              iconClassName="bg-yellow-600/20 text-yellow-400"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-[#0f172a] border border-white/5 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Histórico de Rendimentos
                  </h3>
                  <p className="text-sm text-gray-400">
                    Visualização por repasse
                  </p>
                </div>

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
                  className="bg-[#111827] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Todos os rendimentos</option>
                  <option value="current">Rendimento atual</option>
                  {repasses.map((rep) => (
                    <option key={rep.id} value={String(rep.id)}>
                      {rep.label} ({formatDate(rep.start)} - {formatDate(rep.end)})
                    </option>
                  ))}
                </select>
              </div>

              {isLoading ? (
                <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
                  Carregando histórico...
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[420px] overflow-y-auto rounded-xl border border-white/5">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="bg-[#111827] text-gray-400 uppercase text-xs sticky top-0">
                      <tr>
                        <th className="px-4 py-3">Data</th>
                        <th className="px-4 py-3">Percentual</th>
                        <th className="px-4 py-3">Variação</th>
                        <th className="px-4 py-3">Rendimento</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredReturns.map((r, index) => (
                        <tr
                          key={`${r.data}-${index}`}
                          className="border-t border-white/5 hover:bg-white/5 transition"
                        >
                          <td className="px-4 py-3 text-gray-300">
                            {formatDate(r.data)}
                          </td>

                          <td className="px-4 py-3">
                            <span className={getValueColorClass(r.percentual)}>
                              {r.percentual.toFixed(2)}%
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className={getValueColorClass(r.variacao)}>
                              {r.variacao.toFixed(2)}%
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className={getValueColorClass(r.rendimento)}>
                              {formatMoney(r.rendimento)}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {filteredReturns.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-gray-500">
                            Nenhum rendimento encontrado para este filtro.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">
                Resumo do Cliente
              </h3>

              <div className="space-y-4">
                <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-medium mt-1 break-all">
                    {client.email}
                  </p>
                </div>

                <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Cadastro</p>
                  <p className="text-white font-medium mt-1">
                    {formatDate(client.data_cadastro)}
                  </p>
                </div>

                <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Contrato</p>
                  <p className="text-white font-medium mt-1">
                    {client.percentual_contrato ? `${client.percentual_contrato}%` : '—'}
                  </p>
                </div>

                <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Média de percentual</p>
                  <p className="text-white font-medium mt-1">
                    {mediaPercentual.toFixed(2)}%
                  </p>
                </div>

                <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Quantidade de registros</p>
                  <p className="text-white font-medium mt-1">
                    {filteredReturns.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InfoCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconClassName: string;
}

function InfoCard({ title, value, icon, iconClassName }: InfoCardProps) {
  return (
    <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm">{title}</span>
        <div className={`p-2 rounded-lg ${iconClassName}`}>
          {icon}
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white break-words">
        {value}
      </h3>
    </div>
  );
}