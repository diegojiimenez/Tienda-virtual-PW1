<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav class="sticky top-0 bg-white border-b border-gray-200 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/shop" class="flex items-center space-x-2">
            <span class="text-2xl">🛍️</span>
            <span class="text-xl font-bold text-gray-900">FashionDiego</span>
          </router-link>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <div class="relative" ref="dropdown">
              <button
                @click="toggleDropdown"
                class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-700">
                    {{ authStore.user?.nombre?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <ChevronDownIcon class="w-4 h-4 text-gray-500" />
              </button>

              <div
                v-show="showDropdown"
                class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              >
                <div class="p-3 border-b border-gray-200">
                  <p class="text-sm font-medium text-gray-900">{{ authStore.user?.nombre }} {{ authStore.user?.apellido }}</p>
                  <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
                </div>
                <div class="py-1">
                  <button
                    @click="logout"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

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

            <button
              @click="proceedToCheckout"
              class="w-full btn-primary mt-6 py-3"
            >
              Proceed to Checkout
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ChevronDownIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline';
import { useConfirm } from '@/composables/useConfirm';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const showDropdown = ref(false);
const dropdown = ref(null);
const updating = ref(false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  showDropdown.value = false;
};

const logout = () => {
  authStore.logout();
  router.push('/login');
  closeDropdown();
};

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

const proceedToCheckout = () => {
  // TODO: Implementar checkout con GraphQL
  alert('Checkout functionality coming soon with GraphQL!');
};

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/300?text=No+Image';
};

const handleClickOutside = (event) => {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    closeDropdown();
  }
};

onMounted(async () => {
  // Cargar carrito desde BD al montar el componente
  await cartStore.loadCartFromDB();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>