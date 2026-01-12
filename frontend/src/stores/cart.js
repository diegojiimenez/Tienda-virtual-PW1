import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import cartService from '@/services/CartService' 

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    showDrawer: false
  }),

  getters: {
    totalItems: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },

    subtotal: (state) => {
      return state.items.reduce((total, item) => {
        const precio = item.product?.precio || item.precioUnitario || 0
        const cantidad = item.quantity || item.cantidad || 0
        return total + (precio * cantidad)
      }, 0)
    },

    tax: (state) => {
      return state.items.reduce((total, item) => {
        const precio = item.product?.precio || item.precioUnitario || 0
        const cantidad = item.quantity || item.cantidad || 0
        return total + (precio * cantidad)
      }, 0) * 0.16
    },

    total: (state) => {
      const subtotal = state.items.reduce((total, item) => {
        const precio = item.product?.precio || item.precioUnitario || 0
        const cantidad = item.quantity || item.cantidad || 0
        return total + (precio * cantidad)
      }, 0)
      return subtotal + (subtotal * 0.16)
    },

    isEmpty: (state) => state.items.length === 0
  },

  actions: {
    async loadCartFromDB() {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        console.log('⚠️ Usuario no autenticado, carrito vacío')
        this.items = []
        return
      }

      this.loading = true
      this.error = null

      try {
        const cart = await cartService.getMyCart()
        
        if (!cart || !cart.items) {
          console.log('📦 Carrito vacío inicializado')
          this.items = []
          return
        }
        
        this.items = cart.items.map(item => ({
          id: item.id,
          product: {
            _id: item.producto.id,
            id: item.producto.id,
            nombre: item.producto.nombre,
            descripcion: item.producto.descripcion,
            precio: item.producto.precio,
            categoria: item.producto.categoria,
            imagen: item.producto.imagen,
            disponible: item.producto.disponible,
            stock: item.producto.stock
          },
          quantity: item.cantidad,
          size: item.talla,
          color: item.color
        }))

        console.log(`✅ Carrito cargado desde BD: ${this.items.length} items`)
      } catch (error) {
        console.error('❌ Error loading cart from DB:', error)
        this.error = error.message || 'Error al cargar el carrito'
        this.items = []
      } finally {
        this.loading = false
      }
    },

    async addItem({ product, quantity, size, color }) {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        throw new Error('Debes iniciar sesión para agregar productos al carrito')
      }

      this.loading = true
      this.error = null

      try {
        const cart = await cartService.addToCart({
          productoId: product._id || product.id,
          cantidad: quantity,
          talla: size,
          color: color
        })

        this.items = cart.items.map(item => ({
          id: item.id,
          product: {
            _id: item.producto.id,
            id: item.producto.id,
            nombre: item.producto.nombre,
            descripcion: item.producto.descripcion,
            precio: item.producto.precio,
            categoria: item.producto.categoria,
            imagen: item.producto.imagen,
            disponible: item.producto.disponible,
            stock: item.producto.stock
          },
          quantity: item.cantidad,
          size: item.talla,
          color: item.color
        }))

        console.log(`🛒 Producto agregado: ${product.nombre} (${color}, ${size}) x${quantity}`)
      } catch (error) {
        console.error('❌ Error adding item to cart:', error)
        this.error = error.message || 'Error al agregar producto al carrito'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateQuantity(index, quantity) {
      if (quantity <= 0) {
        await this.removeItem(index)
        return
      }

      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        throw new Error('Debes iniciar sesión')
      }

      this.loading = true
      this.error = null

      try {
        const itemId = this.items[index].id
        
        const cart = await cartService.updateCartItem({
          itemId,
          cantidad: quantity
        })

        this.items = cart.items.map(item => ({
          id: item.id,
          product: {
            _id: item.producto.id,
            id: item.producto.id,
            nombre: item.producto.nombre,
            descripcion: item.producto.descripcion,
            precio: item.producto.precio,
            categoria: item.producto.categoria,
            imagen: item.producto.imagen,
            disponible: item.producto.disponible,
            stock: item.producto.stock
          },
          quantity: item.cantidad,
          size: item.talla,
          color: item.color
        }))

        console.log(`✏️ Cantidad actualizada`)
      } catch (error) {
        console.error('❌ Error updating quantity:', error)
        this.error = error.message || 'Error al actualizar cantidad'
        throw error
      } finally {
        this.loading = false
      }
    },

    async removeItem(index) {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        throw new Error('Debes iniciar sesión')
      }

      this.loading = true
      this.error = null

      try {
        const itemId = this.items[index].id
        const removedItem = this.items[index]
        
        const cart = await cartService.removeFromCart(itemId)

        this.items = cart.items.map(item => ({
          id: item.id,
          product: {
            _id: item.producto.id,
            id: item.producto.id,
            nombre: item.producto.nombre,
            descripcion: item.producto.descripcion,
            precio: item.producto.precio,
            categoria: item.producto.categoria,
            imagen: item.producto.imagen,
            disponible: item.producto.disponible,
            stock: item.producto.stock
          },
          quantity: item.cantidad,
          size: item.talla,
          color: item.color
        }))

        console.log(`🗑️ Producto eliminado: ${removedItem.product.nombre}`)
      } catch (error) {
        console.error('❌ Error removing item from cart:', error)
        this.error = error.message || 'Error al eliminar producto'
        throw error
      } finally {
        this.loading = false
      }
    },

    async clearCart() {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        throw new Error('Debes iniciar sesión')
      }

      this.loading = true
      this.error = null

      try {
        await cartService.clearCart()
        this.items = []
        console.log('🧹 Carrito limpiado completamente')
      } catch (error) {
        console.error('❌ Error clearing cart:', error)
        this.error = error.message || 'Error al limpiar carrito'
        throw error
      } finally {
        this.loading = false
      }
    },

    clearStoreOnly() {
      this.items = []
      this.showDrawer = false
      this.error = null
      console.log('🔄 Store del carrito limpiado (BD intacta)')
    },

    openDrawer() {
      this.showDrawer = true
    },

    closeDrawer() {
      this.showDrawer = false
    }
  }
})