<template>
  <div class="min-h-screen bg-white">
    <!-- Navbar -->
    <nav class="sticky top-0 bg-white border-b border-gray-200 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo y nombre -->
          <div class="flex items-center space-x-2">
            <span class="text-2xl">🛍️</span>
            <span class="text-xl font-bold text-gray-900">FashionDiego</span>
          </div>
          
          <!-- Links de navegación -->
          <div class="hidden md:flex items-center space-x-8">
            <router-link to="/shop" class="text-gray-600 hover:text-gray-900">Shop</router-link>
            <router-link to="/new-arrivals" class="text-gray-600 hover:text-gray-900">New Arrivals</router-link>
            <router-link to="/men" class="text-gray-600 hover:text-gray-900">Men</router-link>
            <router-link to="/women" class="text-gray-600 hover:text-gray-900">Women</router-link>
            <router-link to="/accessories" class="text-gray-600 hover:text-gray-900">Accesorios</router-link>
            <router-link to="/sale" class="text-gray-600 hover:text-gray-900">Sale</router-link>
            <router-link to="/admin" class="text-gray-900 font-medium">Admin</router-link>
          </div>

          <!-- Iconos de usuario -->
          <div class="flex items-center space-x-4">
            <!-- Botón de mensajes -->
            <button 
              @click="openMessages"
              class="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <ChatBubbleLeftRightIcon class="w-6 h-6" />
            </button>

            <!-- Dropdown del usuario -->
            <div class="relative" ref="dropdown">
              <button
                @click="toggleDropdown"
                class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span class="text-sm font-medium text-white">
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
                  <p class="text-xs text-gray-500">{{ authStore.user?.email }} (Admin)</p>
                </div>
                <div class="py-1">
                  <button
                    @click="handleLogout"
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

    <Transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="notification.show"
        class="fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <!-- Icono de éxito -->
              <div
                v-if="notification.type === 'success'"
                class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full"
              >
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <!-- Icono de error -->
              <div
                v-else-if="notification.type === 'error'"
                class="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full"
              >
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <!-- Icono de info -->
              <div
                v-else
                class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full"
              >
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-sm font-medium text-gray-900">
                {{ notification.title }}
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ notification.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="notification.show = false"
                class="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <!-- Barra de progreso -->
        <div class="h-1 bg-gray-100">
          <div
            class="h-full transition-all duration-[3000ms] ease-linear"
            :class="{
              'bg-green-500': notification.type === 'success',
              'bg-red-500': notification.type === 'error',
              'bg-blue-500': notification.type === 'info'
            }"
            :style="{ width: notification.show ? '0%' : '100%' }"
          ></div>
        </div>
      </div>
    </Transition>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-8">
        <!-- Sidebar -->
        <aside class="w-64 flex-shrink-0">
          <div class="bg-white rounded-lg overflow-hidden">
            <div class="p-4 mb-2">
              <h2 class="text-sm font-semibold text-gray-900">Admin Panel</h2>
            </div>
            
            <nav class="p-2">
              <button
                @click="activeTab = 'products'"
                class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                :class="activeTab === 'products' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50'"
              >
                <CubeIcon class="h-5 w-5" />
                <span>Products</span>
              </button>

              <button
                @click="activeTab = 'orders'"
                class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                :class="activeTab === 'orders' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50'"
              >
                <DocumentTextIcon class="h-5 w-5" />
                <span>Orders</span>
              </button>

              <button
                @click="activeTab = 'users'"
                class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                :class="activeTab === 'users' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50'"
              >
                <UsersIcon class="h-5 w-5" />
                <span>Users</span>
              </button>

              <button
                @click="activeTab = 'settings'"
                class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                :class="activeTab === 'settings' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50'"
              >
                <Cog6ToothIcon class="h-5 w-5" />
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </aside>

        <!-- Contenido principal -->
        <main class="flex-1">
          <!-- Vista de Productos -->
          <div v-if="activeTab === 'products'">
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Products</h1>
                <p class="text-sm text-gray-600 mt-1">Products management</p>
              </div>
              
              <!-- Botón de agregar producto -->
              <button
                @click="openCreateModal"
                class="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <PlusIcon class="h-5 w-5 mr-2" />
                Add Product
              </button>
            </div>

            

            <!-- Estadísticas -->
            <div v-if="loading" class="flex justify-center py-20">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>

            <div v-else class="space-y-6">
              <!-- Cards de estadísticas -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 class="text-sm font-medium text-gray-600 mb-2">Total Products</h3>
                  <p class="text-3xl font-bold text-gray-900">{{ stats.total }}</p>
                </div>

                <div class="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 class="text-sm font-medium text-gray-600 mb-2">Total in stock</h3>
                  <p class="text-3xl font-bold text-gray-900">{{ stats.inStock }}</p>
                </div>

                <div class="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 class="text-sm font-medium text-gray-600 mb-2">Total out of stock</h3>
                  <p class="text-3xl font-bold text-gray-900">{{ stats.outOfStock }}</p>
                </div>
              </div>

              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900">Customer Messages</h3>
                      <p class="text-sm text-gray-600">Manage and respond to customer inquiries</p>
                    </div>
                  </div>
                  <router-link
                    to="/admin/chat"
                    class="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                    </svg>
                    Open Admin Chat
                  </router-link>
                </div>
              </div>

              <!-- Tabla de productos -->
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="p-6 border-b border-gray-200">
                  <h2 class="text-lg font-semibold text-gray-900">Products Status</h2>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
      <tr>
        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Product ID
        </th>
        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Name
        </th>
        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Last Restock
        </th>
        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </th>
        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Quantity
        </th>
        <th class="px-6 py-3"></th>
      </tr>
                    </thead>
    <tbody class="bg-white divide-y divide-gray-200">
      <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
          #{{ product.id.slice(-4) }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
          {{ product.name }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
          {{ formatDate(product.lastRestock) }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-center">
          <span 
            class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
            :class="product.status === 'In Stock' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'"
          >
            {{ product.status }}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
          {{ product.quantity }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-center">
          <div class="relative inline-block text-left">
            <button
              @click="toggleProductMenu(product.id)"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              :ref="el => setProductMenuRef(product.id, el)"
            >
              <EllipsisVerticalIcon class="h-5 w-5" />
            </button>

            <!-- Dropdown menu -->
            <div
              v-if="activeProductMenu === product.id"
              class="absolute mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
              :class="getDropdownPosition(product.id)"
            >
              <button
                @click="openEditModal(product)"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center rounded-t-lg"
              >
                <PencilIcon class="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                @click="confirmDelete(product)"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center rounded-b-lg"
              >
                <TrashIcon class="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Otros tabs (placeholder) -->
          <div v-else class="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p class="text-gray-600">{{ activeTab }} - Coming soon</p>
          </div>
        </main>
      </div>
    </div>
  <!-- Modal de Editar/Crear Producto -->
<div
  v-if="showProductModal"
  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  @click.self="closeProductModal"
>
  <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <div class="p-6 border-b border-gray-200">
      <h2 class="text-xl font-bold text-gray-900">
        {{ isEditMode ? 'Edit Product' : 'Add New Product' }}
      </h2>
    </div>

    <form @submit.prevent="saveProduct" class="p-6 space-y-4">
      <!-- Nombre -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-2">
          Product Name *
        </label>
        <input
          v-model="productForm.nombre"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
          placeholder="e.g., Classic T-Shirt"
        />
      </div>

      <!-- Descripción -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-2">
          Description *
        </label>
        <textarea
          v-model="productForm.descripcion"
          required
          rows="3"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
          placeholder="Product description..."
        ></textarea>
      </div>

      <!-- Precio y Stock -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">
            Price ($) *
          </label>
          <input
            v-model.number="productForm.precio"
            type="number"
            step="0.01"
            min="0"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-900 mb-2">
            Stock *
          </label>
          <input
            v-model.number="productForm.stock"
            type="number"
            min="0"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
          />
        </div>
      </div>

      <!-- Categoría -->
<div>
  <label class="block text-sm font-medium text-gray-900 mb-2">
    Category *
  </label>
  <select
    v-model="productForm.categoria"
    required
    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
  >
    <option value="" disabled>Select a category</option>
    <option value="camisas">Camisas</option>
    <option value="pantalones">Pantalones</option>
    <option value="zapatos">Zapatos</option>
    <option value="chaquetas">Chaquetas</option>
    <option value="vestidos">Vestidos</option>
    <option value="faldas">Faldas</option>
    <option value="shorts">Shorts</option>
    <option value="accesorios">Accesorios</option>
    <option value="ropa deportiva">Ropa Deportiva</option>
    <option value="otros">Otros</option>
  </select>
</div>

      <!-- Colores -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-2">
          Colors (comma separated)
        </label>
        <input
          v-model="productForm.coloresString"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
          placeholder="e.g., Black, White, Blue"
        />
      </div>

      <!-- Tallas -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-2">
          Sizes (comma separated)
        </label>
        <input
          v-model="productForm.tallasString"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
          placeholder="e.g., S, M, L, XL"
        />
      </div>

      <!-- URL de imagen -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-2">
          Image URL *
        </label>
        <input
          v-model="productForm.imagen"
          type="url"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
          placeholder="https://example.com/image.jpg"
        />
        <!-- Preview de imagen -->
        <div v-if="productForm.imagen" class="mt-2">
          <img
            :src="productForm.imagen"
            alt="Preview"
            class="w-32 h-32 object-cover rounded-lg border border-gray-200"
            @error="handleImageError"
          />
        </div>
      </div>

<!-- Disponible -->
<div class="flex items-center">
  <input
    v-model="productForm.disponible"
    type="checkbox"
    id="disponible"
    :disabled="productForm.stock === 0"
    class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
  />
  <label for="disponible" class="ml-2 text-sm text-gray-900">
    Product available for sale
    <span v-if="productForm.stock === 0" class="text-red-600 font-medium">(No stock available)</span>
  </label>
</div>

      <!-- Botones -->
      <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          @click="closeProductModal"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="savingProduct"
          class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {{ savingProduct ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product') }}
        </button>
      </div>
    </form>
  </div>
</div>

    <!-- Modal de Confirmación de Eliminación -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeDeleteModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
        </div>
        
        <h3 class="text-lg font-bold text-gray-900 text-center mb-2">
          Delete Product
        </h3>
        
        <p class="text-sm text-gray-600 text-center mb-6">
          Are you sure you want to delete <span class="font-semibold">{{ productToDelete?.name }}</span>?
          This action cannot be undone.
        </p>

        <div class="flex justify-center space-x-3">
          <button
            @click="closeDeleteModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="deleteProduct"
            :disabled="deletingProduct"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ deletingProduct ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { 
  CubeIcon, 
  DocumentTextIcon, 
  UsersIcon, 
  Cog6ToothIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline';
import adminService from '@/services/AdminService';

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('products');
const loading = ref(true);
const showUserMenu = ref(false);
const activeProductMenu = ref(null);
const showProductModal = ref(false);
const showDeleteModal = ref(false);
const isEditMode = ref(false);
const savingProduct = ref(false);
const deletingProduct = ref(false);
const productToDelete = ref(null);

const stats = ref({
  total: 0,
  inStock: 0,
  outOfStock: 0
});
const products = ref([]);

const productMenuRefs = ref({});
const dropdownPositions = ref({});

const notification = ref({
  show: false,
  type: 'success',
  title: '',
  message: ''
});

let notificationTimeout = null;

const productForm = ref({
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  categoria: '',
  coloresString: '',
  tallasString: '',
  imagen: '',
  disponible: true
});

// Watcher para el stock
watch(() => productForm.value.stock, (newStock) => {
  if (newStock === 0) {
    productForm.value.disponible = false;
  } else if (newStock > 0 && !productForm.value.disponible) {
    productForm.value.disponible = true;
  }
});

const userAvatar = computed(() => {
  return localStorage.getItem('userAvatar') || 'https://i.pravatar.cc/150?img=1';
});

const showNotification = (type, title, message) => {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  notification.value = {
    show: true,
    type,
    title,
    message
  };

  notificationTimeout = setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const setProductMenuRef = (productId, el) => {
  if (el) {
    productMenuRefs.value[productId] = el;
  }
};

const getDropdownPosition = (productId) => {
  const position = dropdownPositions.value[productId];
  if (position === 'top') {
    return 'right-0 bottom-full mb-2';
  }
  return 'right-0 top-full';
};

const toggleProductMenu = (productId) => {
  if (activeProductMenu.value === productId) {
    activeProductMenu.value = null;
    return;
  }

  activeProductMenu.value = productId;

  nextTick(() => {
    const button = productMenuRefs.value[productId];
    if (button) {
      const rect = button.getBoundingClientRect();
      const dropdownHeight = 96;
      const spaceBelow = window.innerHeight - rect.bottom;
      
      dropdownPositions.value[productId] = spaceBelow < dropdownHeight + 20 ? 'top' : 'bottom';
    }
  });
};

const openMessages = () => {
  router.push('/admin/chat');
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/150?text=No+Image';
};

const openCreateModal = () => {
  isEditMode.value = false;
  productForm.value = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoria: '',
    coloresString: '',
    tallasString: '',
    imagen: '',
    disponible: true
  };
  showProductModal.value = true;
  activeProductMenu.value = null;
};

const openEditModal = async (product) => {
  isEditMode.value = true;
  
  try {
    const response = await adminService.getProductById(product.id);
    const fullProduct = response.data.data || response.data;
    
    const categoria = fullProduct.categoria ? String(fullProduct.categoria).trim() : '';
    
    productForm.value = {
      id: fullProduct._id,
      nombre: fullProduct.nombre || '',
      descripcion: fullProduct.descripcion || '',
      precio: fullProduct.precio || 0,
      stock: fullProduct.stock || 0,
      categoria: categoria,
      coloresString: fullProduct.colores ? fullProduct.colores.join(', ') : '',
      tallasString: fullProduct.tallas ? fullProduct.tallas.join(', ') : '',
      imagen: fullProduct.imagen || '',
      disponible: fullProduct.disponible !== undefined ? fullProduct.disponible : true
    };
    
    await nextTick();
    
    showProductModal.value = true;
    activeProductMenu.value = null;
  } catch (error) {
    console.error('Error loading product details:', error);
    showNotification('error', 'Error', 'Failed to load product details');
  }
};

const closeProductModal = () => {
  showProductModal.value = false;
  productForm.value = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoria: '',
    coloresString: '',
    tallasString: '',
    imagen: '',
    disponible: true
  };
};

const saveProduct = async () => {
  savingProduct.value = true;

  try {
    const productData = {
      nombre: productForm.value.nombre,
      descripcion: productForm.value.descripcion,
      precio: productForm.value.precio,
      stock: productForm.value.stock,
      categoria: productForm.value.categoria.toLowerCase(),
      colores: productForm.value.coloresString 
        ? productForm.value.coloresString.split(',').map(c => c.trim()) 
        : [],
      tallas: productForm.value.tallasString 
        ? productForm.value.tallasString.split(',').map(t => t.trim()) 
        : [],
      imagen: productForm.value.imagen,
      disponible: productForm.value.stock > 0 ? productForm.value.disponible : false
    };

    if (isEditMode.value) {
      await adminService.updateProduct(productForm.value.id, productData);
      showNotification('success', 'Product Updated!', `${productForm.value.nombre} has been updated successfully.`);
    } else {
      await adminService.createProduct(productData);
      showNotification('success', 'Product Created!', `${productForm.value.nombre} has been created successfully.`);
    }

    closeProductModal();
    await fetchProductData();
  } catch (error) {
    console.error('Error saving product:', error);
    showNotification('error', 'Error', error.response?.data?.message || 'Failed to save product. Please try again.');
  } finally {
    savingProduct.value = false;
  }
};

const confirmDelete = (product) => {
  productToDelete.value = product;
  showDeleteModal.value = true;
  activeProductMenu.value = null;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  productToDelete.value = null;
};

const deleteProduct = async () => {
  deletingProduct.value = true;

  try {
    await adminService.deleteProduct(productToDelete.value.id);
    showNotification('success', 'Product Deleted!', `${productToDelete.value.name} has been deleted successfully.`);
    closeDeleteModal();
    await fetchProductData();
  } catch (error) {
    console.error('Error deleting product:', error);
    showNotification('error', 'Error', error.response?.data?.message || 'Failed to delete product. Please try again.');
  } finally {
    deletingProduct.value = false;
  }
};

const handleClickOutside = (event) => {
  const dropdowns = document.querySelectorAll('.relative');
  let clickedInside = false;
  
  dropdowns.forEach(dropdown => {
    if (dropdown.contains(event.target)) {
      clickedInside = true;
    }
  });
  
  if (!clickedInside) {
    showUserMenu.value = false;
    activeProductMenu.value = null;
  }

  if (dropdown.value && !dropdown.value.contains(event.target)) {
    closeDropdown();
  }
};

const fetchProductData = async () => {
  loading.value = true;

  try {
    const [statsResponse, productsResponse] = await Promise.all([
      adminService.getProductStats(),
      adminService.getProductsTable()
    ]);

    stats.value = statsResponse.data;
    products.value = productsResponse.data;
  } catch (error) {
    console.error('Error fetching admin data:', error);
    if (error.response?.status === 403) {
      showNotification('error', 'Access Denied', 'You do not have administrator permissions.');
      router.push('/shop');
    }
  } finally {
    loading.value = false;
  }
};

const showDropdown = ref(false);
const dropdown = ref(null);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  showDropdown.value = false;
};

onMounted(async () => {
  if (!authStore.isAdmin) {
    showNotification('error', 'Access Denied', 'Only administrators can access this page.');
    router.push('/shop');
    return;
  }

  await fetchProductData();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
});
</script>