<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <Navbar />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Orders</h1>
        <p class="text-gray-600 mt-2">Track and manage your orders</p>
      </div>

      <!-- Filter Tabs -->
      <div class="bg-white rounded-lg shadow-sm mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
            <button
              @click="activeFilter = 'all'"
              :class="[
                activeFilter === 'all'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
              ]"
            >
              All Orders
              <span
                :class="[
                  activeFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-700',
                  'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium'
                ]"
              >
                {{ orderStore.orders.length }}
              </span>
            </button>
            <button
              @click="activeFilter = 'en-curso'"
              :class="[
                activeFilter === 'en-curso'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
              ]"
            >
              In Progress
              <span
                :class="[
                  activeFilter === 'en-curso'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700',
                  'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium'
                ]"
              >
                {{ orderStore.ordersInProgress.length }}
              </span>
            </button>
            <button
              @click="activeFilter = 'completada'"
              :class="[
                activeFilter === 'completada'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
              ]"
            >
              Completed
              <span
                :class="[
                  activeFilter === 'completada'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700',
                  'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium'
                ]"
              >
                {{ orderStore.completedOrders.length }}
              </span>
            </button>
            <button
              @click="activeFilter = 'cancelada'"
              :class="[
                activeFilter === 'cancelada'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
              ]"
            >
              Canceled
              <span
                :class="[
                  activeFilter === 'cancelada'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700',
                  'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium'
                ]"
              >
                {{ orderStore.canceledOrders.length }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="orderStore.loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredOrders.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <ShoppingBagIcon class="h-24 w-24 text-gray-300 mx-auto mb-6" />
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          {{ activeFilter === 'all' ? 'No orders yet' : `No ${getFilterLabel(activeFilter)} orders` }}
        </h2>
        <p class="text-gray-600 mb-8">
          {{ activeFilter === 'all' ? 'Start shopping to create your first order!' : 'Try changing the filter to see more orders.' }}
        </p>
        <router-link v-if="activeFilter === 'all'" to="/shop" class="btn-primary inline-block">
          Start Shopping
        </router-link>
        <button v-else @click="activeFilter = 'all'" class="btn-primary inline-block">
          View All Orders
        </button>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-4">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="p-6">
            <!-- Order Header -->
            <div class="flex items-start justify-between mb-4">
              <div>
                <div class="flex items-center space-x-3">
                  <h3 class="text-lg font-semibold text-gray-900">
                    Order {{ order.numeroOrden }}
                  </h3>
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium',
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
                <p class="text-sm text-gray-500 mt-1">
                  Placed on {{ formatDate(order.fechaOrden) }}
                </p>
                <p v-if="order.fechaCompletada" class="text-sm text-green-600 mt-1">
                  Completed on {{ formatDate(order.fechaCompletada) }}
                </p>
                <p v-if="order.fechaCancelada" class="text-sm text-red-600 mt-1">
                  Canceled on {{ formatDate(order.fechaCancelada) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-gray-900">
                  ${{ order.total.toFixed(2) }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}
                </p>
              </div>
            </div>

            <!-- Order Items Preview -->
            <div class="flex items-center space-x-4 mb-4 overflow-x-auto">
              <div
                v-for="item in order.items.slice(0, 4)"
                :key="item.id"
                class="flex-shrink-0"
              >
                <img
                  :src="item.imagen || item.producto?.imagen"
                  :alt="item.nombre"
                  class="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  @error="handleImageError"
                />
              </div>
              <div v-if="order.items.length > 4" class="flex-shrink-0">
                <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  <span class="text-sm font-medium text-gray-600">
                    +{{ order.items.length - 4 }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Order Actions -->
                        <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                            <router-link :to="`/orders/${order.id}`"
                                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                                    </path>
                                </svg>
                                View Details
                            </router-link>

                            <button v-if="order.estado === 'en-curso'" @click="openCancelModal(order)"
                                class="text-red-600 hover:text-red-700 font-medium text-sm">
                                Cancel Order
                            </button>
           
             </div>
                    </div>
                </div>
            </div>
        </div>

  

    <!-- Modal de Cancelación -->
    <div
      v-if="showCancelModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeCancelModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <!-- Icono de advertencia -->
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>

          <h3 class="text-lg font-bold text-gray-900 text-center mb-2">
            Cancel Order?
          </h3>

          <p class="text-sm text-gray-600 text-center mb-4">
            Are you sure you want to cancel order <span class="font-semibold">{{ orderToCancel?.numeroOrden }}</span>? This action cannot be undone.
          </p>

          <!-- Campo de razón -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Reason for cancellation (optional)
            </label>
            <textarea
              v-model="cancelReason"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 resize-none"
              placeholder="e.g., Changed my mind, found a better price..."
            ></textarea>
          </div>

          <!-- Botones -->
          <div class="flex gap-3">
            <button
              @click="closeCancelModal"
              class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Keep Order
            </button>
            <button
              @click="confirmCancelOrder"
              :disabled="canceling"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ canceling ? 'Canceling...' : 'Yes, Cancel Order' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { ShoppingBagIcon } from '@heroicons/vue/24/outline'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()
const orderStore = useOrderStore()

const activeFilter = ref('all')
const showCancelModal = ref(false)
const orderToCancel = ref(null)
const cancelReason = ref('')
const canceling = ref(false)

const filteredOrders = computed(() => {
  if (activeFilter.value === 'all') {
    return orderStore.orders
  }
  return orderStore.orders.filter(order => order.estado === activeFilter.value)
})

const getStatusLabel = (estado) => {
  const labels = {
    'en-curso': 'In Progress',
    'completada': 'Completed',
    'cancelada': 'Canceled'
  }
  return labels[estado] || estado
}

const getFilterLabel = (filter) => {
  return getStatusLabel(filter).toLowerCase()
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const openCancelModal = (order) => {
  orderToCancel.value = order
  cancelReason.value = ''
  showCancelModal.value = true
}

const closeCancelModal = () => {
  showCancelModal.value = false
  orderToCancel.value = null
  cancelReason.value = ''
}

const confirmCancelOrder = async () => {
  if (!orderToCancel.value) return

  canceling.value = true

  try {
    await orderStore.cancelOrder(
      orderToCancel.value.id, 
      cancelReason.value || 'No reason provided'
    )
    
    closeCancelModal()
    await orderStore.fetchOrders()
    
    // Mostrar notificación de éxito (opcional)
    alert('Order canceled successfully')
  } catch (error) {
    alert(error?.message || 'Failed to cancel order')
  } finally {
    canceling.value = false
  }
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/64?text=No+Image'
}

onMounted(async () => {
  await orderStore.fetchOrders()
})
</script>