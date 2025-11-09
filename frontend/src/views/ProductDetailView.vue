<template>
  <div class="min-h-screen bg-white">
    <!-- Navbar -->
    <nav class="sticky top-0 bg-white border-b border-gray-200 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo y nombre -->
          <div class="flex items-center space-x-4">
            <button 
              @click="goBack"
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon class="h-5 w-5 text-gray-600" />
            </button>
            <div class="flex items-center space-x-2">
              <span class="text-2xl">🛍️</span>
              <span class="text-xl font-bold text-gray-900">FashionDiego</span>
            </div>
          </div>
          
          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <button 
              @click="openMessages"
              class="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>

            <!-- Dropdown del usuario -->
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

              <!-- Dropdown Menu -->
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

    <!-- Contenido principal -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center">
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button
          @click="goBack"
          class="text-primary hover:text-blue-600 font-medium"
        >
          Volver a la tienda
        </button>
      </div>
    </div>

    <div v-else-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Imagen del producto -->
        <div class="space-y-4">
          <div class="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-2xl">
            <img 
              :src="product.imagen || '/placeholder-product.png'" 
              :alt="product.nombre"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
            <div 
              v-if="!product.disponible"
              class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <span class="text-white text-xl font-semibold">Out of Stock</span>
            </div>
          </div>

          <!-- Miniaturas (para futuras implementaciones) -->
          <div class="grid grid-cols-4 gap-2">
            <div 
              v-for="i in 4" 
              :key="i"
              class="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
            >
              <img 
                :src="product.imagen || '/placeholder-product.png'" 
                :alt="`${product.nombre} ${i}`"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
            </div>
          </div>
        </div>

        <!-- Información del producto -->
        <div class="space-y-6">
          <!-- Título y precio -->
          <div>
            <div class="flex items-start justify-between mb-2">
              <h1 class="text-3xl font-bold text-gray-900">
                {{ product.nombre }}
              </h1>
            </div>
            <p class="text-3xl font-bold text-gray-900">
              ${{ product.precio.toFixed(2) }}
            </p>
            <p class="text-sm text-gray-600 mt-1 capitalize">
              {{ product.categoria }}
            </p>
          </div>

          <!-- Descripción -->
          <div>
            <h2 class="text-sm font-semibold text-gray-900 mb-2">Description</h2>
            <p class="text-gray-700 leading-relaxed">
              {{ product.descripcion }}
            </p>
          </div>

          <!-- Colores disponibles -->
          <div v-if="product.colores && product.colores.length > 0">
            <h2 class="text-sm font-semibold text-gray-900 mb-3">Colors</h2>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(color, index) in product.colores"
                :key="index"
                @click="selectedColor = color"
                class="px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all capitalize"
                :class="selectedColor === color 
                  ? 'border-primary bg-blue-50 text-primary' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'"
              >
                {{ color }}
              </button>
            </div>
          </div>

          <!-- Tallas disponibles -->
          <div v-if="product.tallas && product.tallas.length > 0">
            <h2 class="text-sm font-semibold text-gray-900 mb-3">Size</h2>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(talla, index) in product.tallas"
                :key="index"
                @click="selectedSize = talla"
                class="px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all uppercase"
                :class="selectedSize === talla 
                  ? 'border-primary bg-blue-50 text-primary' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'"
              >
                {{ talla }}
              </button>
            </div>
          </div>

          <!-- Cantidad -->
          <div>
            <h2 class="text-sm font-semibold text-gray-900 mb-3">Quantity</h2>
            <div class="flex items-center space-x-4">
              <button
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
                class="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <MinusIcon class="h-4 w-4 text-gray-700" />
              </button>
              <span class="text-lg font-medium text-gray-900 w-12 text-center">
                {{ quantity }}
              </span>
              <button
                @click="increaseQuantity"
                :disabled="quantity >= product.stock"
                class="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PlusIcon class="h-4 w-4 text-gray-700" />
              </button>
            </div>
            <p class="text-sm text-gray-600 mt-2">
              {{ product.stock }} available in stock
            </p>
          </div>

          <!-- Botones de acción -->
          <div class="space-y-3 pt-4">
            <button
              @click="addToCart"
              :disabled="!product.disponible || !isValidSelection"
              class="w-full btn-primary"
              :class="{ 'opacity-50 cursor-not-allowed': !product.disponible || !isValidSelection }"
            >
              <ShoppingCartIcon class="h-5 w-5 inline-block mr-2" />
              {{ product.disponible ? 'Add to Cart' : 'Out of Stock' }}
            </button>

            <button
              @click="buyNow"
              :disabled="!product.disponible || !isValidSelection"
              class="w-full bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>

          <!-- Información adicional -->
          <div class="border-t border-gray-200 pt-6 space-y-4">
            <div class="flex items-center text-sm text-gray-700">
              <TruckIcon class="h-5 w-5 mr-3 text-gray-400" />
              <span>Free shipping on orders over $50</span>
            </div>
            <div class="flex items-center text-sm text-gray-700">
              <ArrowPathIcon class="h-5 w-5 mr-3 text-gray-400" />
              <span>30-day return policy</span>
            </div>
            <div class="flex items-center text-sm text-gray-700">
              <ShieldCheckIcon class="h-5 w-5 mr-3 text-gray-400" />
              <span>2-year warranty</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Productos relacionados -->
      <div v-if="relatedProducts.length > 0" class="mt-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">You may also like</h2>
        
        <div v-if="loadingRelated" class="flex justify-center py-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <ProductCard
            v-for="relatedProduct in relatedProducts"
            :key="relatedProduct._id"
            :product="relatedProduct"
            @click="viewProduct(relatedProduct._id)"
          />
        </div>
      </div>
    </div>
    
    <!-- Notificación toast -->
    <div 
      v-if="showNotification" 
      class="fixed top-4 right-4 z-50 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg transition-all duration-300"
      :class="{ 'opacity-100 translate-y-0': showNotification, 'opacity-0 -translate-y-2': !showNotification }"
    >
      <div class="flex items-center space-x-3">
        <div class="text-2xl">{{ notificationIcon }}</div>
        <div>
          <p class="font-semibold">{{ notificationTitle }}</p>
          <p class="text-sm opacity-90">{{ notificationMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/stores/product';
import { useAuthStore } from '@/stores/auth';
import { 
  ArrowLeftIcon, 
  ShoppingCartIcon, 
  MinusIcon, 
  PlusIcon,
  TruckIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline';
import productService from '@/services/ProductService';
import ProductCard from '@/components/ProductCard.vue';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const authStore = useAuthStore();

const product = ref(null);
const loading = ref(true);
const error = ref(null);

const selectedColor = ref('');
const selectedSize = ref('');
const quantity = ref(1);

const relatedProducts = ref([]);
const loadingRelated = ref(false);

const userAvatar = computed(() => {
  return localStorage.getItem('userAvatar') || 'https://i.pravatar.cc/150?img=1';
});

const isValidSelection = computed(() => {
  const needsColor = product.value?.colores && product.value.colores.length > 0;
  const needsSize = product.value?.tallas && product.value.tallas.length > 0;
  
  if (needsColor && !selectedColor.value) return false;
  if (needsSize && !selectedSize.value) return false;
  
  return true;
});

const fetchProduct = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await productService.getProduct(route.params.id);
    product.value = response.data;
    
    // Seleccionar primer color y talla por defecto
    if (product.value.colores && product.value.colores.length > 0) {
      selectedColor.value = product.value.colores[0];
    }
    if (product.value.tallas && product.value.tallas.length > 0) {
      selectedSize.value = product.value.tallas[0];
    }

    // Cargar productos relacionados
    await fetchRelatedProducts();
  } catch (err) {
    error.value = err.response?.data?.message || 'Error loading product';
    console.error('Error fetching product:', err);
  } finally {
    loading.value = false;
  }
};

const fetchRelatedProducts = async () => {
  if (!product.value || !product.value.categoria) return;
  
  loadingRelated.value = true;
  
  try {
    const response = await productService.getProducts({
      categoria: product.value.categoria,
      disponible: true
    });
    
    // Filtrar el producto actual y limitar a 5 productos
    relatedProducts.value = (response.data || [])
      .filter(p => p._id !== product.value._id)
      .slice(0, 5);
  } catch (err) {
    console.error('Error fetching related products:', err);
  } finally {
    loadingRelated.value = false;
  }
};

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/600x800?text=No+Image';
};

