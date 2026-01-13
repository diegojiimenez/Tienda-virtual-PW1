import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import orderService from '@/services/OrderService'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    currentOrder: null,
    loading: false,
    error: null
  }),

  getters: {
    ordersInProgress: (state) => {
      return state.orders.filter(order => order.estado === 'en-curso')
    },

    completedOrders: (state) => {
      return state.orders.filter(order => order.estado === 'completada')
    },

    canceledOrders: (state) => {
      return state.orders.filter(order => order.estado === 'cancelada')
    },

    hasOrders: (state) => state.orders.length > 0
  },

  actions: {
    async fetchOrders() {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        this.orders = []
        return
      }

      this.loading = true
      this.error = null

      try {
        const orders = await orderService.getMyOrders()
        this.orders = orders
        console.log(`✅ ${orders.length} órdenes cargadas`)
      } catch (error) {
        console.error('❌ Error loading orders:', error)
        this.error = error.message || 'Error al cargar órdenes'
        this.orders = []
      } finally {
        this.loading = false
      }
    },

    async fetchOrder(id) {
      this.loading = true
      this.error = null

      try {
        const order = await orderService.getOrder(id)
        this.currentOrder = order
        console.log(`✅ Orden ${order.numeroOrden} cargada`)
        return order
      } catch (error) {
        console.error('❌ Error loading order:', error)
        this.error = error.message || 'Error al cargar orden'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createOrder() {
      this.loading = true
      this.error = null

      try {
        const order = await orderService.createOrder()
        this.orders.unshift(order)
        console.log(`✅ Orden ${order.numeroOrden} creada`)
        return order
      } catch (error) {
        console.error('❌ Error creating order:', error)
        this.error = error.message || 'Error al crear orden'
        throw error
      } finally {
        this.loading = false
      }
    },

    async cancelOrder(orderId, motivo) {
      this.loading = true
      this.error = null

      try {
        const updatedOrder = await orderService.cancelOrder(orderId, motivo)
        
        // Actualizar en la lista
        const index = this.orders.findIndex(o => o.id === orderId)
        if (index !== -1) {
          this.orders[index] = { ...this.orders[index], ...updatedOrder }
        }

        // Actualizar currentOrder si es la misma
        if (this.currentOrder?.id === orderId) {
          this.currentOrder = { ...this.currentOrder, ...updatedOrder }
        }

        console.log(`✅ Orden ${updatedOrder.numeroOrden} cancelada`)
        return updatedOrder
      } catch (error) {
        console.error('❌ Error canceling order:', error)
        this.error = error.message || 'Error al cancelar orden'
        throw error
      } finally {
        this.loading = false
      }
    },

    clearCurrentOrder() {
      this.currentOrder = null
    }
  }
})