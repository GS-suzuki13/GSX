import React, { useState, useEffect } from 'react';
import { X, Plus, TrendingUp, Calendar, Paperclip, Pencil, Check, DollarSign } from 'lucide-react';
import { User, ClientReturn } from '../types';
import { calculateNextRepasseBusinessDays } from "../utils/calculateNextRepasse";

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

export default function ClientDetailsModal({ client, onClose, onUpdated }: ClientDetailsModalProps) {
  const [returns, setReturns] = useState<ClientReturn[]>([]);
  const [showAddReturn, setShowAddReturn] = useState(false);
  const [returnForm, setReturnForm] = useState({ percentual: '' });
  const [editingReturn, setEditingReturn] = useState<ClientReturn | null>(null);
  const [editForm, setEditForm] = useState({ percentual: '', variacao: '', rendimento: '', data: '' });
  const [isCreate, setIsCreate] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [repasses, setRepasses] = useState<Repasse[]>([]);
  const [selectedRepasseId, setSelectedRepasseId] = useState<number | null | 'all' | 'current'>('current');

  const apiUrl = import.meta.env.VITE_API_URL;

  const addOneDay = (date: string): string => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + 1);
    return currentDate.toLocaleDateString('pt-BR');
  };


  const loadClientReturns = async () => {
    try {
      const response = await fetch(`${apiUrl}/returns/${client.id}`);
      if (!response.ok) throw new Error('Erro ao carregar rendimentos');
      const data = await response.json();
      const parsed: ClientReturn[] = data.map((item: any) => ({
        data: item.data,
        percentual: parseFloat(item.percentual),
        variacao: parseFloat(item.variacao),
        rendimento: parseFloat(item.rendimento),
        repasseId: item.repasseId,
      }));
      setReturns(parsed);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRepasses = async () => {
    try {
      const response = await fetch(`${apiUrl}/repasse/${client.id}`);
      if (!response.ok) throw new Error('Erro ao carregar repasses');
      const data = await response.json();

      const repassesArray = Array.isArray(data.repasses) ? data.repasses : data;
      setRepasses(repassesArray);
      setSelectedRepasseId(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (client) {
      loadClientReturns();
      loadRepasses();
    }
  }, [client]);

  const filteredReturns = returns
    .filter(r => {
      if (selectedRepasseId === 'all') return true;
      if (selectedRepasseId === 'current') return !r.repasseId;
      if (selectedRepasseId === null) return !r.repasseId;
      return r.repasseId === selectedRepasseId;
    })
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const handleAddReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    const percentualTotal = parseFloat(returnForm.percentual);
    const percentual = (percentualTotal / 100) * (client.percentual_contrato / 100);
    const rendimento = client.valor_aportado * percentual;
    const fomatedPercentual = percentual * 100;
    const lastReturn = returns[returns.length - 1];
    const variacao = lastReturn ? fomatedPercentual - lastReturn.percentual : fomatedPercentual;

    const newReturn: ClientReturn = {
      data: new Date().toISOString().split('T')[0],
      percentual: parseFloat(fomatedPercentual.toFixed(3)),
      variacao: parseFloat(variacao.toFixed(3)),
      rendimento: parseFloat(rendimento.toFixed(2)),
    };

    try {
      const response = await fetch(`${apiUrl}/returns/${client.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReturn),
      });
      if (!response.ok) throw new Error('Erro ao salvar rendimento');

      const result = await response.json();
      setReturns([...returns, result.return]);
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
    const normalizedDate = r.data.includes("/")
      ? r.data.split("/").reverse().join("-")
      : r.data;

    setEditingReturn({ ...r, data: normalizedDate });
    setEditForm({
      percentual: r.percentual.toString(),
      variacao: r.variacao.toString(),
      rendimento: r.rendimento.toString(),
      data: r.data
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
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Erro ao atualizar rendimento');
      const result = await response.json();

    setReturns(prev => prev.map(r =>
      r.data === editingReturn.data ? { ...result.return, data: editForm.data } : r
    ));

      setEditingReturn(null);
      onUpdated();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar edição');
    }
  };

  const handleDeleteReturn = async (r: ClientReturn) => {
    const confirmDelete = window.confirm("Deseja excluir este rendimento?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${apiUrl}/returns/${client.id}/${r.data}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir rendimento');

      setReturns(prev => prev.filter(ret => ret.data !== r.data));
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
        body: formData,
      });

      if (!response.ok) throw new Error('Erro ao importar histórico');

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
    const confirmClose = window.confirm("Deseja criar repasse?");
    if (!confirmClose) return;

    setIsCreate(true);

    try {
      const response = await fetch(`${apiUrl}/repasse/close/${client.id}`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Erro ao fechar repasse");

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

      setReturns(updatedReturns);
      onUpdated();

      const addToAportado = window.confirm(
        "Adicionar rendimento ao valor aportado?"
      );

      if (addToAportado) {
        const totalRendimento = updatedReturns
          .filter((r) => r.repasseId === newRepasse.id)
          .reduce((sum, r) => sum + (r.rendimento ?? 0), 0);

        const novoValorAportado =
          (client.valor_aportado ?? 0) + (totalRendimento * 0.7);

        const updateUser = await fetch(`${apiUrl}/users/${client.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ valor_aportado: novoValorAportado }),
        });

        if (!updateUser.ok)
          throw new Error("Erro ao atualizar valor aportado");

        client.valor_aportado = novoValorAportado;
        onUpdated();
        
      }

    } catch (err) {
      console.error(err);
      alert("Erro ao fechar repasse");
    } finally {
      setIsCreate(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const totalReturn = filteredReturns.reduce((sum, r) => sum + r.rendimento, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">

        <div className="px-4 sm:px-6 py-3 border-b flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base sm:text-xl font-bold">{client.name}</h2>
            <p className="text-gray-600 text-xs sm:text-sm">{client.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-semibold text-blue-700">Valor Aportado</p>
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-blue-700 mt-2">
                R$ {client.valor_aportado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-semibold text-green-700">Rendimento Total</p>
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-green-700 mt-2">
                R$ {totalReturn.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-semibold text-emerald-700">Rendimento Líquido</p>
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-emerald-700 mt-2">
                R$ {(totalReturn * 0.7).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">Próximo Repasse</p>
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-2">
                {calculateNextRepasseBusinessDays(client.data_cadastro, repasses)}
              </p>
            </div>

          </div>

          <div className="bg-white border rounded-lg">

            <div className="px-3 sm:px-4 py-3 border-b flex flex-wrap items-center gap-2 sm:gap-4 justify-between">

              <h3 className="font-medium text-sm sm:text-base">Histórico de Rendimentos</h3>

              <div className="flex flex-wrap gap-2">

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
                  className="px-2 py-2 border rounded-md text-xs sm:text-sm"
                >
                  <option value="all">Todos rendimentos</option>
                  <option value="current">Atual</option>
                  {repasses.map(rep => (
                    <option key={rep.id} value={String(rep.id)}>
                      {rep.label} ({formatDate(rep.start)} - {formatDate(rep.end)})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleCloseRepasse}
                  disabled={isCreate}
                  className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs sm:text-sm rounded-lg shadow-sm transition-all duration-200"
                >
                  {isCreate ? "Criando..." : "Criar Repasse"}
                </button>

                <label className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer text-xs sm:text-sm border border-gray-300 transition-all duration-200 shadow-sm">
                  <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
                  {isImporting ? "Importando..." : "Importar"}
                  <input type="file" accept=".csv" onChange={handleImportHistory} className="hidden" />
                </label>

                <button
                  onClick={() => setShowAddReturn(true)}
                  className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm rounded-lg flex items-center shadow-sm transition-all duration-200"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Adicionar
                </button>
              </div>
            </div>

            {showAddReturn && (
              <div className="p-3 sm:p-4 border-b bg-gray-50">
                <form onSubmit={handleAddReturn} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">

                  <input
                    type="number"
                    step="0.01"
                    placeholder="%"
                    value={returnForm.percentual}
                    onChange={(e) => setReturnForm({ percentual: e.target.value })}
                    className="px-3 py-2 border rounded-md text-xs sm:text-sm"
                    required
                  />

                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-3 py-2 text-white text-xs sm:text-sm rounded-md 
                      ${isSaving ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddReturn(false)}
                    className="px-3 py-2 bg-gray-600 text-white text-xs sm:text-sm rounded-md hover:bg-red-600"
                  >
                    Cancelar
                  </button>

                </form>
              </div>
            )}

            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-2 px-3">Data</th>
                    <th className="text-left py-2 px-3">Percentual</th>
                    <th className="text-left py-2 px-3">Variação</th>
                    <th className="text-left py-2 px-3">Rendimento</th>
                    <th className="text-right py-2 px-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturns.map((r, index) => {
                    const isEditing = editingReturn?.data === r.data;

                    const getColorClass = (value: number) =>
                      value > 0 ? "text-green-600 font-medium" :
                        value < 0 ? "text-red-600 font-medium" : "text-gray-700";

                    return (
                      <tr key={index} className="border-b hover:bg-gray-50 transition">

                        <td className="py-2 px-3">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editForm.data}
                              onChange={(e) => setEditForm({ ...editForm, data: e.target.value })}
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          ) : (
                            addOneDay(r.data)
                          )}
                        </td>

                        <td className="py-2 px-3">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.0001"
                              value={editForm.percentual}
                              onChange={(e) => setEditForm({ ...editForm, percentual: e.target.value })}
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          ) : (
                            <span className={getColorClass(r.percentual)}>
                              {r.percentual.toFixed(2)}%
                            </span>
                          )}
                        </td>

                        <td className="py-2 px-3">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.0001"
                              value={editForm.variacao}
                              onChange={(e) => setEditForm({ ...editForm, variacao: e.target.value })}
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          ) : (
                            <span className={getColorClass(r.variacao)}>
                              {r.variacao.toFixed(2)}%
                            </span>
                          )}
                        </td>

                        <td className="py-2 px-3">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.rendimento}
                              onChange={(e) => setEditForm({ ...editForm, rendimento: e.target.value })}
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          ) : (
                            <span className={getColorClass(r.rendimento)}>
                              R$ {r.rendimento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </td>

                        <td className="py-2 px-3 flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={handleEditSave}
                                className="p-1 bg-green-500 hover:bg-green-600 text-white rounded"
                              >
                                <Check className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setEditingReturn(null)}
                                className="p-1 bg-gray-500 hover:bg-gray-600 text-white rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditClick(r)}
                                className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteReturn(r)}
                                className="p-1 bg-red-500 hover:bg-red-600 text-white rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredReturns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-500 text-sm">
                        Nenhum rendimento encontrado para este repasse.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredReturns.length === 0 && (<p className="text-center py-6 text-gray-500 text-sm"> Nenhum rendimento encontrado para este repasse. </p>)}
          </div>
        </div>
      </div>
    </div>);
}