const goBack = () => {
  router.push('/shop');
};

const openMessages = () => {
  if (authStore.isAdmin) {
    router.push('/admin/chat');
  } else {
    router.push('/chat');
  }
};

const viewProduct = (id) => {
  // Navegar al nuevo producto y hacer scroll al inicio
  router.push(`/product/${id}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const increaseQuantity = () => {
  if (quantity.value < product.value.stock) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const showNotification = ref(false);
const notificationTitle = ref('');
const notificationMessage = ref('');
const notificationIcon = ref('');

const showToast = (title, message, icon) => {
  notificationTitle.value = title;
  notificationMessage.value = message;
  notificationIcon.value = icon;
  showNotification.value = true;
  
  setTimeout(() => {
    showNotification.value = false;
  }, 4000);
};

const addToCart = () => {
  if (!isValidSelection.value) {
    showToast(
      'Selección incompleta',
      'Por favor selecciona todas las opciones requeridas',
      '⚠️'
    );
    return;
  }

  showToast(
    'Carrito en desarrollo',
    'Esta funcionalidad estará disponible próximamente',
    '🛒'
  );
};

const buyNow = () => {
  if (!isValidSelection.value) {
    showToast(
      'Selección incompleta',
      'Por favor selecciona todas las opciones requeridas',
      '⚠️'
    );
    return;
  }

  showToast(
    'Compra directa próximamente',
    'Estamos trabajando en esta funcionalidad',
    '🚀'
  );
};

// Watch para recargar el producto cuando cambie la ruta
watch(() => route.params.id, async (newId) => {
  if (newId) {
    // Resetear estado
    selectedColor.value = '';
    selectedSize.value = '';
    quantity.value = 1;
    relatedProducts.value = [];
    
    // Cargar nuevo producto
    await fetchProduct();
  }
});

// Dropdown state
const showDropdown = ref(false);
const dropdown = ref(null);

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

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    closeDropdown();
  }
};

onMounted(() => {
  fetchProduct();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>