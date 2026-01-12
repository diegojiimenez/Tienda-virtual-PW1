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

        // Cargar el carrito del usuario después de login exitoso
        const { useCartStore } = await import('./cart')
        const cartStore = useCartStore()
        cartStore.loadCartFromStorage()

        console.log(`✅ Usuario autenticado: ${this.user.nombre}`)

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

        // Cargar el carrito del usuario después de registro exitoso
        const { useCartStore } = await import('./cart')
        const cartStore = useCartStore()
        cartStore.loadCartFromStorage()

        console.log(`✅ Usuario registrado: ${this.user.nombre}`)

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al registrarse'
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      console.log(`👋 Cerrando sesión de: ${this.user?.nombre}`)

      // Limpiar solo el store del carrito (NO el localStorage)
      // El carrito persiste en localStorage para cuando el usuario vuelva
      const { useCartStore } = await import('./cart')
      const cartStore = useCartStore()
      cartStore.clearStoreOnly()

      // Limpiar autenticación
      this.user = null
      this.token = null
      this.error = null
      this.initialized = false

      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']

      console.log('✅ Sesión cerrada (carrito persistente en localStorage)')
    },

    
    async initializeAuth() {
      if (this.initialized) return; // Ya inicializado
      
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          const decoded = jwtDecode(token)
          const currentTime = Date.now() / 1000

          if (decoded.exp < currentTime) {
            console.log('⏰ Token expirado, cerrando sesión...')
            this.logout()
          } else {
            this.token = token
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            await this.fetchUserProfile()
            
            // Cargar el carrito del usuario
            const { useCartStore } = await import('./cart')
            const cartStore = useCartStore()
            cartStore.loadCartFromStorage()
          }
        } catch (error) {
          console.error('❌ Error al decodificar token:', error)
          this.logout()
        }
      }
      
      this.initialized = true
    },

    async fetchUserProfile() {
      try {
        const response = await api.get('/auth/me')
        this.user = response.data
        console.log(`✅ Perfil de usuario cargado: ${this.user.nombre}`)
      } catch (error) {
        console.error('❌ Error al cargar perfil:', error)
        this.logout()
        throw error
      }
    }
  }
})
