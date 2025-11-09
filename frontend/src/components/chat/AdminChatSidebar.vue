<template>
    <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">All Chats</h2>
        <p class="text-sm text-gray-500 mt-1">Manage user conversations</p>
      </div>
  
      <!-- Filters -->
      <div class="p-4 border-b border-gray-200 space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Channel</label>
          <select
            v-model="selectedChannel"
            @change="filterChats"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Channels</option>
            <option value="orders">Orders</option>
            <option value="customer-support">Customer Support</option>
            <option value="admin">Admin</option>
            <option value="shipping">Shipping</option>
          </select>
        </div>
  
        <!-- <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="selectedStatus"
            @change="filterChats"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div> -->
      </div>
  
      <!-- Chat List -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-2 space-y-1">
          <button
            v-for="chat in filteredChats"
            :key="chat._id"
            @click="selectChat(chat)"
            class="w-full p-3 rounded-lg text-left transition-colors hover:bg-gray-50"
            :class="{
              'bg-blue-50 border border-blue-200': currentChatId === chat._id,
              'bg-white': currentChatId !== chat._id
            }"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span class="text-xs font-medium text-gray-700">
                    {{ chat.user?.nombre?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900 text-sm">
                    {{ chat.user?.nombre }} {{ chat.user?.apellido }}
                  </h3>
                  <p class="text-xs text-gray-500">{{ chat.channelName }}</p>
                </div>
              </div>
              <div class="flex flex-col items-end space-y-1">
                <span
                  v-if="chat.unreadCount.admin > 0"
                  class="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full"
                >
                  {{ chat.unreadCount.admin }}
                </span>
                <!-- <span
                  class="px-2 py-0.5 text-xs rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': chat.status === 'active',
                    'bg-gray-100 text-gray-600': chat.status === 'closed'
                  }"
                >
                  {{ chat.status }}
                </span> -->
              </div>
            </div>
  
            <p 
              v-if="chat.messages.length > 0"
              class="text-sm text-gray-600 truncate"
            >
              {{ chat.messages[chat.messages.length - 1].content }}
            </p>
            <p v-else class="text-sm text-gray-400 italic">No messages yet</p>
  
            <p class="text-xs text-gray-400 mt-1">
              {{ formatTime(chat.lastMessage) }}
            </p>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import ChatService from '@/services/ChatService';
  
  const emit = defineEmits(['select-chat']);
  
  const allChats = ref([]);
  const selectedChannel = ref('');
  const selectedStatus = ref('');
  const currentChatId = ref(null);
  
  const filteredChats = computed(() => {
    return allChats.value.filter(chat => {
      const channelMatch = !selectedChannel.value || chat.channel === selectedChannel.value;
      const statusMatch = !selectedStatus.value || chat.status === selectedStatus.value;
      return channelMatch && statusMatch;
    });
  });
  
  const filterChats = async () => {
    try {
      const filters = {};
      if (selectedChannel.value) filters.channel = selectedChannel.value;
      if (selectedStatus.value) filters.status = selectedStatus.value;
  
      const response = await ChatService.getAllChats(filters);
      allChats.value = response.data;
    } catch (error) {
      console.error('Error filtering chats:', error);
    }
  };
  
  const selectChat = (chat) => {
    currentChatId.value = chat._id;
    emit('select-chat', chat);
  };
  
  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
  
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
  };
  
  onMounted(async () => {
    await filterChats();
  });
  
  defineExpose({
    refreshChats: filterChats
  });
  </script>