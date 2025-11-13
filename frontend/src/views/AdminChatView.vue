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
            <router-link to="/admin" class="text-gray-600 hover:text-gray-900">Admin</router-link>
            <router-link to="/admin/chat" class="text-gray-900 font-medium">Admin Chat</router-link>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <!-- Dropdown del usuario -->
            <div class="relative" ref="dropdown">
              <button @click="toggleDropdown"
                class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span class="text-sm font-medium text-white">
                    {{ authStore.user?.nombre?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <ChevronDownIcon class="w-4 h-4 text-gray-500" />
              </button>

              <!-- Dropdown Menu -->
              <div v-show="showDropdown"
                class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div class="p-3 border-b border-gray-200">
                  <p class="text-sm font-medium text-gray-900">{{ authStore.user?.nombre }} {{ authStore.user?.apellido
                    }}</p>
                  <p class="text-xs text-gray-500">{{ authStore.user?.email }} (Admin)</p>
                </div>
                <div class="py-1">
                  <button @click="logout" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Chat Container -->
    <div class="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <!-- Admin Sidebar -->
      <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 class="text-xl font-bold text-gray-900">All Chats</h2>
          <p class="text-sm text-gray-500 mt-1">Manage user conversations</p>
        </div>

        <!-- Filters -->
        <div class="p-4 border-b border-gray-200 space-y-3 flex-shrink-0">
          <div>
            <select v-model="selectedChannel" @change="filterChats"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
              <option value="" disabled selected>Choose a channel</option>
              <option value="">All Channels</option>
              <option value="orders">Orders</option>
              <option value="customer-support">Customer Support</option>
              <option value="admin">Admin</option>
              <option value="shipping">Shipping</option>
            </select>
          </div>

          <!-- <div>
            <select v-model="selectedStatus" @change="filterChats"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
              <option value="" disabled selected>Choose a status</option>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div> -->
        </div>

        <!-- Chat List -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-2 space-y-1">
            <button v-for="chat in filteredChats" :key="chat._id" @click="selectChat(chat)"
              class="w-full p-3 rounded-lg text-left transition-colors hover:bg-gray-50" :class="{
                'bg-blue-50 border border-blue-200': currentChatId === chat._id,
                'bg-white': currentChatId !== chat._id
              }">
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
                  <span v-if="chat.unreadCount?.admin > 0"
                    class="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {{ chat.unreadCount.admin }}
                  </span>
                  <span class="px-2 py-0.5 text-xs rounded-full" :class="{
                      'bg-green-100 text-green-800': chat.status === 'active',
                      'bg-gray-100 text-gray-600': chat.status === 'closed'
                    }">
                    {{ chat.status }}
                  </span>
                </div>
              </div>

              <p v-if="chat.messages && chat.messages.length > 0" class="text-sm text-gray-600 truncate">
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

      <!-- Main Chat Area -->
      <div class="flex-1 flex flex-col min-h-0 min-w-0">
        <!-- Empty State -->
        <div v-if="!selectedChat" class="flex-1 flex items-center justify-center bg-gray-50">
          <div class="text-center">
            <ChatBubbleLeftRightIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p class="text-gray-500">Choose a chat from the sidebar to start responding</p>
          </div>
        </div>

        <!-- Chat View -->
        <template v-else>
          <!-- Chat Header -->
          <div class="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-700">
                    {{ selectedChat.user?.nombre?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div>
                  <h2 class="text-lg font-bold text-gray-900">
                    {{ selectedChat.user?.nombre }} {{ selectedChat.user?.apellido }}
                  </h2>
                  <p class="text-sm text-gray-500">{{ selectedChat.channelName }} • {{ selectedChat.user?.email }}</p>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <span class="px-3 py-1 text-sm rounded-full" :class="{
                    'bg-green-100 text-green-800': selectedChat.status === 'active',
                    'bg-gray-100 text-gray-600': selectedChat.status === 'closed'
                  }">
                  {{ selectedChat.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            <!-- Welcome message -->
            <div v-if="selectedChat.messages.length === 0" class="text-center py-8">
              <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <ChatBubbleLeftRightIcon class="w-8 h-8 text-gray-400" />
              </div>
              <h4 class="text-lg font-medium text-gray-900 mb-2">Start the conversation</h4>
              <p class="text-gray-500">Send a message to help this customer.</p>
            </div>

            <!-- Messages -->
            <div v-for="message in selectedChat.messages" :key="message._id" class="flex"
              :class="{ 'justify-end': message.senderType === 'admin' }">
              <div class="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl" :class="{
                  'bg-blue-500 text-white': message.senderType === 'admin',
                  'bg-white text-gray-900 border border-gray-200 shadow-sm': message.senderType === 'user'
                }">
                <div v-if="message.senderType === 'user'" class="text-xs font-medium mb-1 text-gray-600">
                  {{ selectedChat.user?.nombre }} {{ selectedChat.user?.apellido }}
                </div>
                <div v-else class="text-xs font-medium mb-1 text-blue-100">
                  Admin (You)
                </div>
                <p class="text-sm break-words leading-relaxed">{{ message.content }}</p>
                <div class="text-xs mt-2 opacity-75" :class="{
                    'text-blue-100': message.senderType === 'admin',
                    'text-gray-500': message.senderType === 'user'
                  }">
                  {{ formatTime(message.createdAt) }}
                </div>
              </div>
            </div>


          </div>

          <!-- Input -->
          <div class="bg-white border-t border-gray-200 p-6 flex-shrink-0">
            <!-- Typing indicator -->
            <div v-if="isTyping" class="mb-3 flex items-center space-x-2 text-gray-500 text-sm">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
              </div>
              <span>{{ selectedChat.user.nombre }} is typing...</span>
            </div>
            
            <form @submit.prevent="sendAdminMessage" class="flex items-end space-x-3">
              <div class="flex-1">
                <textarea
                  v-model="adminMessage"
                  @input="handleAdminTyping"
                  @keydown.enter.exact.prevent="sendAdminMessage"
                  placeholder="Type your response..."
                  rows="1"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 bg-white"
                  :disabled="sending || selectedChat.status === 'closed'"
                  style="min-height: 44px; max-height: 120px;"
                ></textarea>
              </div>
              <button
                type="submit"
                :disabled="!adminMessage.trim() || sending || selectedChat.status === 'closed'"
                class="flex items-center justify-center w-11 h-11 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon class="w-5 h-5" />
              </button>
            </form>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useSocket } from '@/composables/useSocket';
