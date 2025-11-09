<template>
  <div class="h-screen bg-gray-50 flex flex-col">
    <!-- Navbar -->
    <nav class="bg-white border-b border-gray-200 flex-shrink-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/shop" class="flex items-center space-x-2">
            <span class="text-2xl">🛍️</span>
            <span class="text-xl font-bold text-gray-900">FashionDiego</span>
          </router-link>

          <!-- Navigation -->
          <div class="hidden md:flex items-center space-x-8">
            <router-link to="/shop" class="text-gray-600 hover:text-gray-900">Shop</router-link>
            <router-link to="/new-arrivals" class="text-gray-600 hover:text-gray-900">New Arrivals</router-link>
            <router-link to="/men" class="text-gray-600 hover:text-gray-900">Men</router-link>
            <router-link to="/women" class="text-gray-600 hover:text-gray-900">Women</router-link>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <!-- Botón de mensajes -->
            <button 
              @click="$router.push('/chat')"
              class="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <ChatBubbleLeftRightIcon class="w-6 h-6" />
              <span 
                v-if="chatStore.totalUnreadMessages > 0"
                class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full"
              >
                {{ chatStore.totalUnreadMessages }}
              </span>
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

    <!-- Chat Container - 🔥 Ajustado igual que AdminChatView -->
    <div class="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <!-- Sidebar -->
      <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-200 flex-shrink-0">
          <h1 class="text-2xl font-bold text-gray-900">Chat Details</h1>
        </div>

        <!-- Channel Details (cuando hay un chat seleccionado) -->
        <div v-if="chatStore.currentChat" class="p-4 space-y-4 flex-shrink-0 overflow-y-auto">
          <!-- Order Inquiry -->
          <div v-if="chatStore.currentChannel === 'orders'" class="flex items-start space-x-3">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <ShoppingBagIcon class="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Order Inquiry</h3>
              <p class="text-sm text-gray-500">Order #123456789</p>
            </div>
          </div>

          <!-- Department -->
          <div v-if="chatStore.currentChannel === 'customer-support'" class="flex items-start space-x-3">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <ChatBubbleLeftRightIcon class="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Department</h3>
              <p class="text-sm text-gray-500">Customer Support</p>
            </div>
          </div>

          <!-- Admin -->
          <div v-if="chatStore.currentChannel === 'admin'" class="flex items-start space-x-3">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <UserCircleIcon class="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Admin Contact</h3>
              <p class="text-sm text-gray-500">Direct contact with administration</p>
            </div>
          </div>

          <!-- Shipping -->
          <div v-if="chatStore.currentChannel === 'shipping'" class="flex items-start space-x-3">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <TruckIcon class="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Shipping</h3>
              <p class="text-sm text-gray-500">Delivery inquiries</p>
            </div>
          </div>

          <!-- User Info -->
          <div class="flex items-start space-x-3">
            <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
              <span class="text-sm font-medium text-gray-700">
                {{ authStore.user?.nombre?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">User</h3>
              <p class="text-sm text-gray-500">{{ authStore.user?.nombre }} {{ authStore.user?.apellido }}</p>
            </div>
          </div>

          <!-- Started -->
          <div class="flex items-start space-x-3">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <CalendarIcon class="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900">Started</h3>
              <p class="text-sm text-gray-500">{{ formatDate(chatStore.currentChat.createdAt) }}</p>
            </div>
          </div>

          <!-- End Chat Button -->
          <button
            @click="closeChat"
            class="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            End Chat
          </button>
        </div>

        <!-- Channel List (cuando no hay chat seleccionado) -->
        <div v-else class="p-4 flex-shrink-0">
          <p class="text-sm text-gray-500 text-center">Select a channel to view details</p>
        </div>

        <div class="border-t border-gray-200 mt-4"></div>

        <!-- Channels -->
        <div class="flex-1 overflow-y-auto min-h-0">
          <ChatSidebar />
        </div>
      </div>

      <!-- Main Chat Area - 🔥 Estructura igual que AdminChatView -->
      <div class="flex-1 flex flex-col min-h-0 min-w-0">
        <!-- Chat Header -->
        <div v-if="chatStore.currentChat" class="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">
              Chat with {{ getChannelTitle(chatStore.currentChannel) }}
            </h2>
          </div>
        </div>

        <!-- Messages Area -->
        <ChatMessages />

        <!-- Input Area -->
        <ChatInput />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import ChatSidebar from '@/components/chat/ChatSidebar.vue';
import ChatMessages from '@/components/chat/ChatMessages.vue';
import ChatInput from '@/components/chat/ChatInput.vue';
import { 
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon,
  CalendarIcon,
  UserCircleIcon,
  TruckIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline';

const router = useRouter();
const chatStore = useChatStore();
const authStore = useAuthStore();

// Dropdown state
const showDropdown = ref(false);
const dropdown = ref(null);

const channelTitles = {
  'orders': 'Support',
  'customer-support': 'Support',
  'admin': 'Admin',
  'shipping': 'Support'
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  showDropdown.value = false;
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    closeDropdown();
  }
};

const getChannelTitle = (channel) => {
  return channelTitles[channel] || 'Support';
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const closeChat = async () => {
  if (confirm('Are you sure you want to end this chat?')) {
    try {
      await chatStore.closeChat(chatStore.currentChannel);
      chatStore.leaveChannel();
      router.push('/shop');
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  }
};

const logout = () => {
  authStore.logout();
  router.push('/login');
  closeDropdown();
};

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  chatStore.initializeSocket();
  await chatStore.fetchUserChats();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  chatStore.leaveChannel();
});
</script>