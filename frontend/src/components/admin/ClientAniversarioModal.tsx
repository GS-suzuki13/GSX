import React from "react";
import { User } from "../../types";

interface ClientAniversarioModalProps {
  data: (User & { proximoRepasse: string })[];
  onClose: () => void;
}

export default function ClientAniversarioModal({ data, onClose }: ClientAniversarioModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#FFFFFF] rounded-2xl shadow-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-[#1A2433] mb-4">
          Clientes com Repasse Amanhã
        </h2>

        <ul className="space-y-2 mb-6">
          {data.map((c, i) => (
            <li key={i} className="border-b border-[#CBD5E0] pb-2">
              <div className="text-[#1A2433] font-medium">{c.name}</div>
              <div className="text-sm text-[#4A5568]">
                Próximo Repasse: {c.proximoRepasse}
              </div>
              <div className="text-sm text-[#4A5568]">
                Valor aportado: R$ {(c.valor_aportado || 0).toLocaleString("pt-BR")}
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={onClose}
          className="w-full bg-[#1A2433] text-[#FFFFFF] px-4 py-2 rounded-lg hover:bg-[#00A676]"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
