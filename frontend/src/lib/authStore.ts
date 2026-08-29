import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'administrador' | 'supervisor_seguridad' | 'operador' | 'analista_datos' | 'solo_lectura';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'export' | 'ethics' | 'admin' | 'write';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  setRole: (role: Role) => void;
  updateUser: (fields: Partial<UserProfile>) => void;
  hasPermission: (permission: PermissionAction) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        id: 'demo-admin-1',
        full_name: 'Ing. Carlos Mendoza',
        email: 'admin@mina.com',
        role: 'administrador',
      },
      token: 'demo-jwt-token-xyz-123',
      isAuthenticated: true,

      login: (token: string, user: UserProfile) => {
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },

      setRole: (role: Role) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, role } });
        }
      },

      updateUser: (fields: Partial<UserProfile>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...fields } });
        }
      },

      hasPermission: (permission) => {
        const role = get().user?.role || 'solo_lectura';
        switch (permission) {
          case 'admin':
            return role === 'administrador';
          case 'delete':
            return role === 'administrador';
          case 'create':
          case 'update':
          case 'write':
            return role === 'administrador' || role === 'supervisor_seguridad';
          case 'export':
            return role === 'administrador' || role === 'supervisor_seguridad' || role === 'analista_datos';
          case 'ethics':
            return role === 'administrador' || role === 'operador' || role === 'supervisor_seguridad';
          case 'read':
          default:
            return true;
        }
      },
    }),
    {
      name: 'mining-twin-auth-storage',
    }
  )
);

