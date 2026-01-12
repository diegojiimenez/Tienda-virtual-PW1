<template>
  <!-- Overlay -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="cartStore.showDrawer"
      class="fixed inset-0 bg-black bg-opacity-50 z-50"
      @click="cartStore.closeDrawer()"
    ></div>
  </Transition>

  <!-- Drawer -->
  <Transition
    enter-active-class="transition-transform duration-300"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-300"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <div
      v-if="cartStore.showDrawer"
      class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Shopping Cart</h2>
          <p class="text-sm text-gray-500 mt-1">{{ cartStore.totalItems }} items</p>
        </div>
        <button
          @click="cartStore.closeDrawer()"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <XMarkIcon class="h-6 w-6 text-gray-600" />
        </button>
      </div>

      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Empty State -->
        <div v-if="cartStore.isEmpty" class="flex flex-col items-center justify-center h-full text-center">
          <ShoppingCartIcon class="h-16 w-16 text-gray-300 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p class="text-sm text-gray-500 mb-6">Add some products to get started!</p>
          <button
            @click="goToShop"
            class="btn-primary"
          >
            Continue Shopping
          </button>
        </div>

        <!-- Cart Items List -->
        <div v-else class="space-y-4">
          <CartItem
            v-for="(item, index) in cartStore.items"
            :key="`${item.product._id}-${item.size}-${item.color}-${index}`"
            :item="item"
            :index="index"
          />
        </div>
      </div>

      <!-- Footer with Summary -->
      <div v-if="!cartStore.isEmpty" class="border-t border-gray-200 p-6 space-y-4">
        <!-- Subtotal -->
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Subtotal</span>
          <span class="font-medium text-gray-900">${{ cartStore.subtotal.toFixed(2) }}</span>
        </div>

        <!-- Tax -->
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Tax (16%)</span>
          <span class="font-medium text-gray-900">${{ cartStore.tax.toFixed(2) }}</span>
        </div>

        <!-- Shipping -->
        <div class="flex justify-between text-sm pb-4 border-b border-gray-200">
          <span class="text-gray-600">Shipping</span>
          <span class="font-medium text-green-600">FREE</span>
        </div>

        <!-- Total -->
        <div class="flex justify-between text-lg font-bold">
          <span class="text-gray-900">Total</span>
          <span class="text-gray-900">${{ cartStore.total.toFixed(2) }}</span>
        </div>

        <!-- Checkout Button -->
        <button
          @click="goToCheckout"
          class="w-full btn-primary py-3"
        >
          Proceed to Checkout
        </button>

        <!-- Continue Shopping -->
        <button
          @click="continueShopping"
          class="w-full text-sm text-gray-600 hover:text-gray-900 py-2"
        >
          Continue Shopping
        </button>

        <!-- Clear Cart Button - Mejorado -->
        <button
          @click="confirmClearCart"
          class="w-full text-sm text-red-600 hover:text-red-700 hover:bg-red-50 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
        >
          <TrashIcon class="h-4 w-4" />
          Clear all items
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { XMarkIcon, ShoppingCartIcon, TrashIcon } from '@heroicons/vue/24/outline';
import CartItem from './CartItem.vue';
import { useConfirm } from '@/composables/useConfirm';

const router = useRouter();
const cartStore = useCartStore();
const { confirm } = useConfirm();

const goToShop = () => {
  cartStore.closeDrawer();
  router.push('/shop');
};

const continueShopping = () => {
  cartStore.closeDrawer();
};

const goToCheckout = () => {
  cartStore.closeDrawer();
  router.push('/cart');
};

const confirmClearCart = async () => {
  try {
    await confirm({
      title: 'Clear entire cart?',
      message: 'This will remove all items from your cart. This action cannot be undone.',
      confirmText: 'Clear cart',
      cancelText: 'Cancel',
      type: 'warning'
    });
    
    cartStore.clearCart();
  } catch {
    // Usuario canceló
  }
};
</script>