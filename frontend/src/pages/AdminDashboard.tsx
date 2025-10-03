import React, { useEffect, useState } from "react";
import { User } from "../types";
import { CSVHandler } from "../utils/csvHandler";
import ClientRegistrationForm from "../components/ClientRegistrationForm";
import ClientDetailsModal from "../components/ClientDetailsModal";
import Header from "../components/layout/Header";
import AdminOverviewCards from "../components/admin/AdminOverviewCards";
import ClientTable from "../components/admin/ClientTable";
import ClientAniversarioModal from "../components/admin/ClientAniversarioModal";

interface AdminDashboardProps {
  user?: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [clients, setClients] = useState<User[]>([]);
  const [sortBy, setSortBy] = useState<"nome" | "percentual" | "data">("nome");
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientesProximoRepasse, setClientesProximoRepasse] = useState<(User & { proximoRepasse: string })[]>([]);
  const [showAniversarioModal, setShowAniversarioModal] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      const data = await CSVHandler.getUsers();
      setClients(data);

      const amanha = new Date();
      amanha.setDate(amanha.getDate() + 1); // Definindo a data de amanhã

      // Filtrando clientes e verificando se o próximo repasse é amanhã
      const clientesComRepasseAmanha = data
        .filter((cliente) => {
          if (!cliente.data_cadastro || cliente.token === "adm") return false;
          
          // Usando a função calculateNextRepasse para obter o próximo repasse
          const proximoRepasse = calculateNextRepasse(cliente.data_cadastro);

          // Verificando se o próximo repasse é amanhã
          return proximoRepasse === amanha.toLocaleDateString("pt-BR");
        })
        .map((cliente) => ({
          ...cliente,
          proximoRepasse: amanha.toLocaleDateString("pt-BR"),
        }));

      if (clientesComRepasseAmanha.length > 0) {
        setClientesProximoRepasse(clientesComRepasseAmanha);
        setShowAniversarioModal(true);
      }
    };

    fetchClients();
  }, []);

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

  const sortedClients = [...clients].sort((a, b) => {
    if (sortBy === "nome") return a.name.localeCompare(b.name);
    if (sortBy === "percentual")
      return (a.percentual_contrato || 0) - (b.percentual_contrato || 0);
    if (sortBy === "data")
      return (
        new Date(a.data_cadastro).getTime() -
        new Date(b.data_cadastro).getTime()
      );
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-100 font-[Inter,sans-serif]">
      <Header
        title="Dashboard Administrador"
        onLogout={onLogout}
      />
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-semibold text-[#1A2433] mb-6">
          Visão Geral
        </h2>

        <AdminOverviewCards clients={clients} />

        <ClientTable
          clients={sortedClients}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onSelectClient={setSelectedClient}
          onRegisterClient={() => setShowClientForm(true)}
        />
      </main>

      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}

      {showAniversarioModal && clientesProximoRepasse.length > 0 && (
        <ClientAniversarioModal
          data={clientesProximoRepasse}
          onClose={() => setShowAniversarioModal(false)}
        />
      )}

      {showClientForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-w-2xl w-full">
            <ClientRegistrationForm
              onClientRegistered={(user) => {
                setClients((prev) => [...prev, user]);
                setShowClientForm(false);
              }}
            />
            <button
              onClick={() => setShowClientForm(false)}
              className="mt-4 w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-red-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
