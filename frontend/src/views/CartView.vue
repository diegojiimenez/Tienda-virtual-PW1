<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <Navbar />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="goBack"
          class="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon class="h-5 w-5 mr-2" />
          Continue Shopping
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p class="text-gray-600 mt-2">{{ cartStore.totalItems }} items in your cart</p>
      </div>

      <!-- Loading State -->
      <div v-if="cartStore.loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="cartStore.isEmpty" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <ShoppingCartIcon class="h-24 w-24 text-gray-300 mx-auto mb-6" />
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p class="text-gray-600 mb-8">Add some amazing products to get started!</p>
        <router-link to="/shop" class="btn-primary inline-block">
          Browse Products
        </router-link>
      </div>

      <!-- Cart Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
          <div
            v-for="(item, index) in cartStore.items"
            :key="`${item.id}-${index}`"
            class="bg-white rounded-lg shadow-sm p-6"
          >
            <div class="flex gap-6">
              <!-- Product Image -->
              <div class="w-32 h-32 flex-shrink-0">
                <img
                  :src="item.product.imagen"
                  :alt="item.product.nombre"
                  class="w-full h-full object-cover rounded-lg"
                  @error="handleImageError"
                />
              </div>

              <!-- Product Info -->
              <div class="flex-1">
                <div class="flex justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">
                      {{ item.product.nombre }}
                    </h3>
                    <p class="text-sm text-gray-500 mt-1 capitalize">
                      {{ item.product.categoria }}
                    </p>
                  </div>
                  <button
                    @click="removeItem(index)"
                    class="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>

                <!-- Attributes -->
                <div class="flex gap-3 mt-3">
                  <span v-if="item.size" class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
                    Size: {{ item.size }}
                  </span>
                  <span v-if="item.color" class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg capitalize">
                    Color: {{ item.color }}
                  </span>
                </div>

                <!-- Price and Quantity -->
                <div class="flex items-center justify-between mt-4">
                  <div class="flex items-center gap-3">
                    <button
                      @click="decreaseQuantity(index, item.quantity)"
                      :disabled="item.quantity <= 1 || updating"
                      class="w-8 h-8 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MinusIcon class="h-4 w-4 text-gray-700" />
                    </button>
                    
                    <span class="text-lg font-medium text-gray-900 w-12 text-center">
                      {{ item.quantity }}
                    </span>
                    
                    <button
                      @click="increaseQuantity(index, item.quantity, item.product.stock)"
                      :disabled="item.quantity >= item.product.stock || updating"
                      class="w-8 h-8 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusIcon class="h-4 w-4 text-gray-700" />
                    </button>
                  </div>

                  <div class="text-right">
                    <p class="text-sm text-gray-500">${{ item.product.precio.toFixed(2) }} each</p>
                    <p class="text-xl font-bold text-gray-900">
                      ${{ (item.product.precio * item.quantity).toFixed(2) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 class="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

            <div class="space-y-4">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal ({{ cartStore.totalItems }} items)</span>
                <span class="font-medium text-gray-900">${{ cartStore.subtotal.toFixed(2) }}</span>
              </div>

              <div class="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span class="font-medium text-green-600">FREE</span>
              </div>

              <div class="flex justify-between text-gray-600">
                <span>Tax (16%)</span>
                <span class="font-medium text-gray-900">${{ cartStore.tax.toFixed(2) }}</span>
              </div>

              <div class="pt-4 border-t border-gray-200">
                <div class="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${{ cartStore.total.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <button @click="placeOrder" :disabled="cartStore.loading"
              class="w-full btn-primary mt-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ cartStore.loading ? 'Processing...' : 'Place Order' }}
            </button>

            <router-link
              to="/shop"
              class="block w-full text-center text-sm text-gray-600 hover:text-gray-900 mt-4"
            >
              Continue Shopping
            </router-link>

            <!-- Trust Badges -->
            <div class="mt-8 pt-6 border-t border-gray-200 space-y-3">
              <div class="flex items-center text-sm text-gray-600">
                <TruckIcon class="h-5 w-5 mr-3 text-gray-400" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <ShieldCheckIcon class="h-5 w-5 mr-3 text-gray-400" />
                <span>Secure checkout</span>
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <ArrowPathIcon class="h-5 w-5 mr-3 text-gray-400" />
                <span>30-day return policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Modal -->
      <div
        v-if="showSuccessModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeSuccessModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
          <div class="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 class="text-xl font-bold text-gray-900 text-center mb-2">
            Order Placed Successfully!
          </h3>
          
          <p class="text-sm text-gray-600 text-center mb-4">
            Your order has been confirmed and is being processed.
          </p>

          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <p class="text-sm text-gray-600 text-center">Order Number</p>
            <p class="text-lg font-bold text-gray-900 text-center">{{ orderNumber }}</p>
          </div>

          <button
            @click="closeSuccessModal"
            class="w-full btn-primary py-3"
          >
            View Order Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { useOrderStore } from '@/stores/order';
import Navbar from '@/components/Navbar.vue';  // ✅ AGREGAR
import {
  ArrowLeftIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline';
import { useConfirm } from '@/composables/useConfirm';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const orderStore = useOrderStore();

const updating = ref(false);
const showSuccessModal = ref(false);
const orderNumber = ref('');
const orderId = ref('');

const goBack = () => {
  router.push('/shop');
};

const increaseQuantity = async (index, currentQuantity, stock) => {
  if (currentQuantity < stock && !updating.value) {
    updating.value = true;
    try {
      await cartStore.updateQuantity(index, currentQuantity + 1);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      updating.value = false;
    }
  }
};

const decreaseQuantity = async (index, currentQuantity) => {
  if (currentQuantity > 1 && !updating.value) {
    updating.value = true;
    try {
      await cartStore.updateQuantity(index, currentQuantity - 1);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      updating.value = false;
    }
  }
};

const { confirm } = useConfirm();

const removeItem = async (index) => {
  try {
    await confirm({
      title: 'Remove item?',
      message: `Are you sure you want to remove "${cartStore.items[index].product.nombre}" from your cart?`,
      confirmText: 'Remove',
      cancelText: 'Keep it',
      type: 'danger'
    });
    
    await cartStore.removeItem(index);
  } catch {
    // Usuario canceló
  }
};

const placeOrder = async () => {
  try {
    cartStore.loading = true;
    const order = await orderStore.createOrder();
    
    orderNumber.value = order.numeroOrden;
    orderId.value = order.id;
    
    // ✅ RECARGAR CARRITO
    await cartStore.loadCartFromDB();
    
    showSuccessModal.value = true;
  } catch (error) {
    await confirm({
      title: 'Error',
      message: error.message || 'Error placing order. Please try again.',
      confirmText: 'OK',
      type: 'danger'
    });
  } finally {
    cartStore.loading = false;
  }
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
  router.push(`/orders/${orderId.value}`);
};

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/300?text=No+Image';
};
</script>