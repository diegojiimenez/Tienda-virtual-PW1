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

        console.log(`✅ Usuario autenticado: ${this.user.nombre}`)

        // ✅ CARGAR CARRITO DESPUÉS DEL LOGIN
        try {
          const { useCartStore } = await import('./cart')
          const cartStore = useCartStore()
          await cartStore.loadCartFromDB()
          console.log('✅ Carrito cargado después del login')
        } catch (cartError) {
          console.error('⚠️ Error al cargar carrito:', cartError)
        }

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

        console.log(`✅ Usuario registrado: ${this.user.nombre}`)

        // ✅ CARGAR CARRITO DESPUÉS DEL REGISTRO
        try {
          const { useCartStore } = await import('./cart')
          const cartStore = useCartStore()
          await cartStore.loadCartFromDB()
          console.log('✅ Carrito cargado después del registro')
        } catch (cartError) {
          console.error('⚠️ Error al cargar carrito:', cartError)
        }

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

      // Limpiar solo el store del carrito (la BD mantiene los datos)
      try {
        const { useCartStore } = await import('./cart')
        const cartStore = useCartStore()
        cartStore.clearStoreOnly()
      } catch (error) {
        console.error('⚠️ Error al limpiar carrito:', error)
      }

      // Limpiar autenticación
      this.user = null
      this.token = null
      this.error = null
      this.initialized = false

      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']

      console.log('✅ Sesión cerrada (carrito persistente en BD)')
    },

    async initializeAuth() {
      if (this.initialized) return
      
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          const decoded = jwtDecode(token)
          const currentTime = Date.now() / 1000

          if (decoded.exp < currentTime) {
            console.log('⏰ Token expirado, cerrando sesión...')
            await this.logout()
          } else {
            this.token = token
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            await this.fetchUserProfile()
            
            // ✅ NO CARGAR CARRITO AQUÍ (se carga en App.vue)
          }
        } catch (error) {
          console.error('❌ Error al decodificar token:', error)
          await this.logout()
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
        await this.logout()
        throw error
      }
    }
  }
})
