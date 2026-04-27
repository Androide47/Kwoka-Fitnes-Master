import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Trainer, User } from '@/types';
import { authApi } from '@/utils/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isTrainer: boolean;
  clients: Client[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User> & Partial<Omit<Client, keyof User>>) => void;
  updateClient: (clientId: string, clientData: Partial<Client>) => void;
  signUp: (userData: Partial<User>, isTrainer: boolean) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isTrainer: false,
      clients: [],

      login: async (email: string, password: string) => {
        try {
          const result = await authApi.login(email, password);
          if (result?.user.role === 'trainer') {
            set({
              user: result.user,
              isAuthenticated: true,
              isTrainer: true,
              clients: result.clients ?? [],
            });
            return true;
          }

          if (result?.user.role === 'client') {
            set({
              user: result.user,
              isAuthenticated: true,
              isTrainer: false,
              clients: [],
            });
            return true;
          }

          return false;
        } catch (e) {
          console.error('Login error', e);
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isTrainer: false,
          clients: [],
        });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      updateClient: (clientId, clientData) => {
        const clients = get().clients;
        const updatedClients = clients.map(client =>
          client.id === clientId ? { ...client, ...clientData } : client
        );
        set({ clients: updatedClients });
      },

      signUp: async (userData, isTrainer) => {
        try {
          const result = await authApi.signUp(userData, isTrainer);
          if (result.user.role === 'trainer') {
            set({
              user: result.user as Trainer,
              isAuthenticated: true,
              isTrainer: true,
              clients: [],
            });
          } else {
            set({
              user: result.user as Client,
              isAuthenticated: true,
              isTrainer: false,
              clients: [],
            });
          }

          return true;
        } catch (error) {
          console.error('Signup error:', error);
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);