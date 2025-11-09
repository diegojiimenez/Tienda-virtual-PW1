<template>
  <div class="flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-xl font-bold text-gray-900">Messages</h2>
      <p class="text-sm text-gray-500 mt-1">Select a channel to start chatting</p>
    </div>

    <!-- Loading state -->
    <div v-if="chatStore.loading" class="p-4 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p class="text-sm text-gray-500 mt-2">Loading channels...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="chatStore.error" class="p-4 text-center">
      <p class="text-sm text-red-600">{{ chatStore.error }}</p>
      <button 
        @click="chatStore.fetchUserChats()"
        class="mt-2 text-sm text-blue-600 hover:text-blue-800"
      >
        Retry
      </button>
    </div>

    <!-- Channel List -->
    <div v-else class="flex-1 overflow-y-auto">
      <div class="p-2 space-y-1">
        <button
          v-for="chat in chatStore.sortedChats"
          :key="chat._id"
          @click="selectChannel(chat.channel)"
          class="w-full p-3 rounded-lg text-left transition-colors hover:bg-gray-50"
          :class="{
            'bg-blue-50 border border-blue-200': chatStore.currentChannel === chat.channel,
            'bg-white': chatStore.currentChannel !== chat.channel
          }"
        >
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center space-x-2">
              <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <component :is="getChannelIcon(chat.channel)" class="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900">{{ chat.channelName }}</h3>
                <p class="text-xs text-gray-500">{{ formatChannelDescription(chat.channel) }}</p>
              </div>
            </div>
            <span
              v-if="chatStore.getChannelUnread(chat.channel) > 0"
              class="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full"
            >
              {{ chatStore.getChannelUnread(chat.channel) }}
            </span>
          </div>
          
          <p 
            v-if="chat.messages && chat.messages.length > 0" 
            class="text-sm text-gray-600 truncate"
          >
            {{ chat.messages[chat.messages.length - 1].content }}
          </p>
          <p v-else class="text-sm text-gray-400 italic">No messages yet</p>
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="chatStore.chats.length === 0" class="p-4 text-center">
        <ChatBubbleLeftRightIcon class="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p class="text-sm text-gray-500">No channels available</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useChatStore } from '@/stores/chat';
import { 
  ShoppingBagIcon, 
  ChatBubbleLeftRightIcon, 
  UserCircleIcon, 
  TruckIcon 
} from '@heroicons/vue/24/outline';

const chatStore = useChatStore();

const channelIcons = {
  'orders': ShoppingBagIcon,
  'customer-support': ChatBubbleLeftRightIcon,
  'admin': UserCircleIcon,
  'shipping': TruckIcon
};

const channelDescriptions = {
  'orders': 'Questions about your orders',
  'customer-support': 'General support',
  'admin': 'Contact administration',
  'shipping': 'Delivery inquiries'
};

const getChannelIcon = (channel) => {
  return channelIcons[channel] || ChatBubbleLeftRightIcon;
};

const formatChannelDescription = (channel) => {
  return channelDescriptions[channel] || '';
};

const selectChannel = (channel) => {
  console.log('Selecting channel:', channel); // Para debug
  chatStore.selectChannel(channel);
};
</script>