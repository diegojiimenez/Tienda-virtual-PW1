import { defineStore } from 'pinia';
import authService from '@/services/auth.service';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: authService.getCurrentUser(),
    token: authService.getToken(),
    isAuthenticated: authService.isAuthenticated(),
    loading: false,
    error: null
  }),

  getters: {
    isAdmin: (state) => state.user?.rol === 'administrador',
    userName: (state) => state.user?.nombre || '',
    userEmail: (state) => state.user?.email || ''
  },

  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;

      try {
        const data = await authService.login(email, password);
        this.user = data.user;
        this.token = data.token;
        this.isAuthenticated = true;
        return data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al iniciar sesión';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;

      try {
        const data = await authService.register(userData);
        this.user = data.user;
        this.token = data.token;
        this.isAuthenticated = true;
        return data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al registrar usuario';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      authService.logout();
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
    },

    initializeAuth() {
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      
      if (token && user) {
        this.token = token;
        this.user = user;
      }
    }
  }
});