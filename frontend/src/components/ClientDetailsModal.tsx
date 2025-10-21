  import React, { useState, useEffect } from 'react';
  import { X, Plus, TrendingUp, Calendar, Paperclip, Pencil, Check } from 'lucide-react';
  import { User, ClientReturn } from '../types';

  interface Repasse {
    id: number;
    label: string;
    start: string;
    end: string;
  }

  interface ClientDetailsModalProps {
    client: User;
    onClose: () => void;
  }

  export default function ClientDetailsModal({ client, onClose }: ClientDetailsModalProps) {
    const [returns, setReturns] = useState<ClientReturn[]>([]);
    const [showAddReturn, setShowAddReturn] = useState(false);
    const [returnForm, setReturnForm] = useState({ percentual: '' });
    const [editingReturn, setEditingReturn] = useState<ClientReturn | null>(null);
    const [editForm, setEditForm] = useState({ percentual: '', variacao: '', rendimento: '' });
    const [isImporting, setIsImporting] = useState(false);

    const [repasses, setRepasses] = useState<Repasse[]>([]);
    const [selectedRepasseId, setSelectedRepasseId] = useState<number | null>(null);

    const apiUrl = import.meta.env.VITE_API_URL;

    // Helpers
    const addOneDay = (date: string): string => {
      const currentDate = new Date(date);
      currentDate.setDate(currentDate.getDate() + 1);
      return currentDate.toLocaleDateString('pt-BR');
    };

    const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
    const getNextBusinessDay = (date: Date) => {
      const d = new Date(date);
      while (isWeekend(d)) d.setDate(d.getDate() + 1);
      return d;
    };

    const calculateNextRepasse = (dataCadastro: string, repasses: Repasse[]) => {
      // Pega a data de referência: último repasse ou data de cadastro
      const lastRepasseEnd = repasses.length
        ? new Date(repasses[repasses.length - 1].end)
        : new Date(dataCadastro);

      const addBusinessDays = (startDate: Date, diasUteis: number) => {
        const result = new Date(startDate);
        let addedDays = 0;
        while (addedDays < diasUteis) {
          result.setDate(result.getDate() + 1);
          const day = result.getDay();
          if (day !== 0 && day !== 6) addedDays++; // Ignora sábados e domingos
        }
        return result;
      };

      const nextRepasseDate = addBusinessDays(lastRepasseEnd, 30);
      return nextRepasseDate.toLocaleDateString('pt-BR');
    };

    // Carregar rendimentos
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

    // Carregar repasses
    const loadRepasses = async () => {
      try {
        const response = await fetch(`${apiUrl}/repasse/${client.id}`);
        if (!response.ok) throw new Error('Erro ao carregar repasses');
        const data = await response.json();

        const repassesArray = Array.isArray(data.repasses) ? data.repasses : data;
        setRepasses(repassesArray);

        // seleciona o repasse mais recente por padrão
        if (repassesArray.length > 0) {
          const last = repassesArray[repassesArray.length - 1];
          setSelectedRepasseId(last.id);
        }
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

    // Filtra returns de acordo com repasse selecionado
    const filteredReturns = (selectedRepasseId
      ? returns.filter(r => r.repasseId === selectedRepasseId)
      : returns
    ).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());


    // Adicionar rendimento
    const handleAddReturn = async (e: React.FormEvent) => {
      e.preventDefault();

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
      } catch (err) {
        console.error(err);
      }
    };

    const handleCloseRepasse = async () => {
      try {
        const response = await fetch(`${apiUrl}/repasse/close/${client.id}`, { method: 'POST' });
        if (!response.ok) throw new Error('Erro ao fechar repasse');
        const newRepasse = await response.json();

        setRepasses(prev => [...prev, newRepasse]);
        setSelectedRepasseId(newRepasse.id);

        const now = new Date();
        const updatedReturns = returns.map(r => {
          const rDate = new Date(r.data);
          if (!r.repasseId && rDate <= new Date(newRepasse.end)) {
            return { ...r, repasseId: newRepasse.id };
          }
          return r;
        });
        setReturns(updatedReturns);
      } catch (err) {
        console.error(err);
      }
    };

    const isRepasseToday = (clientDataCadastro: string, repasses: Repasse[]): boolean => {
      const today = new Date();
      
      const lastRepasseEnd = repasses.length
        ? new Date(repasses[repasses.length - 1].end)
        : new Date(clientDataCadastro);

      const nextRepasse = new Date(lastRepasseEnd);
      let addedDays = 0;
      while (addedDays < 30) {
        nextRepasse.setDate(nextRepasse.getDate() + 1);
        const day = nextRepasse.getDay();
        if (day !== 0 && day !== 6) addedDays++;
      }

      return today.toDateString() === nextRepasse.toDateString();
    };


    // Editar rendimento
    const handleEditClick = (r: ClientReturn) => {
      setEditingReturn(r);
      setEditForm({
        percentual: r.percentual.toString(),
        variacao: r.variacao.toString(),
        rendimento: r.rendimento.toString(),
      });
    };

    const handleEditSave = async () => {
      if (!editingReturn) return;
      const updatedData = {
        percentual: parseFloat(editForm.percentual),
        variacao: parseFloat(editForm.variacao),
        rendimento: parseFloat(editForm.rendimento),
      };
      try {
        const response = await fetch(`${apiUrl}/returns/${client.id}/${editingReturn.data}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        });
        if (!response.ok) throw new Error('Erro ao atualizar rendimento');
        const result = await response.json();
        setReturns(prev => prev.map(r => r.data === editingReturn.data ? result.return : r));
        setEditingReturn(null);
      } catch (err) {
        console.error(err);
      }
    };

    // Excluir rendimento
    const handleDeleteReturn = async (r: ClientReturn) => {
      try {
        const response = await fetch(`${apiUrl}/returns/${client.id}/${r.data}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Erro ao excluir rendimento');
        setReturns(prev => prev.filter(ret => ret.data !== r.data));
      } catch (err) {
        console.error(err);
      }
    };

    const formatDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    };

    // Importar CSV
    const handleImportHistory = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.length) return;
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      setIsImporting(true);
      try {
        const response = await fetch(`${apiUrl}/returns/import/${client.id}`, { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Erro ao importar histórico');
        await loadClientReturns();
      } catch (err) {
        console.error(err);
      } finally {
        setIsImporting(false);
        e.target.value = '';
      }
    };

    const totalReturn = filteredReturns.reduce((sum, r) => sum + r.rendimento, 0);

    // JSX
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{client.name}</h2>
              <p className="text-gray-600">{client.email}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Cards aprimorados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Valor Aportado */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-blue-700">Valor Aportado</p>
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-700 mt-2">
                  R$ {client.valor_aportado.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              {/* Rendimento Total */}
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-green-700">Rendimento Total</p>
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-700 mt-2">
                  R$ {totalReturn.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              {/* Rendimento Líquido */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-emerald-700">Líquido</p>
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-emerald-700 mt-2">
                  R$ {(totalReturn * 0.7).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              {/* Próximo Repasse */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Próximo Repasse</p>
                  <Calendar className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {calculateNextRepasse(client.data_cadastro, repasses)}
                </p>
              </div>
            </div>

            {/* Histórico */}
            <div className="bg-white border rounded-lg">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="font-medium">Histórico de Rendimentos</h3>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedRepasseId ?? ''}
                    onChange={e => setSelectedRepasseId(Number(e.target.value))}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="">Todos os rendimentos</option>
                    {repasses.map(rep => (
                      <option key={rep.id} value={rep.id}>{rep.label} ({formatDate(rep.start)} - {formatDate(rep.end)})</option>
                    ))}
                  </select>

                  <button
                    onClick={handleCloseRepasse}
                    disabled={!isRepasseToday(client.data_cadastro, repasses)}
                    className={`w-auto min-w-[120px] px-3 py-2 text-white text-sm font-medium rounded-md transition-colors ${
                      isRepasseToday(client.data_cadastro, repasses)
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Criar Repasse
                  </button>


                  <label className="flex items-center justify-center gap-1 w-auto min-w-[120px] px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md cursor-pointer text-sm font-medium">
                    <Paperclip className="w-4 h-4" />
                    {isImporting ? 'Importando...' : 'Importar'}
                    <input type="file" accept=".csv" onChange={handleImportHistory} className="hidden" />
                  </label>

                  <button
                    onClick={() => setShowAddReturn(true)}
                    className="w-auto min-w-[120px] px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </button>
                </div>
              </div>

              {showAddReturn && (
                <div className="p-4 border-b bg-gray-50">
                  <form onSubmit={handleAddReturn} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="%"
                      value={returnForm.percentual}
                      onChange={(e) => setReturnForm({ percentual: e.target.value })}
                      className="px-3 py-2 border rounded-md text-sm"
                      required
                    />
                    <button
                      type="submit"
                      className="w-auto min-w-[100px] px-3 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddReturn(false)}
                      className="w-auto min-w-[100px] px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </form>
                </div>
              )}

              {/* Tabela de rendimentos */}
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-medium">Data</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Percentual</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Variação</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Rendimento</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReturns.map((returnItem, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{addOneDay(returnItem.data)}</td>
                        {editingReturn?.data === returnItem.data ? (
                          <>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                step="0.001"
                                value={editForm.percentual}
                                onChange={(e) => setEditForm({ ...editForm, percentual: e.target.value })}
                                className="px-2 py-1 border rounded-md w-24 text-sm"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                step="0.001"
                                value={editForm.variacao}
                                onChange={(e) => setEditForm({ ...editForm, variacao: e.target.value })}
                                className="px-2 py-1 border rounded-md w-24 text-sm"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                step="0.01"
                                value={editForm.rendimento}
                                onChange={(e) => setEditForm({ ...editForm, rendimento: e.target.value })}
                                className="px-2 py-1 border rounded-md w-32 text-sm"
                              />
                            </td>
                            <td className="py-3 px-4 flex gap-2">
                              <button onClick={handleEditSave} className="p-1 hover:bg-green-100 rounded-md transition-colors">
                                <Check className="w-4 h-4 text-green-600" />
                              </button>
                              <button onClick={() => setEditingReturn(null)} className="p-1 hover:bg-gray-100 rounded-md transition-colors">
                                <X className="w-4 h-4 text-gray-600" />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className={`py-3 px-4 font-medium text-sm ${returnItem.percentual >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {returnItem.percentual.toFixed(3)}%
                            </td>
                            <td className={`py-3 px-4 font-medium text-sm ${returnItem.variacao >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {returnItem.variacao.toFixed(3)}%
                            </td>
                            <td className="py-3 px-4 text-green-600 font-medium text-sm">
                              R$ {returnItem.rendimento.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="py-3 px-4 flex gap-2">
                              <button
                                onClick={() => handleEditClick(returnItem)}
                                className="p-1 hover:bg-blue-100 rounded-md transition-colors"
                              >
                                <Pencil className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteReturn(returnItem)}
                                className="p-1 hover:bg-red-100 rounded-md transition-colors"
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredReturns.length === 0 && (
                <p className="text-center py-6 text-gray-500 text-sm">
                  Nenhum rendimento encontrado para este repasse.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }