import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Plus,
  Paperclip,
  Pencil,
  Check,
  Trash2,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import type { User, ClientReturn } from '../types';
import { calculateNextRepasseBusinessDays } from '../utils/calculateNextRepasse';

interface Repasse {
  id: number;
  label: string;
  start: string;
  end: string;
}

interface ReturnsManagerModalProps {
  client: User;
  onClose: () => void;
  onUpdated: () => void;
}

export default function ReturnsManagerModal({
  client,
  onClose,
  onUpdated
}: ReturnsManagerModalProps) {
  const [returns, setReturns] = useState<ClientReturn[]>([]);
  const [showAddReturn, setShowAddReturn] = useState(false);
  const [returnForm, setReturnForm] = useState({ percentual: '' });
  const [editingReturn, setEditingReturn] = useState<ClientReturn | null>(null);
  const [editForm, setEditForm] = useState({
    percentual: '',
    variacao: '',
    rendimento: '',
    data: ''
  });

  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const [repasses, setRepasses] = useState<Repasse[]>([]);
  const [selectedRepasseId, setSelectedRepasseId] = useState<number | null | 'all' | 'current'>('current');

  const apiUrl = import.meta.env.VITE_API_URL;

  const normalizeReturnsWithVariation = (items: ClientReturn[]) => {
    const ordered = [...items].sort(
      (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
    );

    return ordered.map((item, index, arr) => {
      const previous = arr[index - 1];
      const apiVariacao = Number(item.variacao);

      const shouldRecalculate =
        !Number.isFinite(apiVariacao) ||
        (apiVariacao === 0 &&
          index > 0 &&
          Number(item.percentual) !== Number(previous?.percentual));

      const calculatedVariacao = previous
        ? Number((Number(item.percentual) - Number(previous.percentual)).toFixed(3))
        : Number(Number(item.percentual || 0).toFixed(3));

      return {
        ...item,
        percentual: Number(item.percentual || 0),
        rendimento: Number(item.rendimento || 0),
        variacao: shouldRecalculate
          ? calculatedVariacao
          : Number(apiVariacao.toFixed(3))
      };
    });
  };

  const formatDateOnly = (dateStr: string) => {
    if (!dateStr) return '—';

    const raw = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [year, month, day] = raw.split('-');

    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }

    return dateStr;
  };

  const loadClientReturns = async () => {
    try {
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
        id: item.id,
        data: item.data,
        percentual: Number(item.percentual) || 0,
        variacao:
          item.variacao === null || item.variacao === undefined || item.variacao === ''
            ? NaN
            : Number(item.variacao),
        rendimento: Number(item.rendimento) || 0,
        userId: item.userId,
        repasseId: item.repasseId ?? null
      }));

      setReturns(normalizeReturnsWithVariation(parsed));
    } catch (err) {
      console.error(err);
      setReturns([]);
    }
  };

  const loadRepasses = async () => {
    try {
      const response = await fetch(`${apiUrl}/repasse/${client.id}`);

      if (response.status === 404) {
        setRepasses([]);
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao carregar repasses');
      }

      const data = await response.json();
      const repassesArray = Array.isArray(data.repasses) ? data.repasses : data;

      setRepasses(Array.isArray(repassesArray) ? repassesArray : []);
      setSelectedRepasseId('current');
    } catch (err) {
      console.error(err);
      setRepasses([]);
    }
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([loadClientReturns(), loadRepasses()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client) {
      void loadAll();
    }
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

  const handleAddReturn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving) return;

    const percentualTotal = parseFloat(returnForm.percentual);

    if (Number.isNaN(percentualTotal) || percentualTotal <= 0) {
      alert('Informe um percentual válido.');
      return;
    }

    setIsSaving(true);

    const percentual = (percentualTotal / 100) * (client.percentual_contrato / 100);
    const rendimento = client.valor_aportado * percentual;
    const formattedPercentual = percentual * 100;

    const orderedReturns = [...returns].sort(
      (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
    );

    const lastReturn = orderedReturns[orderedReturns.length - 1];
    const variacao = lastReturn
      ? formattedPercentual - Number(lastReturn.percentual || 0)
      : formattedPercentual;

    const newReturn: ClientReturn = {
      data: new Date().toISOString().split('T')[0],
      percentual: Number(formattedPercentual.toFixed(3)),
      variacao: Number(variacao.toFixed(3)),
      rendimento: Number(rendimento.toFixed(2))
    };

    try {
      const response = await fetch(`${apiUrl}/returns/${client.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReturn)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar rendimento');
      }

      await loadClientReturns();
      setReturnForm({ percentual: '' });
      setShowAddReturn(false);
      onUpdated();
    } catch (err) {
      console.error(err);
      alert('Erro ao adicionar rendimento');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (r: ClientReturn) => {
    const normalizedDate = r.data.includes('/')
      ? r.data.split('/').reverse().join('-')
      : (r.data.includes('T') ? r.data.split('T')[0] : r.data);

    setEditingReturn({ ...r, data: normalizedDate });
    setEditForm({
      percentual: String(r.percentual),
      variacao: String(r.variacao),
      rendimento: String(r.rendimento),
      data: normalizedDate
    });
  };

  const handleEditSave = async () => {
    if (!editingReturn) return;

    const updatedData = {
      percentual: parseFloat(editForm.percentual),
      variacao: parseFloat(editForm.variacao),
      rendimento: parseFloat(editForm.rendimento),
      data: editForm.data
    };

    try {
      const response = await fetch(`${apiUrl}/returns/${client.id}/${editingReturn.data}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar rendimento');
      }

      await loadClientReturns();
      setEditingReturn(null);
      onUpdated();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar edição');
    }
  };

  const handleDeleteReturn = async (r: ClientReturn) => {
    const confirmDelete = window.confirm('Deseja excluir este rendimento?');

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${apiUrl}/returns/${client.id}/${r.data}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir rendimento');
      }

      await loadClientReturns();
      onUpdated();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir rendimento.');
    }
  };

  const handleImportHistory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    setIsImporting(true);

    try {
      const response = await fetch(`${apiUrl}/returns/import/${client.id}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro ao importar histórico');
      }

      await loadClientReturns();
      onUpdated();
    } catch (err) {
      console.error(err);
      alert('Erro ao importar histórico');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleCloseRepasse = async () => {
    const confirmClose = window.confirm('Deseja criar repasse?');

    if (!confirmClose) return;

    setIsCreate(true);

    try {
      const response = await fetch(`${apiUrl}/repasse/close/${client.id}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Erro ao fechar repasse');
      }

      const newRepasse = await response.json();

      setRepasses((prev) => [...prev, newRepasse]);
      setSelectedRepasseId(newRepasse.id);

      const updatedReturns = returns.map((r) => {
        const rDate = new Date(r.data);

        if (!r.repasseId && rDate <= new Date(newRepasse.end)) {
          return { ...r, repasseId: newRepasse.id };
        }

        return r;
      });

      setReturns(normalizeReturnsWithVariation(updatedReturns));
      onUpdated();

      const addToAportado = window.confirm(
        'Adicionar rendimento ao valor aportado?'
      );

      if (addToAportado) {
        const totalRendimento = updatedReturns
          .filter((r) => r.repasseId === newRepasse.id)
          .reduce((sum, r) => sum + (r.rendimento ?? 0), 0);

        const novoValorAportado =
          (client.valor_aportado ?? 0) + totalRendimento * 0.7;

        const updateUser = await fetch(`${apiUrl}/users/${client.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ valor_aportado: novoValorAportado })
        });

        if (!updateUser.ok) {
          throw new Error('Erro ao atualizar valor aportado');
        }

        client.valor_aportado = novoValorAportado;
        onUpdated();
      }

      await loadAll();
    } catch (err) {
      console.error(err);
      alert('Erro ao fechar repasse');
    } finally {
      setIsCreate(false);
    }
  };

  const totalReturn = filteredReturns.reduce((sum, r) => sum + r.rendimento, 0);

  const formatMoney = (value: number) =>
    Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

  const getColorClass = (value: number) =>
    value > 0
      ? 'text-emerald-400 font-medium'
      : value < 0
        ? 'text-red-400 font-medium'
        : 'text-gray-300';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 sm:p-6">
      <div className="bg-[#111827] border border-white/10 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[92vh] overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {client.name}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Gerenciamento completo de rendimentos
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(92vh-76px)] space-y-6">
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
              icon={<TrendingUp size={22} />}
              iconClassName="bg-green-600/20 text-green-400"
            />

            <InfoCard
              title="Próximo Repasse"
              value={calculateNextRepasseBusinessDays(client.data_cadastro, repasses)}
              icon={<Calendar size={22} />}
              iconClassName="bg-yellow-600/20 text-yellow-400"
            />
          </div>

          <div className="bg-[#0f172a] border border-white/5 rounded-2xl">
            <div className="px-4 sm:px-5 py-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white text-base">
                  Histórico de Rendimentos
                </h3>
                <p className="text-sm text-gray-400">
                  Visualize, edite, exclua e adicione rendimentos
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
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

                    if (v === 'all') {
                      setSelectedRepasseId('all');
                    } else if (v === 'current') {
                      setSelectedRepasseId('current');
                    } else {
                      setSelectedRepasseId(Number(v));
                    }
                  }}
                  className="px-3 py-2 bg-[#111827] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Todos rendimentos</option>
                  <option value="current">Atual</option>

                  {repasses.map((rep) => (
                    <option key={rep.id} value={String(rep.id)}>
                      {rep.label} ({formatDateOnly(rep.start)} - {formatDateOnly(rep.end)})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleCloseRepasse}
                  disabled={isCreate}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded-lg transition"
                >
                  {isCreate ? 'Criando...' : 'Criar Repasse'}
                </button>

                <label className="flex items-center gap-2 px-3 py-2 bg-[#111827] hover:bg-[#162033] text-white rounded-lg cursor-pointer text-sm border border-white/10 transition">
                  <Paperclip className="w-4 h-4" />
                  {isImporting ? 'Importando...' : 'Importar'}
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportHistory}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => setShowAddReturn(true)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg flex items-center transition"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </button>
              </div>
            </div>

            {showAddReturn && (
              <div className="p-4 border-b border-white/5 bg-[#111827]">
                <form onSubmit={handleAddReturn} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="% total"
                    value={returnForm.percentual}
                    onChange={(e) => setReturnForm({ percentual: e.target.value })}
                    className="px-3 py-2 bg-[#0f172a] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />

                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-3 py-2 text-white text-sm rounded-lg transition ${
                      isSaving
                        ? 'bg-emerald-400'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddReturn(false)}
                    className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-red-600 transition"
                  >
                    Cancelar
                  </button>
                </form>
              </div>
            )}

            {loading ? (
              <div className="p-10 text-center text-gray-400">
                Carregando rendimentos...
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[430px] overflow-y-auto">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="bg-[#111827] text-gray-400 uppercase text-xs sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Percentual</th>
                      <th className="px-4 py-3">Variação</th>
                      <th className="px-4 py-3">Rendimento</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReturns.map((r, index) => {
                      const isEditing =
                        editingReturn?.id !== undefined && r.id !== undefined
                          ? editingReturn.id === r.id
                          : editingReturn?.data === r.data;

                      return (
                        <tr
                          key={r.id ?? `${r.data}-${index}`}
                          className="border-t border-white/5 hover:bg-white/5 transition"
                        >
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input
                                type="date"
                                value={editForm.data}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, data: e.target.value })
                                }
                                className="w-full px-2 py-2 bg-[#0f172a] border border-white/10 rounded text-sm text-white"
                              />
                            ) : (
                              formatDateOnly(r.data)
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.0001"
                                value={editForm.percentual}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, percentual: e.target.value })
                                }
                                className="w-full px-2 py-2 bg-[#0f172a] border border-white/10 rounded text-sm text-white"
                              />
                            ) : (
                              <span className={getColorClass(r.percentual)}>
                                {Number(r.percentual || 0).toFixed(2)}%
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.0001"
                                value={editForm.variacao}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, variacao: e.target.value })
                                }
                                className="w-full px-2 py-2 bg-[#0f172a] border border-white/10 rounded text-sm text-white"
                              />
                            ) : (
                              <span className={getColorClass(r.variacao)}>
                                {Number(r.variacao || 0).toFixed(2)}%
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                value={editForm.rendimento}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, rendimento: e.target.value })
                                }
                                className="w-full px-2 py-2 bg-[#0f172a] border border-white/10 rounded text-sm text-white"
                              />
                            ) : (
                              <span className={getColorClass(r.rendimento)}>
                                {formatMoney(r.rendimento)}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={handleEditSave}
                                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => setEditingReturn(null)}
                                    className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditClick(r)}
                                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteReturn(r)}
                                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredReturns.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          Nenhum rendimento encontrado para este repasse.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
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
    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 shadow-lg">
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