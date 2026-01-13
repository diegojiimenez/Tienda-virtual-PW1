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
              <router-link
                :to="`/orders/${order.id}`"
                class="text-gray-900 hover:text-gray-700 font-medium text-sm flex items-center"
              >
                View Details
                <ChevronRightIcon class="h-4 w-4 ml-1" />
              </router-link>

              <button
                v-if="order.estado === 'en-curso'"
                @click="handleCancelOrder(order)"
                class="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Cancel Order
              </button>
            </div>
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
import { useConfirm } from '@/composables/useConfirm'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()
const orderStore = useOrderStore()
const { confirm } = useConfirm()

const activeFilter = ref('all')

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

const handleCancelOrder = async (order) => {
  try {
    const motivo = await confirm({
      title: 'Cancel Order?',
      message: `Are you sure you want to cancel order ${order.numeroOrden}? This action cannot be undone.`,
      confirmText: 'Yes, Cancel Order',
      cancelText: 'Keep Order',
      type: 'danger'
    })

    // Si el usuario confirma, pedir motivo
    const reason = prompt('Please provide a reason for cancellation (optional):')
    
    await orderStore.cancelOrder(order.id, reason || 'No reason provided')
    
    // Recargar órdenes
    await orderStore.fetchOrders()
  } catch (error) {
    if (error?.message) {
      alert(error.message)
    }
    // Usuario canceló la acción
  }
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/64?text=No+Image'
}

onMounted(async () => {
  await orderStore.fetchOrders()
})
</script>