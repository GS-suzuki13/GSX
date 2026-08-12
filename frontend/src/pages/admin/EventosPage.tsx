import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { CalendarDays, Edit, Plus, Search, Trash2, X } from 'lucide-react';
import { CSVHandler } from '../../utils/csvHandler';
import type { Evento, EventoStatus } from '../../types';

const emptyEvento: Evento = {
  nome: '',
  data: '',
  status: 'pendente',
  recorrente: false,
  categoria: '',
  observacao: '',
};

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [form, setForm] = useState<Evento>(emptyEvento);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchEventos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await CSVHandler.getEventos();
      setEventos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar eventos.', error);
      alert('Erro ao carregar eventos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEventos();
  }, [fetchEventos]);

  const resetForm = () => {
    setForm(emptyEvento);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.nome.trim()) {
      alert('Informe o nome do evento.');
      return;
    }

    if (!form.data) {
      alert('Informe a data do evento.');
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await CSVHandler.updateEvento(editingId, form);
        alert('Evento atualizado com sucesso!');
      } else {
        await CSVHandler.addEvento(form);
        alert('Evento criado com sucesso!');
      }

      resetForm();
      await fetchEventos();
    } catch (error) {
      console.error('Erro ao salvar evento.', error);
      alert('Erro ao salvar evento.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (evento: Evento) => {
    setEditingId(evento.id || null);
    setForm({
      nome: evento.nome,
      data: evento.data,
      status: evento.status,
      recorrente: evento.recorrente,
      categoria: evento.categoria || '',
      observacao: evento.observacao || '',
    });
  };

  const handleCancelEvent = async (evento: Evento) => {
    if (!evento.id) return;

    const confirmCancel = window.confirm(`Cancelar o evento "${evento.nome}"?`);
    if (!confirmCancel) return;

    try {
      await CSVHandler.cancelEvento(evento.id);
      await fetchEventos();
    } catch (error) {
      console.error('Erro ao cancelar evento.', error);
      alert('Erro ao cancelar evento.');
    }
  };

  const handleDeleteEvent = async (evento: Evento) => {
    if (!evento.id) return;

    const c1 = window.confirm(`Você realmente quer EXCLUIR o evento "${evento.nome}"?`);
    if (!c1) return;

    const c2 = window.confirm('Essa ação remove o evento do banco. Confirma novamente?');
    if (!c2) return;

    const c3 = window.confirm('Última confirmação: deseja excluir definitivamente?');
    if (!c3) return;

    try {
      await CSVHandler.deleteEvento(evento.id);
      await fetchEventos();
    } catch (error) {
      console.error('Erro ao excluir evento.', error);
      alert('Erro ao excluir evento.');
    }
  };

  const handleQuickUpdate = async (evento: Evento, data: Partial<Evento>) => {
    if (!evento.id) return;

    try {
      await CSVHandler.updateEvento(evento.id, data);
      await fetchEventos();
    } catch (error) {
      console.error('Erro ao atualizar evento.', error);
      alert('Erro ao atualizar evento.');
    }
  };

  const filteredEventos = useMemo(() => {
    const value = search.trim().toLowerCase();

    return eventos.filter((evento) =>
      `${evento.nome} ${evento.categoria || ''} ${evento.status}`
        .toLowerCase()
        .includes(value)
    );
  }, [eventos, search]);

  const formatDate = (date: string) => {
    if (!date) return '—';

    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString('pt-BR');
  };

  const statusClass = (status: EventoStatus) => {
    if (status === 'concluido') return 'text-emerald-400';
    if (status === 'cancelado') return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Eventos</h2>
        <p className="text-gray-400 text-sm">
          Cadastre, edite, acompanhe status e recorrência dos eventos
        </p>
      </div>

      <div className="bg-[#111827] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Plus size={18} className="text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">
            {editingId ? 'Editar Evento' : 'Novo Evento'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nome</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full h-12 bg-[#0f172a] border border-white/10 text-white rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Reunião com cliente"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Data</label>
            <input
              type="date"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
              className="w-full h-12 bg-[#0f172a] border border-white/10 text-white rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as EventoStatus })}
              className="w-full h-12 bg-[#0f172a] border border-white/10 text-white rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Categoria</label>
            <input
              value={form.categoria || ''}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full h-12 bg-[#0f172a] border border-white/10 text-white rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: reunião, entrega, financeiro"
            />
          </div>

          <div className="flex items-center gap-3 pt-7">
            <input
              id="recorrente"
              type="checkbox"
              checked={form.recorrente}
              onChange={(e) => setForm({ ...form, recorrente: e.target.checked })}
              className="h-4 w-4"
            />
            <label htmlFor="recorrente" className="text-sm text-gray-300">
              Evento recorrente
            </label>
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <label className="block text-sm text-gray-400 mb-2">Observação</label>
            <textarea
              value={form.observacao || ''}
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
              className="w-full min-h-24 bg-[#0f172a] border border-white/10 text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Detalhes do evento..."
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-11 bg-indigo-600 hover:bg-indigo-700 transition px-5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
          >
            {submitting ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Evento'}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className="h-11 flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-[#162033] border border-white/10 transition px-5 rounded-lg text-white text-sm font-medium"
            >
              <X size={16} />
              Cancelar edição
            </button>
          )}
        </div>
      </div>

      <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
        <div className="relative w-full sm:max-w-sm">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar evento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0f172a] border border-white/10 text-white rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Carregando eventos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="bg-[#0f172a] text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Evento</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Recorrente</th>
                  <th className="px-6 py-4">Observação</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredEventos.map((evento) => (
                  <tr key={evento.id} className="border-t border-white/5 hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{evento.nome}</div>
                      <div className="text-xs text-gray-500">{evento.categoria || 'Sem categoria'}</div>
                    </td>

                    <td className="px-6 py-4">{formatDate(evento.data)}</td>

                    <td className="px-6 py-4">
                      <select
                        value={evento.status}
                        onChange={(e) =>
                          handleQuickUpdate(evento, { status: e.target.value as EventoStatus })
                        }
                        className={`bg-[#0f172a] border border-white/10 rounded-lg px-2 py-1 text-sm ${statusClass(evento.status)}`}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleQuickUpdate(evento, { recorrente: !evento.recorrente })}
                        className={`px-3 py-1 rounded-lg text-xs border ${
                          evento.recorrente
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            : 'text-gray-400 border-white/10 bg-[#0f172a]'
                        }`}
                      >
                        {evento.recorrente ? 'Sim' : 'Não'}
                      </button>
                    </td>

                    <td className="px-6 py-4 max-w-xs text-gray-400">
                      {evento.observacao || '—'}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(evento)}
                          className="inline-flex items-center gap-2 bg-[#0f172a] hover:bg-[#162033] border border-white/10 text-white px-3 py-2 rounded-lg transition"
                        >
                          <Edit size={16} />
                          Editar
                        </button>

                        {evento.status !== 'cancelado' && (
                          <button
                            onClick={() => handleCancelEvent(evento)}
                            className="inline-flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg transition"
                          >
                            <CalendarDays size={16} />
                            Cancelar
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteEvent(evento)}
                          className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredEventos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum evento encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}