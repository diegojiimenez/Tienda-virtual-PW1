import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    showDrawer: false
  }),

  getters: {
    totalItems: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0);
    },

    subtotal: (state) => {
      return state.items.reduce((total, item) => {
        return total + (item.product.precio * item.quantity);
      }, 0);
    },

    tax: (state) => {
      return state.items.reduce((total, item) => {
        return total + (item.product.precio * item.quantity);
      }, 0) * 0.16; // 16% IVA
    },

    total: (state) => {
      const subtotal = state.items.reduce((total, item) => {
        return total + (item.product.precio * item.quantity);
      }, 0);
      return subtotal + (subtotal * 0.16);
    },

    isEmpty: (state) => state.items.length === 0
  },

  actions: {
    // Obtener la key única del carrito por usuario
    getCartKey() {
      const authStore = useAuthStore();
      if (!authStore.user) return null;
      
      // Usar el ID del usuario para crear una key única
      const userId = authStore.user._id || authStore.user.id;
      return `cart_${userId}`;
    },

    // Cargar carrito desde localStorage al iniciar sesión
    loadCartFromStorage() {
      const cartKey = this.getCartKey();
      
      if (!cartKey) {
        // Si no hay usuario autenticado, limpiar el carrito del store
        this.items = [];
        return;
      }

      const savedCart = localStorage.getItem(cartKey);
      
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          // Validar que sea un array
          this.items = Array.isArray(parsedCart) ? parsedCart : [];
          console.log(`✅ Carrito cargado para usuario: ${parsedCart.length} items`);
        } catch (error) {
          console.error('❌ Error loading cart from storage:', error);
          this.items = [];
        }
      } else {
        // No hay carrito guardado, iniciar vacío
        this.items = [];
        console.log('📦 Carrito nuevo inicializado');
      }
    },

    // Guardar carrito en localStorage
    saveCartToStorage() {
      const cartKey = this.getCartKey();
      
      if (!cartKey) {
        console.warn('⚠️ No se puede guardar el carrito: usuario no autenticado');
        return;
      }

      try {
        localStorage.setItem(cartKey, JSON.stringify(this.items));
        console.log(`💾 Carrito guardado: ${this.items.length} items`);
      } catch (error) {
        console.error('❌ Error saving cart to storage:', error);
      }
    },

    // Agregar producto al carrito
    addItem({ product, quantity, size, color }) {
      const existingItem = this.items.find(item => 
        item.product._id === product._id &&
        item.size === size &&
        item.color === color
      );

      if (existingItem) {
        // Si ya existe, aumentar cantidad
        existingItem.quantity += quantity;
        console.log(`➕ Cantidad actualizada: ${existingItem.product.nombre} x${existingItem.quantity}`);
      } else {
        // Si no existe, agregar nuevo item
        this.items.push({
          product,
          quantity,
          size,
          color
        });
        console.log(`🛒 Producto agregado: ${product.nombre} (${color}, ${size}) x${quantity}`);
      }

      this.saveCartToStorage();
    },

    // Actualizar cantidad de un item
    updateQuantity(index, quantity) {
      if (quantity <= 0) {
        this.removeItem(index);
      } else {
        this.items[index].quantity = quantity;
        console.log(`🔄 Cantidad actualizada: ${this.items[index].product.nombre} x${quantity}`);
        this.saveCartToStorage();
      }
    },

    // Remover item del carrito
    removeItem(index) {
      const removedItem = this.items[index];
      this.items.splice(index, 1);
      console.log(`🗑️ Producto eliminado: ${removedItem.product.nombre}`);
      this.saveCartToStorage();
    },

    // Limpiar carrito (solo cuando el usuario lo solicite manualmente)
    clearCart() {
      this.items = [];
      console.log('🧹 Carrito limpiado completamente');
      this.saveCartToStorage();
    },

    // Limpiar solo el store, sin tocar localStorage (para cambio de usuario)
    clearStoreOnly() {
      this.items = [];
      this.showDrawer = false;
      console.log('🔄 Store del carrito limpiado (localStorage intacto)');
    },

    // Abrir drawer
    openDrawer() {
      this.showDrawer = true;
    },

    // Cerrar drawer
    closeDrawer() {
      this.showDrawer = false;
    }
  }
});