<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import CartDrawer from '@/components/cart/CartDrawer.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useConfirm } from '@/composables/useConfirm'

const cartStore = useCartStore()
const confirmDialog = useConfirm()

onMounted(() => {
  cartStore.loadCartFromStorage()
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