<template>
  <div class="min-h-screen bg-white">
    <!-- Navbar -->
    <Navbar />

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Barra de búsqueda -->
      <div class="mb-8">
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            v-model="productStore.filters.search"
            @input="handleSearch"
            type="text"
            placeholder="Search for products"
            class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>

      <!-- Título y filtros -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">All Products</h1>
        <p class="text-sm text-gray-600">{{ productStore.filteredProducts.length }} products</p>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-3 mb-8">
        <!-- Filtro de categoría -->
        <div class="relative">
          <button
            @click="toggleFilter('category')"
            class="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <span class="text-sm font-medium text-gray-700">Category</span>
            <ChevronDownIcon class="h-4 w-4 text-gray-500" />
          </button>

          <div 
            v-if="activeFilter === 'category'"
            class="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
          >
            <button
              @click="selectCategory('')"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
              :class="{ 'bg-blue-50 text-primary': !productStore.filters.categoria }"
            >
              All Categories
            </button>
            <button
              v-for="cat in productStore.categories"
              :key="cat"
              @click="selectCategory(cat)"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 capitalize font-medium"
              :class="{ 'bg-blue-50 text-primary': productStore.filters.categoria === cat }"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- Filtro de talla -->
        <div class="relative">
          <button
            @click="toggleFilter('size')"
            class="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <span class="text-sm font-medium text-gray-700">Size</span>
            <ChevronDownIcon class="h-4 w-4 text-gray-500" />
          </button>

          <div 
            v-if="activeFilter === 'size'"
            class="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
          >
            <button
              @click="selectSize('')"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
              :class="{ 'bg-blue-50 text-primary': !productStore.filters.talla }"
            >
              All Sizes
            </button>
            <button
              v-for="size in productStore.availableSizes"
              :key="size"
              @click="selectSize(size)"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
              :class="{ 'bg-blue-50 text-primary': productStore.filters.talla === size }"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Filtro de color -->
        <div class="relative">
          <button
            @click="toggleFilter('color')"
            class="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <span class="text-sm font-medium text-gray-700">Color</span>
            <ChevronDownIcon class="h-4 w-4 text-gray-500" />
          </button>

          <div 
            v-if="activeFilter === 'color'"
            class="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 max-h-64 overflow-y-auto"
          >
            <button
              @click="selectColor('')"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
              :class="{ 'bg-blue-50 text-primary': !productStore.filters.color }"
            >
              All Colors
            </button>
            <button
              v-for="color in productStore.availableColors"
              :key="color"
              @click="selectColor(color)"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
              :class="{ 'bg-blue-50 text-primary': productStore.filters.color === color }"
            >
              {{ color }}
            </button>
          </div>
        </div>

        <!-- Filtro de precio -->
        <div class="relative">
          <button
            @click="toggleFilter('price')"
            class="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <span class="text-sm font-medium text-gray-700">Price</span>
            <ChevronDownIcon class="h-4 w-4 text-gray-500" />
          </button>

          <div 
            v-if="activeFilter === 'price'"
            class="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10"
          >
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Min Price</label>
                <input
                  v-model.number="priceRange.min"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  :min="productStore.priceRange.min"
                  :max="productStore.priceRange.max"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Max Price</label>
                <input
                  v-model.number="priceRange.max"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  :min="productStore.priceRange.min"
                  :max="productStore.priceRange.max"
                />
              </div>
              <button
                @click="applyPriceFilter"
                class="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        <!-- Botón limpiar filtros -->
        <button
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Clear all
        </button>
      </div>

      <!-- Grid de productos -->
      <div v-if="productStore.loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="productStore.filteredProducts.length === 0" class="text-center py-20">
        <p class="text-gray-500">No products found</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <ProductCard
          v-for="product in productStore.filteredProducts"
          :key="product._id"
          :product="product"
          @click="viewProduct(product._id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useProductStore } from '@/stores/product';
import { useCartStore } from '@/stores/cart';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
import ProductCard from '@/components/ProductCard.vue';
import Navbar from '@/components/Navbar.vue';  // ✅ AGREGAR

const router = useRouter();
const authStore = useAuthStore();
const productStore = useProductStore();
const cartStore = useCartStore();

// ELIMINAR: showDropdown, dropdown, toggleDropdown, closeDropdown, logout, handleClickOutside del usuario
// MANTENER SOLO: activeFilter y su lógica

const activeFilter = ref(null);
const priceRange = ref({
  min: 0,
  max: 1000
});

// Avatar aleatorio del usuario
const userAvatar = computed(() => {
  const avatars = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5',
  ];
  const savedAvatar = localStorage.getItem('userAvatar');
  if (savedAvatar) return savedAvatar;
  
  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
  localStorage.setItem('userAvatar', randomAvatar);
  return randomAvatar;
});

const hasActiveFilters = computed(() => {
  return productStore.filters.search ||
         productStore.filters.categoria ||
         productStore.filters.talla ||
         productStore.filters.color ||
         productStore.filters.precioMin ||
         productStore.filters.precioMax;
});

let searchTimeout = null;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    productStore.applyFilters();
  }, 300);
};

const toggleFilter = (filter) => {
  activeFilter.value = activeFilter.value === filter ? null : filter;
};

const selectCategory = (cat) => {
  productStore.setFilter('categoria', cat);
  activeFilter.value = null;
};

const selectSize = (size) => {
  productStore.setFilter('talla', size);
  activeFilter.value = null;
};

const selectColor = (color) => {
  productStore.setFilter('color', color);
  activeFilter.value = null;
};

const applyPriceFilter = () => {
  productStore.filters.precioMin = priceRange.value.min;
  productStore.filters.precioMax = priceRange.value.max;
  productStore.applyFilters();
  activeFilter.value = null;
};

const clearAllFilters = () => {
  productStore.clearFilters();
  priceRange.value = {
    min: productStore.priceRange.min,
    max: productStore.priceRange.max
  };
};

const viewProduct = (id) => {
  router.push(`/product/${id}`);
};

const openMessages = () => {
  if (authStore.isAdmin) {
    router.push('/admin/chat');
  } else {
    router.push('/chat');
  }
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const handleClickOutside = (event) => {
  // SOLO para filtros, NO para dropdown de usuario (ya está en Navbar)
  if (!event.target.closest('.relative')) {
    activeFilter.value = null;
  }
};

onMounted(async () => {
  await productStore.fetchProducts();
  priceRange.value = {
    min: productStore.priceRange.min,
    max: productStore.priceRange.max
  };
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>