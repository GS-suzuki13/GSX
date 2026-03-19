import { User, ClientReturn } from '../types';

const apiUrl = import.meta.env.VITE_API_URL;

export class CSVHandler {
  // Buscar todos os usuários
  static async getUsers(): Promise<User[]> {
    const res = await fetch(`${apiUrl}/users`);

    if (!res.ok) {
      throw new Error('Erro ao buscar usuários');
    }

    const data = await res.json();

    return data.map((u: any) => ({
      ...u,
      valor_aportado: parseFloat(u.valor_aportado),
      percentual_contrato: parseFloat(u.percentual_contrato),
    }));
  }

  // Adicionar um novo usuário
  static async addUser(user: User): Promise<{ success: boolean }> {
    const res = await fetch(`${apiUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    if (!res.ok) {
      throw new Error('Erro ao adicionar usuário');
    }

    return await res.json();
  }

  // Autenticação de login
  static async authenticateUser(username: string, password: string): Promise<User | null> {
    const res = await fetch(`${apiUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: username, password }),
    });

    if (!res.ok) {
      return null;
    }

    const u = await res.json();

    return {
      ...u,
      valor_aportado: parseFloat(u.valor_aportado),
      percentual_contrato: parseFloat(u.percentual_contrato),
    };
  }

  // Retornos de um cliente
  static async getClientReturns(clientId: string): Promise<ClientReturn[]> {
    const response = await fetch(`${apiUrl}/returns/${clientId}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar retornos do cliente');
    }

    const data = await response.json();

    return (Array.isArray(data) ? data : []).map((row: any) => ({
      id: row.id,
      data: row.data,
      percentual: parseFloat(row.percentual),
      variacao: parseFloat(row.variacao),
      rendimento: parseFloat(row.rendimento),
      userId: row.userId,
      repasseId: row.repasseId ?? null,
    }));
  }

  // Adicionar rendimento a um cliente
  static async addClientReturn(clientId: string, returnData: ClientReturn): Promise<void> {
    const res = await fetch(`${apiUrl}/returns/${clientId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(returnData),
    });

    if (!res.ok) {
      throw new Error('Erro ao adicionar rendimento do cliente');
    }
  }
}