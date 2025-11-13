import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    initialized: false 
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.rol === 'administrador',
    userName: (state) => state.user ? `${state.user.nombre} ${state.user.apellido}` : '',
    userEmail: (state) => state.user?.email || ''
  },

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/auth/login', { email, password })
        
        this.token = response.data.token
        this.user = response.data.user

        localStorage.setItem('token', this.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al iniciar sesión'
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/auth/register', userData)
        
        this.token = response.data.token
        this.user = response.data.user

        localStorage.setItem('token', this.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al registrarse'
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.user = null
      this.token = null
      this.error = null
      this.initialized = false

      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    },

    
    async initializeAuth() {
      if (this.initialized) return; // Ya inicializado
      
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          const decoded = jwtDecode(token)
          const currentTime = Date.now() / 1000

          if (decoded.exp < currentTime) {
            console.log('Token expirado, cerrando sesión...')
            this.logout()
          } else {
            this.token = token
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            await this.fetchUserProfile() 
          }
        } catch (error) {
          console.error('Error al decodificar token:', error)
          this.logout()
        }
      }
      
      this.initialized = true 
    },

    async fetchUserProfile() {
      try {
        const response = await api.get('/auth/me')
        this.user = response.data.user
        console.log('Usuario cargado:', this.user)
      } catch (error) {
        console.error('Error al obtener perfil:', error)
        this.logout()
      }
    }
  }
})
