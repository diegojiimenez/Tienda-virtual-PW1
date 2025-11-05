<template>
  <div 
    class="group cursor-pointer bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
  >
    <!-- Imagen del producto -->
    <div class="relative aspect-[3/4] overflow-hidden bg-gray-100">
      <img 
        :src="product.imagen || '/placeholder-product.png'" 
        :alt="product.nombre"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        @error="handleImageError"
      />
      <div 
        v-if="!product.disponible"
        class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <span class="text-white font-semibold">Out of Stock</span>
      </div>
    </div>

    <!-- Información del producto -->
    <div class="p-4">
      <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
        {{ product.nombre }}
      </h3>
      <p class="text-lg font-bold text-gray-900">
        ${{ product.precio.toFixed(2) }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
};
</script>