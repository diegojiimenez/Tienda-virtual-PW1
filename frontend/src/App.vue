<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import CartDrawer from '@/components/cart/CartDrawer.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useConfirm } from '@/composables/useConfirm'

const authStore = useAuthStore()
const cartStore = useCartStore()
const confirmDialog = useConfirm()

onMounted(async () => {
  // Primero inicializar autenticación
  await authStore.initializeAuth()
  
  // Si el usuario está autenticado, cargar su carrito
  if (authStore.isAuthenticated) {
    try {
      await cartStore.loadCartFromDB()
      console.log('✅ Carrito cargado en App.vue')
    } catch (error) {
      console.error('⚠️ Error al cargar carrito en App.vue:', error)
    }
  }
})
</script>

<template>
  <div id="app">
    <RouterView />
    
    <!-- CartDrawer Global -->
    <CartDrawer />
    
    <!-- ConfirmDialog Global -->
    <ConfirmDialog
      :is-open="confirmDialog.isOpen.value"
      :title="confirmDialog.title.value"
      :message="confirmDialog.message.value"
      :confirm-text="confirmDialog.confirmText.value"
      :cancel-text="confirmDialog.cancelText.value"
      :type="confirmDialog.type.value"
      @confirm="confirmDialog.handleConfirm"
      @cancel="confirmDialog.handleCancel"
      @close="confirmDialog.handleClose"
    />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
}
</style>