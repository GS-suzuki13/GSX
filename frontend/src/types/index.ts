export interface User {
  user: string;
  password: string;
  token: 'adm' | 'user';
  name: string;
  cpf: string;
  email: string;
  data_cadastro: string;
  valor_aportado: number;
  percentual_contrato: number;
}

export interface ClientReturn {
  data: string;
  percentual: number;
  variacao: number;
  rendimento: number;
}

export interface DashboardCard {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ComponentType<any>;
}