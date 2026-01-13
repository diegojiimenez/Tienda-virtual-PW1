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
            <router-link to="/admin" class="text-gray-900 font-medium">Admin</router-link>
          </div>

          <!-- Iconos de usuario -->
          <div class="flex items-center space-x-4">
            <!-- Dropdown del usuario -->
            <div class="relative" ref="dropdown">
              <button
                @click="showDropdown = !showDropdown"
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

          <!-- Vista de Órdenes -->
          <div v-else-if="activeTab === 'orders'" class="space-y-6">
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Orders</h1>
                <p class="text-sm text-gray-600 mt-1">Manage customer orders</p>
              </div>
            </div>

            <!-- Filtros de órdenes -->
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="flex gap-2">
                <button
                  @click="selectedOrderFilter = 'all'"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="{
                    'bg-primary text-white': selectedOrderFilter === 'all',
                    'bg-gray-100 text-gray-900': selectedOrderFilter !== 'all'
                  }"
                >
                  all
                </button>
                <button
                  @click="selectedOrderFilter = 'en-curso'"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="{
                    'bg-primary text-white': selectedOrderFilter === 'en-curso',
                    'bg-gray-100 text-gray-900': selectedOrderFilter !== 'en-curso'
                  }"
                >
                  In Progress
                </button>
                <button
                  @click="selectedOrderFilter = 'completada'"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="{
                    'bg-primary text-white': selectedOrderFilter === 'completada',
                    'bg-gray-100 text-gray-900': selectedOrderFilter !== 'completada'
                  }"
                >
                  Completed
                </button>
                <button
                  @click="selectedOrderFilter = 'cancelada'"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="{
                    'bg-primary text-white': selectedOrderFilter === 'cancelada',
                    'bg-gray-100 text-gray-900': selectedOrderFilter !== 'cancelada'
                  }"
                >
                  Canceled
                </button>
              </div>
            </div>

            <!-- Estadísticas de órdenes -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <h3 class="text-sm font-medium text-gray-600 mb-2">Total Orders</h3>
                <p class="text-3xl font-bold text-gray-900">{{ orderStats.total }}</p>
              </div>

              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <h3 class="text-sm font-medium text-gray-600 mb-2">In Progress</h3>
                <p class="text-3xl font-bold text-gray-900">{{ orderStats.inProgress }}</p>
              </div>

              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <h3 class="text-sm font-medium text-gray-600 mb-2">Completed</h3>
                <p class="text-3xl font-bold text-gray-900">{{ orderStats.completed }}</p>
              </div>

              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <h3 class="text-sm font-medium text-gray-600 mb-2">Canceled</h3>
                <p class="text-3xl font-bold text-gray-900">{{ orderStats.canceled }}</p>
              </div>
            </div>

            <!-- Tabla de órdenes -->
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div class="p-6 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900">Orders List</h2>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th class="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-if="filteredAdminOrders.length === 0">
                      <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        No orders found
                      </td>
                    </tr>
                    <tr v-for="order in filteredAdminOrders" :key="order.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                        {{ order.numeroOrden }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                        {{ order.usuario?.nombre }} {{ order.usuario?.apellido }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center">
                        <span 
                          class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          :class="getOrderStatusClass(order.estado)"
                        >
                          {{ getOrderStatusText(order.estado) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        ${{ order.total.toFixed(2) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                        {{ formatDate(order.fechaOrden) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center">
                        <button @click="viewOrderDetail(order)"
                          class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                          <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                            </path>
                          </svg>
                          View Details
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Vista de Usuarios -->
          <div v-else-if="activeTab === 'users'" class="space-y-6">
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Users Management</h1>
                <p class="text-sm text-gray-600 mt-1">Manage system users</p>
              </div>
              
              <button
                @click="openCreateUserModal"
                class="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <PlusIcon class="h-5 w-5 mr-2" />
                Add User
              </button>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-600 mb-1">Total Users</h3>
                    <p class="text-2xl font-bold text-gray-900">{{ userStats.total }}</p>
                  </div>
                  <UsersIcon class="h-10 w-10 text-gray-400" />
                </div>
              </div>

              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-600 mb-1">Active</h3>
                    <p class="text-2xl font-bold text-green-600">{{ userStats.active }}</p>
                  </div>
                  <CheckCircleIcon class="h-10 w-10 text-green-400" />
                </div>
              </div>

              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-600 mb-1">Inactive</h3>
                    <p class="text-2xl font-bold text-red-600">{{ userStats.inactive }}</p>
                  </div>
                  <XCircleIcon class="h-10 w-10 text-red-400" />
                </div>
              </div>

              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-600 mb-1">Admins</h3>
                    <p class="text-2xl font-bold text-purple-600">{{ userStats.admins }}</p>
                  </div>
                  <div class="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-600 mb-1">Users</h3>
                    <p class="text-2xl font-bold text-blue-600">{{ userStats.regular }}</p>
                  </div>
                  <div class="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Filter Tabs -->
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="border-b border-gray-200">
                <nav class="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    @click="selectedUserFilter = 'all'"
                    :class="[
                      selectedUserFilter === 'all'
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                      'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
                    ]"
                  >
                    All Users
                    <span
                      :class="[
                        selectedUserFilter === 'all'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-200 text-gray-700',
                        'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium'
                      ]"
                    >
                      {{ userStats.total }}
                    </span>
                  </button>
                  <button
                    @click="selectedUserFilter = 'active'"
                    :class="[
                      selectedUserFilter === 'active'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                      'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
                    ]"
                  >
                    Active
                    <span
                      :class="[
                        selectedUserFilter === 'active'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700',
                        'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium'
                      ]"
                    >
                      {{ userStats.active }}
                    </span>
                  </button>
                  <button
                    @click="selectedUserFilter = 'inactive'"
                    :class="[
                      selectedUserFilter === 'inactive'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                      'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
                    ]"
                  >
                    Inactive
                    <span
                      :class="[
                        selectedUserFilter === 'inactive'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700',
                        'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium'
                      ]"
                    >
                      {{ userStats.inactive }}
                    </span>
                  </button>
                  <button
                    @click="selectedUserFilter = 'admin'"
                    :class="[
                      selectedUserFilter === 'admin'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                      'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
                    ]"
                  >
                    Admins
                    <span
                      :class="[
                        selectedUserFilter === 'admin'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 text-gray-700',
                        'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium'
                      ]"
                    >
                      {{ userStats.admins }}
                    </span>
                  </button>
                </nav>
              </div>

              <!-- Users Table con anchos fijos -->
              <div class="overflow-x-auto">
                <table class="w-full table-fixed">
                  <colgroup>
                    <col class="w-[30%]">  <!-- User column -->
                    <col class="w-[30%]">  <!-- Email column -->
                    <col class="w-[10%]">  <!-- Role column -->
                    <col class="w-[13%]">  <!-- Status column -->
                    <col class="w-[35%]">  <!-- Created column -->
                    <col class="w-[15%]">   <!-- Actions column -->
                  </colgroup>
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th class="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-if="filteredUsers.length === 0">
                      <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                    <tr v-for="user in filteredUsers" :key="user._id" class="hover:bg-gray-50">
                      <td class="px-6 py-4">
                        <div class="flex items-center">
                          <div class="h-10 w-10 flex-shrink-0">
                            <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span class="text-sm font-medium text-gray-700">
                                {{ user.nombre?.charAt(0).toUpperCase() }}{{ user.apellido?.charAt(0).toUpperCase() }}
                              </span>
                            </div>
                          </div>
                          <div class="ml-4 truncate">
                            <div class="text-sm font-medium text-gray-900 truncate">
                              {{ user.nombre }} {{ user.apellido }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm text-gray-600 truncate">
                          {{ user.email }}
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span
                          :class="[
                            'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                            getRoleBadge(user.rol)
                          ]"
                        >
                          {{ getRoleText(user.rol) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span
                          :class="[
                            'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                            getUserStatusBadge(user)
                          ]"
                        >
                          {{ getUserStatusText(user) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm text-gray-500 truncate">
                          {{ formatDate(user.createdAt) }}
                        </div>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <button
                          v-if="user.activo && user._id !== authStore.user?._id"
                          @click="confirmDeleteUser(user)"
                          class="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Deactivate
                        </button>
                        <span v-else-if="user._id === authStore.user?._id" class="text-gray-400 text-sm">
                          You
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Vista de Configuración (placeholder) -->
          <div v-else-if="activeTab === 'settings'" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p class="text-gray-600">Settings - Coming soon</p>
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

    <!-- Modal de Detalle de Orden -->
    <div
      v-if="showOrderDetailModal && selectedOrder"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeOrderDetailModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">
            Order Details - {{ selectedOrder.numeroOrden }}
          </h2>
        </div>

        <div class="p-6 space-y-4">
          <!-- Información de la orden -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-medium text-gray-900 mb-2">Customer Information</h3>
              <p class="text-sm text-gray-600">
                <span class="font-semibold">Name:</span> {{ selectedOrder.usuario?.nombre }} {{ selectedOrder.usuario?.apellido }}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-semibold">Email:</span> {{ selectedOrder.usuario?.email }}
              </p>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-900 mb-2">Order Information</h3>
              <p class="text-sm text-gray-600">
                <span class="font-semibold">Order ID:</span> {{ selectedOrder.numeroOrden }}
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-semibold">Status:</span> 
                <span :class="getOrderStatusClass(selectedOrder.estado)" class="ml-1 px-2 py-0.5 rounded-full text-xs">
                  {{ getOrderStatusText(selectedOrder.estado) }}
                </span>
              </p>
              <p class="text-sm text-gray-600">
                <span class="font-semibold">Date:</span> {{ formatDate(selectedOrder.fechaOrden) }}
              </p>
            </div>
          </div>

          <!-- Productos de la orden -->
          <div>
            <h3 class="text-sm font-medium text-gray-900 mb-2">Ordered Products</h3>
            <div class="space-y-2">
              <div
                v-for="item in selectedOrder.items"
                :key="item.id"
                class="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <img 
                      v-if="item.imagen" 
                      :src="item.imagen" 
                      :alt="item.nombre"
                      class="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p class="text-sm font-semibold text-gray-900">{{ item.nombre }}</p>
                      <p class="text-xs text-gray-600">
                        Quantity: {{ item.cantidad }} | 
                        <span v-if="item.talla">Size: {{ item.talla }} | </span>
                        <span v-if="item.color">Color: {{ item.color }}</span>
                      </p>
                      <p class="text-xs text-gray-500 mt-1">
                        ${{ item.precioUnitario.toFixed(2) }} each
                      </p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-gray-900">
                      ${{ (item.precioUnitario * item.cantidad).toFixed(2) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen -->
          <div class="border-t border-gray-200 pt-4">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-600">Subtotal:</span>
              <span class="text-gray-900">${{ selectedOrder.subtotal?.toFixed(2) || '0.00' }}</span>
            </div>
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-600">Taxes:</span>
              <span class="text-gray-900">${{ selectedOrder.impuestos?.toFixed(2) || '0.00' }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span class="text-gray-900">Total:</span>
              <span class="text-gray-900">${{ selectedOrder.total.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Motivo de cancelación si existe -->
          <div v-if="selectedOrder.estado === 'cancelada' && selectedOrder.motivoCancelacion" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-red-900 mb-1">Cancellation Reason:</h4>
            <p class="text-sm text-red-700">{{ selectedOrder.motivoCancelacion }}</p>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-end gap-2 border-t border-gray-200 pt-4">
            <button
              v-if="selectedOrder.estado === 'en-curso'"
              @click="handleCompleteOrder(selectedOrder.id)"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircleIcon class="h-5 w-5 mr-2" />
              Complete Order
            </button>
            <button
              v-if="selectedOrder.estado === 'en-curso'"
              @click="handleCancelOrderAdmin(selectedOrder.id)"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircleIcon class="h-5 w-5 mr-2" />
              Cancel Order
            </button>
            <button
              @click="closeOrderDetailModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Crear Usuario -->
    <div
      v-if="showUserModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeUserModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Create New User</h3>
        </div>

        <div class="p-6 space-y-4">
          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              First Name *
            </label>
            <input
              v-model="userForm.nombre"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="John"
            />
          </div>

          <!-- Apellido -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Last Name *
            </label>
            <input
              v-model="userForm.apellido"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="Doe"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Email *
            </label>
            <input
              v-model="userForm.email"
              type="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="john.doe@example.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Password *
            </label>
            <input
              v-model="userForm.password"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
              placeholder="Minimum 6 characters"
            />
          </div>

          <!-- Rol -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Role *
            </label>
            <select
              v-model="userForm.rol"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white"
            >
              <option value="usuario">User</option>
              <option value="administrador">Administrator</option>
            </select>
          </div>

          <!-- Estado Activo -->
          <div class="flex items-center">
            <input
              v-model="userForm.activo"
              type="checkbox"
              id="activo"
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label for="activo" class="ml-2 block text-sm text-gray-900">
              Active User
            </label>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 flex gap-3">
          <button
            @click="closeUserModal"
            class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveUser"
            :disabled="savingUser"
            class="flex-1 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ savingUser ? 'Creating...' : 'Create User' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Cancelación de Orden (Admin) -->
    <div
      v-if="showCancelOrderModal && orderToCancel"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeCancelOrderModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <!-- Icono de advertencia -->
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>

          <h3 class="text-lg font-bold text-gray-900 text-center mb-2">
            Cancel Order?
          </h3>

          <p class="text-sm text-gray-600 text-center mb-4">
            You are about to cancel order <span class="font-semibold">{{ orderToCancel?.numeroOrden }}</span>. Stock will be restored automatically.
          </p>

          <!-- Campo de razón -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Reason for cancellation *
            </label>
            <textarea
              v-model="cancelReason"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 resize-none"
              placeholder="e.g., Customer request, out of stock, payment issue..."
            ></textarea>
          </div>

          <!-- Botones -->
          <div class="flex gap-3">
            <button
              @click="closeCancelOrderModal"
              class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Keep Order
            </button>
            <button
              @click="confirmCancelOrderAdmin"
              :disabled="cancelingOrder || !cancelReason.trim()"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ cancelingOrder ? 'Canceling...' : 'Cancel Order' }}
            </button>
          </div>
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
  ChevronDownIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline';
import adminService from '@/services/AdminService';
import adminUserService from '@/services/AdminUserService'
import { useAdminOrderStore } from '@/stores/adminOrder'
import { useConfirm } from '@/composables/useConfirm'

const router = useRouter();
const authStore = useAuthStore();
const adminOrderStore = useAdminOrderStore()
const { confirm } = useConfirm()

// Estados generales
const activeTab = ref('products');
const loading = ref(true);
const showDropdown = ref(false);

// Estados para productos
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

// Estados para órdenes
const orderStats = ref({
  total: 0,
  inProgress: 0,
  completed: 0,
  canceled: 0
})
const selectedOrderFilter = ref('all')
const showOrderDetailModal = ref(false)
const selectedOrder = ref(null)
const showCancelOrderModal = ref(false)  // ← AGREGAR
const orderToCancel = ref(null)  // ← AGREGAR
const cancelReason = ref('')  // ← AGREGAR
const cancelingOrder = ref(false)  // ← AGREGAR

// Estados para usuarios
const userStats = ref({
  total: 0,
  active: 0,
  inactive: 0,
  admins: 0,
  regular: 0
})
const users = ref([])
const selectedUserFilter = ref('all')
const showUserModal = ref(false)
const userForm = ref({
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  rol: 'usuario',
  activo: true
})
const savingUser = ref(false)

// Notificaciones
const notification = ref({
  show: false,
  type: 'success',
  title: '',
  message: ''
});
let notificationTimeout = null;

// Computeds
const filteredAdminOrders = computed(() => {
  if (selectedOrderFilter.value === 'all') {
    return adminOrderStore.orders
  }
  return adminOrderStore.orders.filter(order => order.estado === selectedOrderFilter.value)
})

const filteredUsers = computed(() => {
  if (selectedUserFilter.value === 'all') {
    return users.value
  }
  if (selectedUserFilter.value === 'active') {
    return users.value.filter(user => user.activo)
  }
  if (selectedUserFilter.value === 'inactive') {
    return users.value.filter(user => !user.activo)
  }
  if (selectedUserFilter.value === 'admin') {
    return users.value.filter(user => user.rol === 'administrador')
  }
  return users.value
})

// Watchers
watch(() => productForm.value.stock, (newStock) => {
  if (newStock === 0) {
    productForm.value.disponible = false;
  } else if (newStock > 0 && !productForm.value.disponible) {
    productForm.value.disponible = true;
  }
});

// Métodos generales
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

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/150?text=No+Image';
};

const handleClickOutside = (event) => {
  const dropdown = document.querySelector('[ref="dropdown"]')
  if (dropdown && !dropdown.contains(event.target)) {
    showDropdown.value = false
  }
  
  const productMenu = document.querySelector('.relative.inline-block.text-left')
  if (productMenu && !productMenu.contains(event.target)) {
    activeProductMenu.value = null
  }
}

// ==================== PRODUCTOS ====================
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

const fetchProductData = async () => {
  loading.value = true;
  try {
    const statsResponse = await adminService.getProductStats();
    const tableResponse = await adminService.getProductsTable();
    
    stats.value = statsResponse.data;
    products.value = tableResponse.data;
    
    console.log('✅ Products loaded:', products.value.length);
  } catch (error) {
    console.error('❌ Error loading products:', error);
    showNotification('error', 'Error', 'Failed to load products');
  } finally {
    loading.value = false;
  }
};

// ==================== ÓRDENES ====================
const fetchOrderData = async () => {
  try {
    await adminOrderStore.fetchOrders()
    
    orderStats.value = {
      total: adminOrderStore.totalOrders,
      inProgress: adminOrderStore.ordersInProgress.length,
      completed: adminOrderStore.completedOrders.length,
      canceled: adminOrderStore.canceledOrders.length
    }
    
    console.log('✅ Orders loaded:', adminOrderStore.orders.length);
  } catch (error) {
    console.error('❌ Error loading orders:', error);
    showNotification('error', 'Error', 'Failed to load orders');
  }
}

const viewOrderDetail = async (order) => {
  selectedOrder.value = order
  showOrderDetailModal.value = true
}

const closeOrderDetailModal = () => {
  showOrderDetailModal.value = false
  selectedOrder.value = null
}

const handleCompleteOrder = async (orderId) => {
  try {
    await confirm({
      title: 'Complete Order?',
      message: 'Are you sure you want to mark this order as completed?',
      confirmText: 'Complete Order',
      cancelText: 'Cancel',
      type: 'success'
    })
    
    await adminOrderStore.completeOrder(orderId)
    
    showNotification('success', 'Order Completed!', 'The order has been marked as completed.')
    
    if (showOrderDetailModal.value && selectedOrder.value) {
      selectedOrder.value = adminOrderStore.currentOrder
    }
    
    await fetchOrderData()
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      return
    }
    showNotification('error', 'Error', error?.message || 'Failed to complete order')
  }
}

const handleCancelOrderAdmin = async (orderId) => {
  orderToCancel.value = selectedOrder.value || adminOrderStore.orders.find(o => o.id === orderId)
  cancelReason.value = ''
  showCancelOrderModal.value = true
}

const confirmCancelOrderAdmin = async () => {
  if (!orderToCancel.value || !cancelReason.value.trim()) {
    showNotification('error', 'Error', 'Please provide a cancellation reason')
    return
  }

  cancelingOrder.value = true

  try {
    await adminOrderStore.cancelOrder(orderToCancel.value.id, cancelReason.value)
    
    showNotification('success', 'Order Canceled!', 'The order has been canceled and stock restored.')
    
    // Cerrar modales
    showCancelOrderModal.value = false
    if (showOrderDetailModal.value) {
      closeOrderDetailModal()
    }
    
    await fetchOrderData()
  } catch (error) {
    showNotification('error', 'Error', error?.message || 'Failed to cancel order')
  } finally {
    cancelingOrder.value = false
    orderToCancel.value = null
    cancelReason.value = ''
  }
}

const closeCancelOrderModal = () => {
  showCancelOrderModal.value = false
  orderToCancel.value = null
  cancelReason.value = ''
}

const getOrderStatusClass = (estado) => {
  switch (estado) {
    case 'en-curso':
      return 'bg-blue-100 text-blue-800'
    case 'completada':
      return 'bg-green-100 text-green-800'
    case 'cancelada':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getOrderStatusText = (estado) => {
 
  switch (estado) {
    case 'all':
      return 'all'
    case 'en-curso':
      return 'In Progress'
    case 'completada':
      return 'Completed'
    case 'cancelada':
      return 'Canceled'
    default:
      return estado
  }
}

// ==================== USUARIOS ====================
const fetchUserData = async () => {
  try {
    const [statsResponse, usersResponse] = await Promise.all([
      adminUserService.getUserStats(),
      adminUserService.getAllUsers()
    ])
    
    userStats.value = statsResponse.data
    users.value = usersResponse.data
    
    console.log('✅ Users loaded:', users.value.length)
  } catch (error) {
    console.error('❌ Error loading users:', error)
    showNotification('error', 'Error', 'Failed to load users')
  }
}

const openCreateUserModal = () => {
  userForm.value = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'usuario',
    activo: true
  }
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  userForm.value = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'usuario',
    activo: true
  }
}

const saveUser = async () => {
  if (!userForm.value.nombre || !userForm.value.apellido || !userForm.value.email || !userForm.value.password) {
    showNotification('error', 'Error', 'Please fill all required fields')
    return
  }

  if (userForm.value.password.length < 6) {
    showNotification('error', 'Error', 'Password must be at least 6 characters')
    return
  }

  savingUser.value = true

  try {
    await adminUserService.createUser(userForm.value)
    
    await fetchUserData()
    
    showNotification('success', 'User Created!', `User ${userForm.value.nombre} has been created successfully.`)
    
    closeUserModal()
  } catch (error) {
    showNotification('error', 'Error', error.response?.data?.message || 'Failed to create user')
  } finally {
    savingUser.value = false
  }
}

const confirmDeleteUser = async (user) => {
  try {
    await confirm({
      title: 'Deactivate User?',
      message: `Are you sure you want to deactivate ${user.nombre} ${user.apellido}? They will no longer be able to access the system.`,
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
      type: 'danger'
    })
    
    await adminUserService.deleteUser(user._id)
    
    await fetchUserData()
    
    showNotification('success', 'User Deactivated!', `${user.nombre} ${user.apellido} has been deactivated.`)
  } catch (error) {
    if (error?.message) {
      showNotification('error', 'Error', error.response?.data?.message || error.message)
    }
  }
}

const getUserStatusBadge = (user) => {
  if (!user.activo) {
    return 'bg-red-100 text-red-800'
  }
  return 'bg-green-100 text-green-800'
}

const getUserStatusText = (user) => {
  return user.activo ? 'Active' : 'Inactive'
}

const getRoleBadge = (rol) => {
  return rol === 'administrador' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
}

const getRoleText = (rol) => {
  return rol === 'administrador' ? 'Admin' : 'User'
}

// ==================== LIFECYCLE ====================
onMounted(async () => {
  if (!authStore.isAdmin) {
    showNotification('error', 'Access Denied', 'Only administrators can access this page.');
    router.push('/shop');
    return;
  }

  await fetchProductData();
  await fetchOrderData();
  await fetchUserData();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
});
</script>