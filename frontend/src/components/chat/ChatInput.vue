<template>
  <div v-if="chatStore.currentChat" class="bg-white border-t border-gray-200 p-6 flex-shrink-0">
    <!--  INDICADOR de typing con altura fija -->
    <div class="mb-3" style="min-height: 24px;">
      <div v-if="isAdminTyping" class="flex items-center space-x-2 text-gray-500 text-sm">
        <div class="flex space-x-1">
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
        <span>{{ adminName }} is typing...</span>
      </div>
    </div>
    
    <form @submit.prevent="sendMessage" class="flex items-end space-x-3">
      <div class="flex-1">
        <textarea
          v-model="message"
          @input="handleTyping"
          @keydown.enter.exact.prevent="sendMessage"
          placeholder="Type your message..."
          rows="1"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 bg-white"
          :disabled="sending"
          style="min-height: 44px; max-height: 120px;"
        ></textarea>
      </div>
      <button
        type="submit"
        :disabled="!message.trim() || sending"
        class="flex items-center justify-center w-11 h-11 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <PaperAirplaneIcon class="w-5 h-5" />
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import { useSocket } from '@/composables/useSocket';
import { PaperAirplaneIcon } from '@heroicons/vue/24/solid';

const chatStore = useChatStore();
const authStore = useAuthStore();
const { on, off } = useSocket();
const message = ref('');
const sending = ref(false);
const typingTimeout = ref(null);

const isAdminTyping = computed(() => {
  if (!chatStore.currentChannel) return false;
  
  // Buscar si hay un admin escribiendo en este canal
  const typingKey = `admin:${chatStore.currentChannel}`;
  return chatStore.typingUsers.has(typingKey);
});

const adminName = computed(() => {
  if (!chatStore.currentChannel) return 'Admin';
  
  const typingKey = `admin:${chatStore.currentChannel}`;
  return chatStore.typingUsers.get(typingKey) || 'Admin';
});

const handleTyping = () => {
  chatStore.startTyping();

  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }

  typingTimeout.value = setTimeout(() => {
    chatStore.stopTyping();
  }, 1000);
};

const sendMessage = async () => {
  if (!message.value.trim() || sending.value) return;

  sending.value = true;
  const content = message.value.trim();
  message.value = '';

  try {
    await chatStore.sendMessage(content);
    chatStore.stopTyping();
  } catch (error) {
    console.error('Error sending message:', error);
    message.value = content;
  } finally {
    sending.value = false;
  }
};


const handleAdminTyping = (data) => {
  console.log('Admin typing recibido:', data);
  if (data.channel === chatStore.currentChannel) {
    adminTyping.value = true;
    console.log('Mostrando typing de admin');
    

    if (adminTypingTimeout.value) {
      clearTimeout(adminTypingTimeout.value);
    }
    
    adminTypingTimeout.value = setTimeout(() => {
      adminTyping.value = false;
    }, 3000);
  }
};

const handleAdminStopTyping = (data) => {
  console.log('Admin stop typing recibido:', data);
  if (data.channel === chatStore.currentChannel) {
    adminTyping.value = false;
    
    if (adminTypingTimeout.value) {
      clearTimeout(adminTypingTimeout.value);
    }
  }
};

onMounted(() => {
  console.log('Registrando listeners de typing en ChatInput');
  on('admin-typing', handleAdminTyping);
  on('admin-stop-typing', handleAdminStopTyping);
});

onUnmounted(() => {
  console.log('Desregistrando listeners de typing en ChatInput');
  off('admin-typing', handleAdminTyping);
  off('admin-stop-typing', handleAdminStopTyping);
  
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
  if (adminTypingTimeout.value) {
    clearTimeout(adminTypingTimeout.value);
  }
});
</script>
