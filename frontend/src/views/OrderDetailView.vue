<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <Navbar />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back Button -->
      <button
        @click="goBack"
        class="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon class="h-5 w-5 mr-2" />
        Back to Orders
      </button>

      <!-- Loading State -->
      <div v-if="orderStore.loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>

      <!-- Order Content -->
      <div v-else-if="order" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Order Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order Header -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">
                  Order {{ order.numeroOrden }}
                </h1>
                <div class="flex items-center space-x-3">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-sm font-medium',
                      order.estado === 'en-curso'
                        ? 'bg-blue-100 text-blue-800'
                        : order.estado === 'completada'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ getStatusLabel(order.estado) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Order Date:</span>
                <span class="font-medium text-gray-900">{{ formatDate(order.fechaOrden) }}</span>
              </div>
              <div v-if="order.fechaCompletada" class="flex justify-between">
                <span class="text-gray-600">Completed:</span>
                <span class="font-medium text-green-600">{{ formatDate(order.fechaCompletada) }}</span>
              </div>
              <div v-if="order.fechaCancelada" class="flex justify-between">
                <span class="text-gray-600">Canceled:</span>
                <span class="font-medium text-red-600">{{ formatDate(order.fechaCancelada) }}</span>
              </div>
              <div v-if="order.motivoCancelacion" class="flex justify-between">
                <span class="text-gray-600">Reason:</span>
                <span class="font-medium text-gray-900">{{ order.motivoCancelacion }}</span>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
            
            <div class="space-y-4">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
              >
                <!-- Product Image -->
                <div class="w-24 h-24 flex-shrink-0">
                  <img
                    :src="item.imagen || item.producto?.imagen"
                    :alt="item.nombre"
                    class="w-full h-full object-cover rounded-lg"
                    @error="handleImageError"
                  />
                </div>

                <!-- Product Info -->
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">{{ item.nombre }}</h3>
                  <p v-if="item.producto?.categoria" class="text-sm text-gray-500 capitalize mt-1">
                    {{ item.producto.categoria }}
                  </p>
                  
                  <div class="flex gap-2 mt-2">
                    <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      Size: {{ item.talla }}
                    </span>
                    <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
                      Color: {{ item.color }}
                    </span>
                    <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      Qty: {{ item.cantidad }}
                    </span>
                  </div>
                </div>

                <!-- Price -->
                <div class="text-right">
                  <p class="text-sm text-gray-500">${{ item.precioUnitario.toFixed(2) }} each</p>
                  <p class="text-lg font-bold text-gray-900 mt-1">
                    ${{ item.subtotal.toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            <div class="space-y-3">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span class="font-medium text-gray-900">${{ order.subtotal.toFixed(2) }}</span>
              </div>

              <div class="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span class="font-medium text-green-600">FREE</span>
              </div>

              <div class="flex justify-between text-gray-600">
                <span>Tax (16%)</span>
                <span class="font-medium text-gray-900">${{ order.impuestos.toFixed(2) }}</span>
              </div>

              <div class="pt-3 border-t border-gray-200">
                <div class="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${{ order.total.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <button
                v-if="order.estado === 'en-curso'"
                @click="handleCancelOrder"
                class="w-full py-3 px-4 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                Cancel Order
              </button>
              
              <div v-else-if="order.estado === 'completada'" class="text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <CheckCircleIcon class="h-6 w-6 text-green-600" />
                </div>
                <p class="text-sm text-gray-600">Order completed successfully</p>
              </div>
              
              <div v-else class="text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
                  <XCircleIcon class="h-6 w-6 text-red-600" />
                </div>
                <p class="text-sm text-gray-600">Order was canceled</p>
              </div>
            </div>

            <!-- Help Section -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-3">Need Help?</h3>
              <router-link
                to="/chat"
                class="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                <ChatBubbleLeftIcon class="h-5 w-5 mr-2" />
                Contact Support
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
        <XCircleIcon class="h-24 w-24 text-red-300 mx-auto mb-6" />
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
        <p class="text-gray-600 mb-8">The order you're looking for doesn't exist or you don't have access to it.</p>
        <router-link to="/orders" class="btn-primary inline-block">
          Back to Orders
        </router-link>
      </div>
    </div>

    <!-- Cancel Order Modal -->
    <div
      v-if="showCancelModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showCancelModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
        <div class="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
          <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h3 class="text-xl font-bold text-gray-900 text-center mb-2">
          Cancel Order?
        </h3>
        
        <p class="text-sm text-gray-600 text-center mb-4">
          Please tell us why you want to cancel this order. The stock will be restored.
        </p>

        <textarea
          v-model="cancelReason"
          rows="4"
          placeholder="Reason for cancellation..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 mb-4 resize-none"
        ></textarea>

        <div class="flex gap-3">
          <button
            @click="showCancelModal = false; cancelReason = ''"
            class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Keep Order
          </button>
          <button
            @click="confirmCancelOrder"
            :disabled="!cancelReason.trim() || cancelling"
            class="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ cancelling ? 'Cancelling...' : 'Cancel Order' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import Navbar from '@/components/Navbar.vue'  // ✅ AGREGAR
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon
} from '@heroicons/vue/24/outline'
import { useConfirm } from '@/composables/useConfirm'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const { confirm } = useConfirm()

const showCancelModal = ref(false)
const cancelReason = ref('')
const cancelling = ref(false)

const order = computed(() => orderStore.currentOrder)

const goBack = () => {
  router.push('/orders')
}

const getStatusLabel = (estado) => {
  const labels = {
    'en-curso': 'In Progress',
    'completada': 'Completed',
    'cancelada': 'Canceled'
  }
  return labels[estado] || estado
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleCancelOrder = async () => {
  showCancelModal.value = true
}

const confirmCancelOrder = async () => {
  if (!cancelReason.value.trim()) return

  cancelling.value = true
  
  try {
    await orderStore.cancelOrder(order.value.id, cancelReason.value.trim())
    showCancelModal.value = false
    cancelReason.value = ''
    
    // Mostrar mensaje de éxito con confirm
    await confirm({
      title: 'Order Cancelled',
      message: 'Your order has been cancelled successfully. The stock has been restored.',
      confirmText: 'OK',
      type: 'success'
    })
  } catch (error) {
    console.error('Error cancelling order:', error)
    await confirm({
      title: 'Error',
      message: error.message || 'Error cancelling order. Please try again.',
      confirmText: 'OK',
      type: 'danger'
    })
  } finally {
    cancelling.value = false
  }
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/96?text=No+Image'
}

onMounted(async () => {
  const orderId = route.params.id
  try {
    await orderStore.fetchOrder(orderId)
  } catch (error) {
    console.error('Error loading order:', error)
  }
})

onBeforeUnmount(() => {
  orderStore.clearCurrentOrder()
})
</script>