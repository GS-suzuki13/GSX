import React from "react";
import { Users, TrendingUp } from "lucide-react";
import DashboardCard from "../DashboardCard";
import { User } from "../../types";

interface AdminOverviewCardsProps {
  clients: User[];
}

export default function AdminOverviewCards({ clients }: AdminOverviewCardsProps) {
  const dashboardCards = [
    {
      title: "Total de Clientes",
      value: clients.filter(client => client.token !== "adm").length.toString(),
      color: "blue" as const,
      icon: <Users className="w-8 h-8 text-blue-600" />
    },
    {
      title: "Ativos sob Gestão",
      value: `R$ ${clients
        .reduce((sum, c) => sum + Number(c.valor_aportado || 0), 0)
        .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      color: "green" as const,
      icon: <TrendingUp className="w-8 h-8 text-green-600" />
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {dashboardCards.map((card, i) => (
        <DashboardCard
          key={i}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
        />
      ))}
    </div>
  );
}
