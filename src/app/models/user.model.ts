export type UserRole = 'admin' | 'agent' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  agent: 'Agente',
  client: 'Cliente',
};

export const USER_ROLES: UserRole[] = ['admin', 'agent', 'client'];
