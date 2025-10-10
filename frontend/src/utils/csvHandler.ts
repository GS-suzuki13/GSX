// src/utils/csvHandler.ts
import { User, ClientReturn } from '../types';

const apiUrl = import.meta.env.VITE_API_URL;

export class CSVHandler {
  // Buscar todos os usuários
  static async getUsers(): Promise<User[]> {
    const res = await fetch(`${apiUrl}/users`);
    if (!res.ok) throw new Error('Erro ao buscar usuários');
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
    if (!res.ok) return null;
    const u = await res.json();
    return {
      ...u,
      valor_aportado: parseFloat(u.valor_aportado),
      percentual_contrato: parseFloat(u.percentual_contrato),
    };
  }

  // Retornos de um cliente
  static async getClientReturns(clientUser: string): Promise<ClientReturn[]> {
    const response = await fetch(`${apiUrl}/returns/${clientUser}`);
    if (!response.ok) throw new Error('Erro ao buscar retornos do cliente');

    const data = await response.json();

    return data.map((row: any) => ({
      data: row.data,
      percentual: parseFloat(row.percentual),
      variacao: parseFloat(row.variacao),
      rendimento: parseFloat(row.rendimento),
    }));
  }

  // Adicionar rendimento a um cliente
  static async addClientReturn(clientUser: string, returnData: ClientReturn): Promise<void> {
    const res = await fetch(`${apiUrl}/returns/${clientUser}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(returnData),
    });
    if (!res.ok) throw new Error('Erro ao adicionar rendimento do cliente');
  }
}
