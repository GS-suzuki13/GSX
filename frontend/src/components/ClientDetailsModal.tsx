import React, { useState, useEffect } from 'react';
import { X, Plus, TrendingUp, Calendar, Paperclip } from 'lucide-react';
import { User, ClientReturn } from '../types';

interface ClientDetailsModalProps {
  client: User;
  onClose: () => void;
}

export default function ClientDetailsModal({ client, onClose }: ClientDetailsModalProps) {
  const [returns, setReturns] = useState<ClientReturn[]>([]);
  const [showAddReturn, setShowAddReturn] = useState(false);
  const [returnForm, setReturnForm] = useState({ percentual: '' });
  const [activeMonth, setActiveMonth] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);

  const addOneDay = (date: string): string => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + 1);
    return currentDate.toLocaleDateString('pt-BR');
  };

  const calculateNextRepasse = (dataCadastro: string): string => {
    const cadastroDate = new Date(dataCadastro);
    cadastroDate.setDate(cadastroDate.getDate() + 1);
    const today = new Date();

    cadastroDate.setFullYear(today.getFullYear(), today.getMonth(), cadastroDate.getDate());

    if (cadastroDate <= today) {
      cadastroDate.setMonth(cadastroDate.getMonth() + 1);
    }

    return cadastroDate.toLocaleDateString('pt-BR');
  };

  const loadClientReturns = async () => {
    try {
      const response = await fetch(`http://nonextortive-wealthily-charlotte.ngrok-free.dev/returns/${client.user}`);
      if (!response.ok) throw new Error('Erro ao carregar rendimentos');
      const data = await response.json();

      const parsed: ClientReturn[] = data.map((item: any) => ({
        data: item.data,
        percentual: parseFloat(item.percentual),
        variacao: parseFloat(item.variacao),
        rendimento: parseFloat(item.rendimento)
      }));

      setReturns(parsed);

      if (parsed.length > 0) {
        const lastDate = new Date(parsed[parsed.length - 1].data);
        const monthKey = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}`;
        setActiveMonth(monthKey);
      }
    } catch (error) {
      console.error('Erro ao carregar returns do cliente:', error);
    }
  };

  useEffect(() => {
    if (client) loadClientReturns();
  }, [client]);

  const handleAddReturn = async (e: React.FormEvent) => {
    e.preventDefault();

    const lastReturn = returns[returns.length - 1];

    const percentualTotal = parseFloat(returnForm.percentual);
    const percentual = (percentualTotal / 100) * (client.percentual_contrato / 100);
    const lastPercentual = lastReturn ? lastReturn.percentual : 0;
    const rendimento = client.valor_aportado * percentual;
    const fomatedPercentual = percentual * 100;
    const variacao = fomatedPercentual - lastPercentual;

    const newReturn: ClientReturn = {
      data: new Date().toISOString().split("T")[0],
      percentual: parseFloat(fomatedPercentual.toFixed(3)),
      variacao: parseFloat(variacao.toFixed(3)),
      rendimento: parseFloat(rendimento.toFixed(2)),
    };

    try {
      const response = await fetch(`http://nonextortive-wealthily-charlotte.ngrok-free.dev/returns/${client.user}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReturn),
      });

      if (!response.ok) throw new Error('Erro ao salvar rendimento');
      const result = await response.json();

      setReturns([...returns, result.return]);
      setReturnForm({ percentual: '' });
      setShowAddReturn(false);
    } catch (error) {
      console.error('Erro ao adicionar rendimento:', error);
    }
  };

  // Importar histórico CSV
  const handleImportHistory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append('file', file);

    setIsImporting(true);
    try {
      const response = await fetch(`http://nonextortive-wealthily-charlotte.ngrok-free.dev/returns/import/${client.user}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Erro ao importar histórico');

      await loadClientReturns();
    } catch (error) {
      console.error('Erro ao importar histórico:', error);
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const totalReturn = returns.reduce((sum, ret) => sum + ret.rendimento, 0);

  const groupedByMonth = returns.reduce((acc: Record<string, ClientReturn[]>, ret) => {
    const d = new Date(ret.data);
    d.setDate(d.getDate() + 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ret);
    return acc;
  }, {});

  const months = Object.keys(groupedByMonth);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#CBD5E0] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1A2433]">{client.name}</h2>
            <p className="text-[#4A5568]">{client.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-[#F4F5F7] rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#F4F5F7] rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-[#1A2433] mr-3" />
                <div>
                  <p className="text-sm text-[#1A2433] font-medium">Valor Aportado</p>
                  <p className="text-xl font-bold text-[#1A2433]">
                    R$ {Number(client.valor_aportado).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#F4F5F7] rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-[#00A676] mr-3" />
                <div>
                  <p className="text-sm text-[#00A676] font-medium">Rendimento Total</p>
                  <p className="text-xl font-bold text-[#00A676]">
                    R$ {totalReturn.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#F4F5F7] rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-[#1A2433] mr-3" />
                <div>
                  <p className="text-sm text-[#1A2433] font-medium">Próximo Repasse</p>
                  <p className="text-xl font-bold text-[#1A2433]">
                    {calculateNextRepasse(client.data_cadastro)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Histórico */}
          <div className="bg-white border border-[#CBD5E0] rounded-lg">
            <div className="px-4 py-3 border-b border-[#CBD5E0] flex items-center justify-between">
              <h3 className="font-medium text-[#1A2433]">Histórico de Rendimentos</h3>

              {/* Botões alinhados à direita */}
              <div className="flex items-center gap-2">
                <label className="flex items-center justify-center gap-1 w-auto min-w-[120px] px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md cursor-pointer text-sm font-medium text-[#1A2433] text-center">
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
                  className="w-auto min-w-[120px] px-3 py-2 bg-[#1A2433] text-white text-sm font-medium rounded-md hover:bg-[#00A676] transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </button>
              </div>
            </div>

            {showAddReturn && (
              <div className="p-4 border-b border-[#CBD5E0] bg-[#F4F5F7]">
                <form onSubmit={handleAddReturn} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="%"
                    value={returnForm.percentual}
                    onChange={(e) => setReturnForm({ percentual: e.target.value })}
                    className="px-3 py-2 border border-[#CBD5E0] rounded-md text-sm"
                    required
                  />
                  <button
                    type="submit"
                    className="w-auto min-w-[100px] px-3 py-2 bg-emerald-500 text-white text-sm rounded-md hover:bg-[#00A676] transition-colors"
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

            {/* Tabs de meses */}
            <div className="px-4 py-2 flex gap-2 border-b border-[#CBD5E0] overflow-x-auto">
              {months.map((monthKey) => {
                const [year, month] = monthKey.split('-');
                const label = new Date(Number(year), Number(month) - 1).toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                });

                return (
                  <button
                    key={monthKey}
                    onClick={() => setActiveMonth(monthKey)}
                    className={`px-4 py-1 rounded-md text-sm font-medium ${activeMonth === monthKey
                      ? 'bg-[#00A676] text-white'
                      : 'bg-[#F4F5F7] text-[#1A2433] hover:bg-[#D1E9E5]'
                      }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Tabela de rendimentos */}
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F4F5F7]">
                    <th className="text-left py-3 px-4 font-medium text-[#1A2433] text-sm">Data</th>
                    <th className="text-left py-3 px-4 font-medium text-[#1A2433] text-sm">Percentual</th>
                    <th className="text-left py-3 px-4 font-medium text-[#1A2433] text-sm">Variação</th>
                    <th className="text-left py-3 px-4 font-medium text-[#1A2433] text-sm">Rendimento</th>
                  </tr>
                </thead>
                <tbody>
                  {(groupedByMonth[activeMonth] || []).map((returnItem, index) => (
                    <tr key={index} className="border-b border-[#F4F5F7] hover:bg-[#F4F5F7]">
                      <td className="py-3 px-4 text-[#1A2433] text-sm">
                        {addOneDay(returnItem.data)}
                      </td>
                      <td className={`py-3 px-4 font-medium text-sm ${returnItem.percentual >= 0 ? "text-[#00A676]" : "text-[#D64545]"
                        }`}>
                        {returnItem.percentual.toFixed(3)}%
                      </td>
                      <td
                        className={`py-3 px-4 font-medium text-sm ${returnItem.variacao >= 0 ? "text-[#00A676]" : "text-[#D64545]"
                          }`}
                      >
                        {returnItem.variacao.toFixed(3)}%
                      </td>
                      <td className="py-3 px-4 text-[#00A676] font-medium text-sm">
                        R$ {returnItem.rendimento.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
