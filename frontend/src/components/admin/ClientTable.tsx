import React, { useState } from 'react';
import { ClipboardList, Pencil, Trash2, Check, X } from 'lucide-react';
import { User } from '../../types';

const apiUrl = import.meta.env.VITE_API_URL;

interface ClientTableProps {
  clients: User[];
  onSelectClient: (client: User) => void;
  onClientUpdated: (updatedClient: User, action: 'edit' | 'delete') => void;
}

export default function ClientTable({
  clients,
  onSelectClient,
  onClientUpdated
}: ClientTableProps) {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const handleEditClick = (client: User) => {
    setEditingUser(client.id);
    setEditForm(client);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      const res = await fetch(`${apiUrl}/users/${editingUser}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (!res.ok) throw new Error();

      setEditingUser(null);
      onClientUpdated(editForm as User, 'edit');
    } catch {
      alert('Erro ao salvar alterações.');
    }
  };

  const handleDelete = async (client: User) => {
    if (!window.confirm(`Excluir cliente "${client.name}"?`)) return;

    try {
      const res = await fetch(`${apiUrl}/users/${client.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error();

      onClientUpdated(client, 'delete');
    } catch {
      alert('Erro ao excluir cliente.');
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '—';

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '—';

    return parsed.toLocaleDateString('pt-BR');
  };

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

  const formatMoney = (value?: number) =>
    `R$ ${Number(value || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] text-sm text-left text-gray-300">
        <thead className="bg-[#0f172a] text-gray-400 uppercase text-xs">
          <tr>
            <th className="px-6 py-4">Nome</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Cadastro</th>
            <th className="px-6 py-4">Última alteração</th>
            <th className="px-6 py-4">Aporte</th>
            <th className="px-6 py-4">Contrato</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>

        <tbody>
          {clients
            .filter((c) => c.token !== 'adm')
            .map((client) => {
              const isEditing = editingUser === client.id;

              return (
                <tr
                  key={client.id}
                  className="border-t border-white/5 hover:bg-white/5 transition"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {isEditing ? (
                      <input
                        className="w-full bg-[#0f172a] border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={editForm.name || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                    ) : (
                      client.name
                    )}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {isEditing ? (
                      <input
                        className="w-full bg-[#0f172a] border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={editForm.email || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                      />
                    ) : (
                      client.email
                    )}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {formatDate(client.data_cadastro)}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {formatDateTime(client.data_modificacao)}
                  </td>

                  <td className="px-6 py-4 text-white">
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-full bg-[#0f172a] border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={editForm.valor_aportado || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            valor_aportado: Number(e.target.value)
                          })
                        }
                      />
                    ) : (
                      formatMoney(client.valor_aportado)
                    )}
                  </td>

                  <td className="px-6 py-4 text-white">
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-full bg-[#0f172a] border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={editForm.percentual_contrato || ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            percentual_contrato: Number(e.target.value)
                          })
                        }
                      />
                    ) : client.percentual_contrato ? (
                      `${client.percentual_contrato}%`
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end items-center gap-3">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="text-emerald-400 hover:text-emerald-300 transition"
                            title="Salvar"
                          >
                            <Check size={18} />
                          </button>

                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-400 hover:text-white transition"
                            title="Cancelar"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onSelectClient(client)}
                            className="text-gray-400 hover:text-white transition"
                            title="Detalhes"
                          >
                            <ClipboardList size={18} />
                          </button>

                          <button
                            onClick={() => handleEditClick(client)}
                            className="text-gray-400 hover:text-indigo-400 transition"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(client)}
                            className="text-gray-400 hover:text-red-400 transition"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

          {clients.filter((c) => c.token !== 'adm').length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-500">
                Nenhum cliente encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}