<template>
  <div class="flex gap-4 p-4 bg-gray-50 rounded-lg">
    <!-- Product Image -->
    <div class="w-20 h-20 flex-shrink-0">
      <img
        :src="item.product.imagen"
        :alt="item.product.nombre"
        class="w-full h-full object-cover rounded-lg"
        @error="handleImageError"
      />
    </div>

    <!-- Product Info -->
    <div class="flex-1 min-w-0">
      <h3 class="text-sm font-medium text-gray-900 truncate">
        {{ item.product.nombre }}
      </h3>
      <p class="text-sm text-gray-500 mt-1">
        ${{ item.product.precio.toFixed(2) }}
      </p>
      
      <!-- Size and Color -->
      <div class="flex gap-2 mt-2">
        <span v-if="item.size" class="text-xs px-2 py-1 bg-white border border-gray-200 rounded">
          Size: {{ item.size }}
        </span>
        <span v-if="item.color" class="text-xs px-2 py-1 bg-white border border-gray-200 rounded capitalize">
          {{ item.color }}
        </span>
      </div>

      <!-- Quantity Controls -->
      <div class="flex items-center gap-2 mt-3">
        <button
          @click="decreaseQuantity"
          :disabled="item.quantity <= 1"
          class="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MinusIcon class="h-3 w-3 text-gray-600" />
        </button>
        
        <span class="text-sm font-medium text-gray-900 w-8 text-center">
          {{ item.quantity }}
        </span>
        
        <button
          @click="increaseQuantity"
          :disabled="item.quantity >= item.product.stock"
          class="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon class="h-3 w-3 text-gray-600" />
        </button>

        <!-- Remove Button -->
        <button
          @click="confirmRemove"
          class="ml-auto p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Remove item"
        >
          <TrashIcon class="h-4 w-4" />
        </button>
      </div>

      <!-- Subtotal -->
      <p class="text-sm font-semibold text-gray-900 mt-2">
        Subtotal: ${{ itemSubtotal.toFixed(2) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCartStore } from '@/stores/cart';
import { useConfirm } from '@/composables/useConfirm';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
});

const cartStore = useCartStore();
const { confirm } = useConfirm();

const itemSubtotal = computed(() => {
  return props.item.product.precio * props.item.quantity;
});

const increaseQuantity = () => {
  if (props.item.quantity < props.item.product.stock) {
    cartStore.updateQuantity(props.index, props.item.quantity + 1);
  }
};

const decreaseQuantity = () => {
  if (props.item.quantity > 1) {
    cartStore.updateQuantity(props.index, props.item.quantity - 1);
  }
};

const confirmRemove = async () => {
  try {
    await confirm({
      title: 'Remove item?',
      message: `Are you sure you want to remove "${props.item.product.nombre}" from your cart?`,
      confirmText: 'Remove',
      cancelText: 'Keep it',
      type: 'danger'
    });
    
    // Si confirma, eliminar
    cartStore.removeItem(props.index);
  } catch {
    // Si cancela, no hacer nada
  }
};

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/80?text=No+Image';
};
</script>