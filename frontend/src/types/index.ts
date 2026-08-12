export interface User {
  id: string;
  user: string;
  password?: string;
  token: 'adm' | 'user';
  name: string;
  cpf: string;
  email: string;
  data_cadastro: string;
  data_modificacao: string;
  valor_aportado: number;
  percentual_contrato: number;
}

export interface ClientReturn {
  id?: number;
  data: string;
  percentual: number;
  variacao: number;
  rendimento: number;
  userId?: string;
  repasseId?: number | null;
}

export interface LoggedUser {
  id: string;
  username: string;
  name: string;
  token: 'adm' | 'user';
  role: 'admin' | 'user';
}

export type EventoStatus = 'pendente' | 'concluido' | 'cancelado';
export interface Evento {
  id?: number;
  nome: string;
  data: string;
  status: EventoStatus;
  recorrente: boolean;
  categoria?: string | null;
  observacao?: string | null;
  createdAt?: string;
  updatedAt?: string;
}