import ChatService from '@/services/ChatService';
import { ChatBubbleLeftRightIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
import { PaperAirplaneIcon } from '@heroicons/vue/24/solid';

const router = useRouter();
const authStore = useAuthStore();
const { connect, emit, on } = useSocket();

// State
const showDropdown = ref(false);
const dropdown = ref(null);
const selectedChat = ref(null);
const adminMessage = ref('');
const sending = ref(false);
const messagesContainer = ref(null);
const allChats = ref([]);
const selectedChannel = ref('');
const selectedStatus = ref('');
const currentChatId = ref(null);
const typingTimeout = ref(null);
const isTyping = ref(false);
const adminTypingTimeout = ref(null);

// Computed
const filteredChats = computed(() => {
  return allChats.value.filter(chat => {
    const channelMatch = !selectedChannel.value || chat.channel === selectedChannel.value;
    const statusMatch = !selectedStatus.value || chat.status === selectedStatus.value;
    return channelMatch && statusMatch;
  });
});

// Initialize socket
console.log('ADMIN: Inicializando socket...');
connect();

// Socket listeners con DEBUG COMPLETO
on('connect', () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ADMIN: Socket conectado exitosamente');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

on('new-message', (data) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ADMIN: Evento new-message recibido');
  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('Estado actual:');
  console.log('   - Chat seleccionado:', selectedChat.value?._id);
  console.log('   - Total chats:', allChats.value.length);
  updateChatWithMessage(data);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

on('new-user-message', (data) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ADMIN: Evento new-user-message recibido');
  console.log('Data completa:', JSON.stringify(data, null, 2));
  console.log('Estado actual:');
  console.log('   - Chat seleccionado ID:', selectedChat.value?._id);
  console.log('   - Chat del mensaje ID:', data.chatId);
  console.log('   - ¿Es el mismo chat?:', selectedChat.value?._id === data.chatId);
  console.log('   - Total chats en lista:', allChats.value.length);
  console.log('   - Mensajes en chat actual:', selectedChat.value?.messages?.length || 0);
  
  updateChatWithMessage(data);
  
  console.log('Estado después de actualizar:');
  console.log('   - Mensajes en chat actual:', selectedChat.value?.messages?.length || 0);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

on('new-admin-message', (data) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ADMIN: Evento new-admin-message recibido (otro admin)');
  console.log('Data:', JSON.stringify(data, null, 2));
  updateChatWithMessage(data);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

on('admin-message-sent', (data) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ADMIN: Evento admin-message-sent recibido');
  console.log('Data:', JSON.stringify(data, null, 2));
  updateChatWithMessage(data);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

on('admin-message-confirmed', (data) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ADMIN: Evento admin-message-confirmed recibido');
  console.log('Data:', JSON.stringify(data, null, 2));
  
  if (selectedChat.value && selectedChat.value._id === data.chatId) {
    const exists = selectedChat.value.messages.find(msg => 
      msg._id === data.message._id || 
      (msg.content === data.message.content && 
       Math.abs(new Date(msg.createdAt) - new Date(data.message.createdAt)) < 1000)
    );
    
    if (!exists) {
      console.log('Agregando mensaje confirmado al chat');
      selectedChat.value.messages.push(data.message);
      scrollToBottom();
    } else {
      console.log('Mensaje ya existe, no agregado');
    }
  }
  
  updateChatInList(data);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Escuchar typing de usuarios
on('user-typing', (data) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ADMIN: Usuario escribiendo:', data);
  console.log('   - Usuario:', data.userName);
  console.log('   - Canal:', data.channel);
  console.log('   - Chat seleccionado:', selectedChat.value?.channel);
  
  if (selectedChat.value && 
      selectedChat.value.channel === data.channel && 
      selectedChat.value.user._id === data.userId) {
    console.log('Mostrando indicador de typing');
    isTyping.value = true;
    
    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value);
    }
    
    typingTimeout.value = setTimeout(() => {
      console.log('Timeout: Ocultando typing');
      isTyping.value = false;
    }, 3000);
  } else {
    console.log('No mostrar typing - no es el chat actual');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

on('user-stop-typing', (data) => {
  console.log('ADMIN: Usuario dejó de escribir:', data);
  
  if (selectedChat.value && 
      selectedChat.value.channel === data.channel && 
      selectedChat.value.user._id === data.userId) {
    isTyping.value = false;
    
    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value);
    }
  }
});

on('unread-updated', (data) => {
  console.log('Actualización de mensajes no leídos:', data);
  
  const chatIndex = allChats.value.findIndex(chat => chat._id === data.chatId);
  if (chatIndex !== -1) {
    allChats.value[chatIndex].unreadCount = data.unreadCount;
    console.log('Unread actualizado para chat:', data.chatId);
  }
});

// Helper functions
const updateChatWithMessage = (data) => {
  console.log('🔧 updateChatWithMessage - INICIO');
  console.log('   - chatId del mensaje:', data.chatId);
  console.log('   - Chat seleccionado:', selectedChat.value?._id);
  
  // Actualizar chat actual si coincide
  if (selectedChat.value && selectedChat.value._id === data.chatId) {
    console.log('Es el chat seleccionado, actualizando...');
    console.log('   - Mensajes antes:', selectedChat.value.messages.length);
    
    const exists = selectedChat.value.messages.find(msg => 
      msg._id === data.message._id || 
      (msg.content === data.message.content && 
       Math.abs(new Date(msg.createdAt) - new Date(data.message.createdAt)) < 1000)
    );
    
    if (!exists) {
      console.log('Mensaje nuevo, agregando...');
      selectedChat.value.messages.push(data.message);
      console.log('   - Mensajes después:', selectedChat.value.messages.length);
      scrollToBottom();
      
      // Marcar como leído automáticamente
      markChatAsRead(data.chatId);
    } else {
      console.log('Mensaje duplicado detectado');
    }
  } else {
    console.log('NO es el chat seleccionado');
  }
  
  // Actualizar la lista de chats
  updateChatInList(data);
  console.log('🔧 updateChatWithMessage - FIN');
};

const updateChatInList = (data) => {
  console.log('updateChatInList - INICIO');
  const chatIndex = allChats.value.findIndex(chat => chat._id === data.chatId);
  console.log('   - Índice del chat en lista:', chatIndex);
  
  if (chatIndex !== -1) {
    console.log('Chat encontrado en lista, actualizando...');
    
    // Actualizar último mensaje
    allChats.value[chatIndex].lastMessage = data.message.createdAt;
    
    // Si es un mensaje de usuario y NO estoy viendo este chat, incrementar unread
    if (data.message.senderType === 'user' && 
        selectedChat.value && 
        selectedChat.value._id !== data.chatId) {
      allChats.value[chatIndex].unreadCount = allChats.value[chatIndex].unreadCount || { admin: 0, user: 0 };
      allChats.value[chatIndex].unreadCount.admin += 1;
      console.log('Incrementado unread a:', allChats.value[chatIndex].unreadCount.admin);
    }
    
    // Si estoy viendo este chat, resetear unread
    if (selectedChat.value && selectedChat.value._id === data.chatId) {
      allChats.value[chatIndex].unreadCount = allChats.value[chatIndex].unreadCount || { admin: 0, user: 0 };
      allChats.value[chatIndex].unreadCount.admin = 0;
      console.log('Reseteado unread a 0');
    }
    
    // Agregar mensaje a la lista si no existe
    if (!allChats.value[chatIndex].messages) {
      allChats.value[chatIndex].messages = [];
    }
    
    const messageExists = allChats.value[chatIndex].messages.find(msg => 
      msg._id === data.message._id || 
      (msg.content === data.message.content && 
       Math.abs(new Date(msg.createdAt) - new Date(data.message.createdAt)) < 1000)
    );
    
    if (!messageExists) {
      console.log('Agregando mensaje a lista de chat');
      allChats.value[chatIndex].messages.push(data.message);
    }
  } else {
    console.log('Chat no encontrado en lista, recargando...');
    filterChats();
  }
  console.log('🔧 updateChatInList - FIN');
};

const markChatAsRead = async (chatId) => {
  try {
    console.log('📖 Marcando chat como leído:', chatId);
    
    const chatIndex = allChats.value.findIndex(chat => chat._id === chatId);
    if (chatIndex !== -1) {
      allChats.value[chatIndex].unreadCount = allChats.value[chatIndex].unreadCount || { admin: 0, user: 0 };
      allChats.value[chatIndex].unreadCount.admin = 0;
      console.log('Chat marcado como leído localmente');
    }
  } catch (error) {
    console.error('Error marking chat as read:', error);
  }
};

const sendAdminMessage = async () => {
  if (!adminMessage.value.trim() || sending.value || !selectedChat.value) {
    return;
  }

  sending.value = true;
  const content = adminMessage.value.trim();
  adminMessage.value = '';

  try {
    console.log('Enviando mensaje de admin...');
    
    emit('send-admin-message', {
      userId: selectedChat.value.user._id,
      channel: selectedChat.value.channel,
      content
    });
    
    scrollToBottom();

  } catch (error) {
    console.error('Error sending message:', error);
    adminMessage.value = content;
  } finally {
    sending.value = false;
  }
};

const handleAdminTyping = () => {
  if (!selectedChat.value) return;
  
  emit('typing', {
    userId: selectedChat.value.user._id,
    channel: selectedChat.value.channel
  });
  
  if (adminTypingTimeout.value) {
    clearTimeout(adminTypingTimeout.value);
  }
  
  adminTypingTimeout.value = setTimeout(() => {
    emit('stop-typing', {
      userId: selectedChat.value.user._id,
      channel: selectedChat.value.channel
    });
  }, 1000);
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  showDropdown.value = false;
};

const handleClickOutside = (event) => {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    closeDropdown();
  }
};

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

const selectChat = async (chat) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ADMIN: Seleccionando chat:', chat._id);
  console.log('   - Usuario:', chat.user.nombre);
  console.log('   - Canal:', chat.channel);
  
  currentChatId.value = chat._id;
  selectedChat.value = chat;
  
  // Join channel
  emit('join-channel', {
    userId: chat.user._id,
    channel: chat.channel
  });
  console.log('Unido al canal:', `${chat.user._id}:${chat.channel}`);

  await markChatAsRead(chat._id);

  scrollToBottom();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
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

const logout = () => {
  authStore.logout();
  router.push('/login');
  closeDropdown();
};

// Lifecycle
onMounted(async () => {
  console.log('ADMIN: Componente montado');
  document.addEventListener('click', handleClickOutside);
  await filterChats();
  console.log('ADMIN: Chats cargados:', allChats.value.length);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
  if (adminTypingTimeout.value) {
    clearTimeout(adminTypingTimeout.value);
  }
});
</script>
