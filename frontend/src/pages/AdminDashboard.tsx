import React, { useEffect, useState, useCallback } from "react";
import { User } from "../types";
import { CSVHandler } from "../utils/csvHandler";
import ClientRegistrationForm from "../components/ClientRegistrationForm";
import ClientDetailsModal from "../components/ClientDetailsModal";
import Header from "../components/layout/Header";
import AdminOverviewCards from "../components/admin/AdminOverviewCards";
import ClientNextBusinessDay from "../components/admin/ClientNextBusinessDay";
import ClientTable from "../components/admin/ClientTable";
import AddReturnModal from "../components/AddReturnModal";
import { calculateNextRepasseBusinessDays } from "../utils/calculateNextRepasse";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [clients, setClients] = useState<User[]>([]);
  const [sortBy, setSortBy] = useState<"nome" | "percentual" | "data" | "data_modificacao">("nome");
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showNextBusinessDay, setShowNextBusinessDay] = useState(false);
  const [showAddReturnModal, setShowAddReturnModal] = useState(false);
  const [clientesProximoRepasse, setClientesProximoRepasse] = useState<
    (User & { proximoRepasse: string })[]
  >([]);

  const getNextBusinessDay = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    while ([0, 6].includes(date.getDay())) date.setDate(date.getDate() + 1);

    return date.toLocaleDateString("pt-BR");
  };

  const fetchClients = useCallback(async () => {
    const data = await CSVHandler.getUsers();
    setClients(data);

    const nextBusinessDate = getNextBusinessDay();

    const clientesComRepasse = data
      .filter((cliente) => cliente.data_cadastro && cliente.token !== "adm")
      .filter(
        (cliente) => calculateNextRepasseBusinessDays(cliente.data_cadastro) === nextBusinessDate
      )
      .map((cliente) => ({ ...cliente, proximoRepasse: nextBusinessDate }));

    if (clientesComRepasse.length > 0) {
      setClientesProximoRepasse(clientesComRepasse);
      setShowNextBusinessDay(true);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleClientUpdated = (updated: User, action: "edit" | "delete") => {
    setClients((prev) =>
      action === "delete"
        ? prev.filter((c) => c.user !== updated.user)
        : prev.map((c) => (c.user === updated.user ? updated : c))
    );
  };

  const sortedClients = [...clients].sort((a, b) => {
    const compare = (valA: any, valB: any) => (valA > valB ? 1 : valA < valB ? -1 : 0);

    switch (sortBy) {
      case "nome":
        return compare(a.name, b.name);
      case "percentual":
        return compare(a.percentual_contrato || 0, b.percentual_contrato || 0);
      case "data":
        return compare(new Date(a.data_cadastro).getTime(), new Date(b.data_cadastro).getTime());
      case "data_modificacao":
        return compare(
          new Date(a.data_modificacao).getTime(),
          new Date(b.data_modificacao).getTime()
        );
      default:
        return 0;
    }
  });

  const handleAddReturn = () => {
    setShowAddReturnModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-[Inter,sans-serif]">
      <Header title={`Dashboard Administrador - ${user.name}`} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#1A2433] mb-4 sm:mb-6">
          Visão Geral
        </h2>

        <div className="w-full overflow-x-auto">
          <AdminOverviewCards clients={clients} />
        </div>

        <div className="mt-6 w-full overflow-x-auto">
          <ClientTable
            clients={sortedClients}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onSelectClient={setSelectedClient}
            onRegisterClient={() => setShowClientForm(true)}
            onClientUpdated={handleClientUpdated}
            onAddReturn={handleAddReturn}
          />
        </div>
      </main>

      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onUpdated={fetchClients}
        />
      )}

      {showNextBusinessDay && clientesProximoRepasse.length > 0 && (
        <ClientNextBusinessDay
          data={clientesProximoRepasse}
          onClose={() => setShowNextBusinessDay(false)}
        />
      )}

      {showClientForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3">
          <div className="max-w-2xl w-full">
            <ClientRegistrationForm
              onClientRegistered={(newUser) => {
                setClients((prev) => [...prev, newUser]);
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

      {showAddReturnModal && (
        <AddReturnModal
          clients={clients}
          onClose={() => setShowAddReturnModal(false)}
          onReturnAdded={fetchClients}
        />
      )}
    </div>
  );
}
