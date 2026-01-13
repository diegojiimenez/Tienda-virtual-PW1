<template>
  <nav class="sticky top-0 bg-white border-b border-gray-200 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo y nombre (con botón de retroceso opcional) -->
        <div class="flex items-center space-x-4">
          <button 
            v-if="showBackButton"
            @click="goBack"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon class="h-5 w-5 text-gray-600" />
          </button>
          <router-link to="/shop" class="flex items-center space-x-2">
            <span class="text-2xl">🛍️</span>
            <span class="text-xl font-bold text-gray-900">FashionDiego</span>
          </router-link>
        </div>
        
        <!-- Links de navegación -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link 
            to="/shop" 
            :class="[
              'transition-colors',
              currentRoute === 'shop' || currentRoute === 'product-detail'
                ? 'text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Shop
          </router-link>
          <router-link
            to="/orders"
            :class="[
              'transition-colors',
              currentRoute === 'orders' || currentRoute === 'order-detail'
                ? 'text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Orders
          </router-link>
          <!-- Admin link (solo si es admin) -->
          <router-link 
            v-if="authStore.isAdmin" 
            to="/admin" 
            :class="[
              'transition-colors',
              currentRoute === 'admin' || currentRoute === 'admin-chat'
                ? 'text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Admin
          </router-link>
        </div>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <!-- Botón de carrito -->
          <button 
            @click="cartStore.openDrawer"
            class="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ShoppingCartIcon class="w-6 h-6" />
            <span 
              v-if="cartStore.totalItems > 0" 
              class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-500 rounded-full min-w-[20px]"
            >
              {{ cartStore.totalItems }}
            </span>
          </button>

          <!-- Botón de mensajes -->
          <router-link
            :to="authStore.isAdmin ? '/admin/chat' : '/chat'"
            class="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChatBubbleLeftEllipsisIcon class="w-6 h-6" />
            <span 
              v-if="unreadMessages > 0" 
              class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-500 rounded-full min-w-[20px]"
            >
              {{ unreadMessages }}
            </span>
          </router-link>

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
              class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg"
            >
              <div class="p-3 border-b border-gray-200">
                <p class="text-sm font-medium text-gray-900">{{ authStore.user?.nombre }} {{ authStore.user?.apellido }}</p>
                <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
              </div>
              <div class="py-1">
                <button
                  @click="logout"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { 
  ShoppingCartIcon, 
  ChatBubbleLeftEllipsisIcon,
  ChevronDownIcon,
  ArrowLeftIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  showBackButton: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const showDropdown = ref(false)
const dropdown = ref(null)
const unreadMessages = ref(0)

const currentRoute = computed(() => route.name)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const logout = () => {
  authStore.logout()
  router.push('/login')
  showDropdown.value = false
}

const goBack = () => {
  router.push('/shop')
}

const handleClickOutside = (event) => {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>