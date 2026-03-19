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