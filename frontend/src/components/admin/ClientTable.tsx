import React, { useState } from "react";
import { Filter, Plus, ClipboardList, Pencil, X, Check } from "lucide-react";
import { User } from "../../types";

const apiUrl = import.meta.env.VITE_API_URL;


interface ClientTableProps {
  clients: User[];
  sortBy: "nome" | "percentual" | "data" | "data_modificacao";
  onSortChange: (value: "nome" | "percentual" | "data" | "data_modificacao") => void;
  onSelectClient: (client: User) => void;
  onRegisterClient: () => void;
  onClientUpdated: (updatedClient: User, action: "edit" | "delete") => void;
}

export default function ClientTable({
  clients,
  sortBy,
  onSortChange,
  onSelectClient,
  onRegisterClient,
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Erro ao editar usuário");
      setEditingUser(null);
      setEditForm({});
      onClientUpdated(editForm as User, "edit");
    } catch (err) {
      console.error(err);
      alert("Falha ao salvar alterações.");
    }
  };

  const handleDelete = async (client: User) => {
    const confirmar = window.confirm(`Tem certeza que deseja excluir o cliente "${client.name}"?`);
    if (!confirmar) return;

    try {
      const res = await fetch(`${apiUrl}/users/${client.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir usuário");
      onClientUpdated(client, "delete");
    } catch (err) {
      console.error(err);
      alert("Falha ao excluir cliente.");
    }
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#CBD5E0] w-full overflow-hidden">
      <div className="px-6 py-4 border-b border-[#CBD5E0] flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#1A2433]">Clientes</h2>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-[#4A5568]" />
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(e.target.value as "nome" | "percentual" | "data" | "data_modificacao")
            }
            className="border border-[#CBD5E0] rounded-lg px-3 py-2 text-sm text-[#1A2433]"
          >
            <option value="nome">Nome (A-Z)</option>
            <option value="percentual">Percentual Contrato</option>
            <option value="data">Data de Cadastro</option>
            <option value="data_modificacao">Última Alteração</option>
          </select>
        </div>
        <button
          onClick={onRegisterClient}
          className="inline-flex items-center px-4 py-2 bg-[#1A2433] text-[#FFFFFF] text-sm font-medium rounded-lg hover:bg-[#00A676] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Cadastrar Cliente
        </button>
      </div>

      <div className="p-6 overflow-x-visible">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#CBD5E0] bg-[#F9FAFB]">
              {["Nome", "Email", "Data Cadastro", "Última Alteração", "Valor Aportado", "Percentual Contrato", "Ações"].map((col) => (
                <th
                  key={col}
                  className="text-left py-4 px-6 font-semibold text-[#1A2433] text-sm uppercase tracking-wide"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients
              .filter((c) => c.token !== "adm")
              .sort((a, b) => {
                if (sortBy === "nome") return a.name.localeCompare(b.name);
                if (sortBy === "percentual") return (b.percentual_contrato || 0) - (a.percentual_contrato || 0);
                if (sortBy === "data" || sortBy === "data_modificacao")
                  return new Date(b.data_modificacao).getTime() - new Date(a.data_modificacao).getTime();
                return 0;
              })
              .map((client) => {
                const isEditing = editingUser === client.id;
                const formatDate = (dateStr: string) => {
                  const d = new Date(dateStr);
                  if (isNaN(d.getTime())) return "—";
                  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                };

                return (
                  <tr key={client.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition">
                    {/* Nome */}
                    <td className="py-4 px-6 text-[#1A2433] whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      ) : (
                        client.name
                      )}
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6 text-[#4A5568] whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="email"
                          className="border rounded px-2 py-1 w-full"
                          value={editForm.email || ""}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      ) : (
                        client.email
                      )}
                    </td>

                    {/* Data Cadastro */}
                    <td className="py-4 px-6 text-[#4A5568] whitespace-nowrap">
                      {client.data_cadastro
                        ? new Date(client.data_cadastro + "T00:00:00").toLocaleDateString("pt-BR")
                        : "—"}
                    </td>

                    {/* Última Alteração */}
                    <td className="py-4 px-6 text-[#4A5568] whitespace-nowrap">
                      {client.data_modificacao ? formatDate(client.data_modificacao) : "—"}
                    </td>

                    {/* Valor Aportado */}
                    <td className="py-4 px-6 text-[#1A2433] whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          className="border rounded px-2 py-1 w-full"
                          value={editForm.valor_aportado?.toFixed(2) || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              valor_aportado: Number(e.target.value),
                            })
                          }
                        />
                      ) : (
                        `R$ ${(client.valor_aportado || 0).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      )}
                    </td>

                    {/* Percentual Contrato */}
                    <td className="py-4 px-6 text-[#1A2433] whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="number"
                          className="border rounded px-2 py-1 w-full"
                          value={editForm.percentual_contrato || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, percentual_contrato: Number(e.target.value) })
                          }
                        />
                      ) : (
                        client.percentual_contrato ? `${client.percentual_contrato}%` : "—"
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-6 flex items-center space-x-4 whitespace-nowrap">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="text-[#00A676] hover:text-[#00855C] transition-colors"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-500 hover:text-red-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onSelectClient(client)}
                            className="text-[#4A5568] hover:text-secondary transition-colors"
                          >
                            <ClipboardList className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditClick(client)}
                            className="text-[#4A5568] hover:text-[#00A676] transition-colors"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(client)}
                            className="text-[#4A5568] hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
