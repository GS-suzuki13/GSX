import React from "react";
import { Filter, Plus } from "lucide-react";
import { User } from "../../types";

interface ClientTableProps {
  clients: User[];
  sortBy: "nome" | "percentual" | "data";
  onSortChange: (value: "nome" | "percentual" | "data") => void;
  onSelectClient: (client: User) => void;
  onRegisterClient: () => void;
}

export default function ClientTable({
  clients,
  sortBy,
  onSortChange,
  onSelectClient,
  onRegisterClient
}: ClientTableProps) {
  return (
    <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#CBD5E0]">
      <div className="px-6 py-4 border-b border-[#CBD5E0] flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#1A2433]">Clientes</h2>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-[#4A5568]" />
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(e.target.value as "nome" | "percentual" | "data")
            }
            className="border border-[#CBD5E0] rounded-lg px-3 py-2 text-sm text-[#1A2433]"
          >
            <option value="nome">Nome (A-Z)</option>
            <option value="percentual">Percentual Contrato</option>
            <option value="data">Data de Cadastro</option>
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

      <div className="p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#CBD5E0]">
              {["Nome", "Email", "Data Cadastro", "Valor Aportado", "Percentual Contrato", "Ações"].map((col) => (
                <th
                  key={col}
                  className="text-left py-3 px-4 font-medium text-[#1A2433]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients
              .filter((c) => c.token !== "adm")
              .map((client, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#F4F5F7] hover:bg-[#F4F5F7]"
                >
                  <td className="py-3 px-4 text-[#1A2433]">{client.name}</td>
                  <td className="py-3 px-4 text-[#4A5568]">{client.email}</td>
                  <td className="py-3 px-4 text-[#4A5568]">
                    {client.data_cadastro
                      ? new Date(client.data_cadastro + "T00:00:00").toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="py-3 px-4 text-[#1A2433]">
                    R$ {(client.valor_aportado || 0).toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 px-4 text-[#1A2433]">
                    {client.percentual_contrato
                      ? `${client.percentual_contrato}%`
                      : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onSelectClient(client)}
                      className="text-emerald-500 hover:text-[#00A676] text-sm font-medium"
                    >
                      Informar Rendimentos
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
