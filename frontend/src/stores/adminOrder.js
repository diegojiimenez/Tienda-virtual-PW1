import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import adminOrderService from '@/services/AdminOrderService'

export const useAdminOrderStore = defineStore('adminOrder', {
  state: () => ({
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    filterStatus: null
  }),

  getters: {
    filteredOrders: (state) => {
      if (!state.filterStatus) return state.orders
      return state.orders.filter(order => order.estado === state.filterStatus)
    },

    ordersInProgress: (state) => {
      return state.orders.filter(order => order.estado === 'en-curso')
    },

    completedOrders: (state) => {
      return state.orders.filter(order => order.estado === 'completada')
    },

    canceledOrders: (state) => {
      return state.orders.filter(order => order.estado === 'cancelada')
    },

    totalOrders: (state) => state.orders.length,

    totalRevenue: (state) => {
      return state.orders
        .filter(order => order.estado === 'completada')
        .reduce((total, order) => total + order.total, 0)
    }
  },

  actions: {
    async fetchOrders(estado = null) {
      const authStore = useAuthStore()
      
      if (!authStore.isAdmin) {
        this.orders = []
        return
      }

      this.loading = true
      this.error = null

      try {
        const orders = await adminOrderService.getAllOrders(estado)
        this.orders = orders
        console.log(`✅ Admin: ${orders.length} órdenes cargadas`)
      } catch (error) {
        console.error('❌ Error loading admin orders:', error)
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
        const order = await adminOrderService.getOrder(id)
        this.currentOrder = order
        console.log(`✅ Admin: Orden ${order.numeroOrden} cargada`)
        return order
      } catch (error) {
        console.error('❌ Error loading order:', error)
        this.error = error.message || 'Error al cargar orden'
        throw error
      } finally {
        this.loading = false
      }
    },

    async completeOrder(orderId) {
      this.loading = true
      this.error = null

      try {
        const updatedOrder = await adminOrderService.completeOrder(orderId)
        
        // Actualizar en la lista
        const index = this.orders.findIndex(o => o.id === orderId)
        if (index !== -1) {
          this.orders[index] = { ...this.orders[index], ...updatedOrder }
        }

        // Actualizar currentOrder si es la misma
        if (this.currentOrder?.id === orderId) {
          this.currentOrder = { ...this.currentOrder, ...updatedOrder }
        }

        console.log(`✅ Admin: Orden ${updatedOrder.numeroOrden} completada`)
        return updatedOrder
      } catch (error) {
        console.error('❌ Error completing order:', error)
        this.error = error.message || 'Error al completar orden'
        throw error
      } finally {
        this.loading = false
      }
    },

    async cancelOrder(orderId, motivo) {
      this.loading = true
      this.error = null

      try {
        const updatedOrder = await adminOrderService.cancelOrder(orderId, motivo)
        
        // Actualizar en la lista
        const index = this.orders.findIndex(o => o.id === orderId)
        if (index !== -1) {
          this.orders[index] = { ...this.orders[index], ...updatedOrder }
        }

        // Actualizar currentOrder si es la misma
        if (this.currentOrder?.id === orderId) {
          this.currentOrder = { ...this.currentOrder, ...updatedOrder }
        }

        console.log(`✅ Admin: Orden ${updatedOrder.numeroOrden} cancelada`)
        return updatedOrder
      } catch (error) {
        console.error('❌ Error canceling order:', error)
        this.error = error.message || 'Error al cancelar orden'
        throw error
      } finally {
        this.loading = false
      }
    },

    setFilterStatus(status) {
      this.filterStatus = status
    },

    clearCurrentOrder() {
      this.currentOrder = null
    }
  }
})