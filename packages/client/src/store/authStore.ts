import { create } from 'zustand';
import { authApi } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  login: async (email, password) => {
    const response = await authApi.login(email, password);
    const { accessToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    set({ user, accessToken });
  },
  register: async (email, name, password) => {
    const response = await authApi.register(email, name, password);
    const { accessToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    set({ user, accessToken });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, accessToken: null });
  },
  loadUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      set({ accessToken: token });
      const response = await authApi.me();
      set({ user: response.data, isLoading: false });
    } catch (error) {
      set({ user: null, accessToken: null, isLoading: false });
    }
  },
}));

export default useAuthStore;
