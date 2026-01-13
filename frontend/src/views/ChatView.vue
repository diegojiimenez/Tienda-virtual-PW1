<template>
  <div class="h-screen bg-gray-50 flex flex-col">
    <!-- Navbar -->
    <div class="flex-shrink-0">
      <Navbar />
    </div>

    <!-- Chat Container -->
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

      <!-- Main Chat Area - Estructura igual que AdminChatView -->
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
import Navbar from '@/components/Navbar.vue';  // ✅ AGREGAR
import { 
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon,
  CalendarIcon,
  UserCircleIcon,
  TruckIcon
} from '@heroicons/vue/24/outline';

const router = useRouter();
const chatStore = useChatStore();
const authStore = useAuthStore();

const channelTitles = {
  'orders': 'Support',
  'customer-support': 'Support',
  'admin': 'Admin',
  'shipping': 'Support'
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

onMounted(async () => {
  chatStore.initializeSocket();
  await chatStore.fetchUserChats();
});

onUnmounted(() => {
  chatStore.leaveChannel();
});
</script>
