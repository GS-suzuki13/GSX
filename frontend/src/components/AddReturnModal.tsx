import React, { useState } from "react";
import { X } from "lucide-react";
import { User, ClientReturn } from "../types";

interface AddReturnModalProps {
  clients: User[];
  onClose: () => void;
  onReturnAdded: () => void | Promise<void>;
}

export default function AddReturnModal({ clients, onClose, onReturnAdded }: AddReturnModalProps) {
  const [percentualInput, setPercentualInput] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const inputPercentual = parseFloat(percentualInput);

      for (const client of clients) {
        const percentualReal = (inputPercentual / 100) * (client.percentual_contrato / 100);
        const rendimento = client.valor_aportado * percentualReal;
        const percentualFormatado = percentualReal * 100;

        const newReturn: ClientReturn = {
          data: new Date().toISOString().split("T")[0],
          percentual: parseFloat(percentualFormatado.toFixed(3)),
          variacao: 0,
          rendimento: parseFloat(rendimento.toFixed(2)),
        };

        await fetch(`${apiUrl}/returns/${client.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newReturn),
        });
      }

      await onReturnAdded();
      onClose();

    } catch (err) {
      console.error(err);
      alert("Erro ao aplicar rendimento a todos os clientes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Adicionar Rendimento para Todos os Clientes</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm">Percentual Geral (%)</label>
            <input
              type="number"
              step="0.01"
              value={percentualInput}
              onChange={(e) => setPercentualInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-md mt-1"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white ${
              loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Aplicando..." : "Aplicar para Todos"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
