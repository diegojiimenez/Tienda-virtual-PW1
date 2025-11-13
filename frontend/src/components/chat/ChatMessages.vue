<template>
  <div class="flex-1 flex flex-col bg-gray-50 min-h-0">
    <!-- Header -->
    <div v-if="chatStore.currentChat" class="bg-white border-b border-gray-200 p-4 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <component :is="getChannelIcon(chatStore.currentChannel)" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">{{ chatStore.currentChat.channelName }}</h3>
            <p class="text-sm text-gray-500">{{ formatChannelDescription(chatStore.currentChannel) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!chatStore.currentChat" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <ChatBubbleLeftRightIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Select a channel</h3>
        <p class="text-gray-500">Choose a channel from the sidebar to start chatting</p>
      </div>
    </div>

    <!-- Messages -->
    <div 
      v-else 
      ref="messagesContainer" 
      class="flex-1 overflow-y-auto p-6 space-y-4"
      style="height: calc(100vh - 280px); max-height: calc(100vh - 300px);"
    >
      <!-- Welcome message -->
      <div v-if="messages.length === 0" class="text-center text-gray-500 mt-8">
        <p class="text-lg">No messages yet</p>
        <p class="text-sm mt-2">Start a conversation!</p>
      </div>

      <!-- Messages list -->
      <div v-for="message in messages" :key="message._id" class="flex" :class="message.senderType === 'user' ? 'justify-end' : 'justify-start'">
        <div class="max-w-xs lg:max-w-md">
          <div :class="[
            'rounded-lg px-4 py-2',
            message.senderType === 'user'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-900'
          ]">
            <p class="text-sm break-words">{{ message.content }}</p>
            <p class="text-xs mt-1 opacity-75">
              {{ new Date(message.createdAt).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) }}
            </p>
          </div>
          <p class="text-xs text-gray-500 mt-1 px-1">
            {{ message.senderType === 'user' ? 'You' : 'Admin' }}
          </p>
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="isTyping" class="flex justify-start">
        <div class="bg-gray-200 rounded-lg px-4 py-2">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import { 
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  TruckIcon
} from '@heroicons/vue/24/outline';

const chatStore = useChatStore();
const authStore = useAuthStore();
const messagesContainer = ref(null);

const channelIcons = {
  'orders': ShoppingBagIcon,
  'customer-support': ChatBubbleLeftRightIcon,
  'admin': UserCircleIcon,
  'shipping': TruckIcon
};

const channelDescriptions = {
  'orders': 'Order Support',
  'customer-support': 'Customer Support',
  'admin': 'Admin Contact',
  'shipping': 'Shipping Inquiries'
};

const messages = computed(() => chatStore.currentChat?.messages || []);


const isTyping = computed(() => {
  if (!chatStore.currentChannel) return false;
  const myId = authStore.user?._id || authStore.user?.id;
  
  // Buscar usuarios que están escribiendo en este canal
  // PERO que NO sean yo
  for (let [key, userName] of chatStore.typingUsers.entries()) {
    const [userId, channel] = key.split(':');
    
    // Si el canal coincide Y el usuario NO soy yo Y no es 'admin' (ya que admin se muestra en ChatInput)
    if (channel === chatStore.currentChannel && userId !== myId && userId !== 'admin') {
      return true;
    }
  }
  
  return false;
});

const isMyMessage = (message) => {
  const myUserId = authStore.user?._id || authStore.user?.id;
  const senderId = message.sender?._id || message.sender?.id;
  
  console.log('My ID:', myUserId, 'Sender ID:', senderId, 'Same?', myUserId === senderId); // Debug
  
  return senderId === myUserId;
};

const getChannelIcon = (channel) => {
  return channelIcons[channel] || ChatBubbleLeftRightIcon;
};

const formatChannelDescription = (channel) => {
  return channelDescriptions[channel] || 'Support';
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

watch(messages, () => {
  scrollToBottom();
}, { deep: true });

onMounted(() => {
  scrollToBottom();
});

watch(() => chatStore.currentChannel, () => {
  scrollToBottom();
});
</script>
