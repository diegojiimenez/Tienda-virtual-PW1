import { defineStore } from 'pinia';
import ChatService from '@/services/ChatService';
import { useSocket } from '@/composables/useSocket';
import { useAuthStore } from './auth';

export const useChatStore = defineStore('chat', {
  state: () => ({
    chats: [],
    currentChat: null,
    currentChannel: null,
    loading: false,
    error: null,
    typingUsers: new Map(),
    socket: null
  }),

  getters: {
    totalUnreadMessages: (state) => {
      const authStore = useAuthStore();
      const isAdmin = authStore.isAdmin;
      
      return state.chats.reduce((total, chat) => {
        return total + (isAdmin ? chat.unreadCount.admin : chat.unreadCount.user);
      }, 0);
    },

    getChannelUnread: (state) => (channel) => {
      const authStore = useAuthStore();
      const isAdmin = authStore.isAdmin;
      const chat = state.chats.find(c => c.channel === channel);
      
      if (!chat) return 0;
      return isAdmin ? chat.unreadCount.admin : chat.unreadCount.user;
    },

    sortedChats: (state) => {
      return [...state.chats].sort((a, b) => {
        return new Date(b.lastMessage) - new Date(a.lastMessage);
      });
    }
  },

  actions: {
    initializeSocket() {
      const { connect, on } = useSocket();
      this.socket = connect();
  
      if (!this.socket) {
        console.error('No se pudo conectar el socket');
        return;
      }
  
      // Escuchar nuevos mensajes
      on('new-message', (data) => {
        console.log('Nuevo mensaje recibido:', data);
        this.handleNewMessage(data);
      });
  
      // Escuchar mensajes de admin (para usuarios)
      on('new-admin-message', (data) => {
        console.log('Nuevo mensaje de admin recibido:', data);
        this.handleNewMessage(data);
      });
  
      // Escuchar mensajes de usuarios (para admin)
      on('new-user-message', (data) => {
        console.log('Nuevo mensaje de usuario:', data);
        this.handleNewUserMessage(data);
      });
  
      on('admin-typing', (data) => {
        console.log('Admin está escribiendo:', data);
        if (data.channel === this.currentChannel) {
          this.typingUsers.set(`admin:${data.channel}`, data.adminName);
          console.log('Typing activado para admin');
        }
      });

      on('admin-stop-typing', (data) => {
        console.log('Admin dejó de escribir:', data);
        if (data.channel === this.currentChannel) {
          this.typingUsers.delete(`admin:${data.channel}`);
          console.log('Typing desactivado para admin');
        }
      });
  
      // Escuchar usuario escribiendo (para admin)
      on('user-typing', (data) => {
        console.log('Usuario está escribiendo:', data);
        this.typingUsers.set(`${data.userId}:${data.channel}`, data.userName);
        setTimeout(() => {
          this.typingUsers.delete(`${data.userId}:${data.channel}`);
        }, 3000);
      });
  
      // Escuchar usuario dejó de escribir (para admin)
      on('user-stop-typing', (data) => {
        console.log('Usuario dejó de escribir:', data);
        this.typingUsers.delete(`${data.userId}:${data.channel}`);
      });
    },

    async fetchUserChats() {
      this.loading = true;
      this.error = null;
    
      try {
        console.log('Fetching user chats...'); // Debug
        const response = await ChatService.getUserChats();
        console.log('Chats response:', response); // Debug
        this.chats = response.data;
        console.log('Chats loaded:', this.chats); // Debug
      } catch (error) {
        console.error('Error fetching chats:', error); // Debug
        this.error = error.response?.data?.message || 'Error al cargar chats';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async selectChannel(channel) {
      this.loading = true;
      this.error = null;
    
      try {
        console.log('Selecting channel:', channel);
        const response = await ChatService.getOrCreateChat(channel);
        this.currentChat = response.data;
        this.currentChannel = channel;
    
        // Unirse al canal en socket
        const { emit } = useSocket();
        const authStore = useAuthStore();
        const userId = authStore.user._id || authStore.user.id;
        
        console.log('Emitiendo join-channel desde usuario:', { userId, channel });
        
        emit('join-channel', { 
          userId, 
          channel 
        });
    
        // Marcar como leido
        await this.markAsRead(channel);
    
      } catch (error) {
        console.error('Error selecting channel:', error);
        this.error = error.response?.data?.message || 'Error al cargar chat';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async sendMessage(content) {
      if (!this.currentChannel || !content.trim()) return;
    
      try {
        console.log('Enviando mensaje:', { channel: this.currentChannel, content });
        
        const { emit } = useSocket();
        const authStore = useAuthStore();
        const userId = authStore.user._id || authStore.user.id;
        
        console.log('🔵 Enviando por socket:', { userId, channel: this.currentChannel, content });
        
        const tempId = `temp_${userId}_${Date.now()}_${Math.random()}`;
        
        // Enviar mensaje por socket
        emit('send-message', {
          userId: userId,
          channel: this.currentChannel,
          content: content.trim()
        });
    
        if (this.currentChat) {
          const newMessage = {
            _id: tempId, // ID temporal para detectar duplicados
            content: content.trim(),
            sender: authStore.user,
            senderType: 'user',
            createdAt: new Date().toISOString()
          };
          
          this.currentChat.messages.push(newMessage);
          console.log('Mensaje agregado localmente (temporal)');
        }
    
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },

    async markAsRead(channel) {
      if (!channel) return;
      
      try {
        console.log('📖 Marcando como leído:', channel);
        await ChatService.markAsRead(channel);
        
        // Actualizar contador local
        const chatIndex = this.chats.findIndex(chat => chat.channel === channel);
        if (chatIndex !== -1) {
          this.chats[chatIndex].unreadCount = this.chats[chatIndex].unreadCount || { user: 0, admin: 0 };
          this.chats[chatIndex].unreadCount.user = 0;
        }
        
        console.log('Marcado como leído correctamente');
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    },

    handleNewMessage(data) {
      console.log('Procesando nuevo mensaje:', data);
      
      const authStore = useAuthStore();
      const myUserId = authStore.user._id || authStore.user.id;
      
      // Actualizar chat actual si coincide
      if (this.currentChat && this.currentChat._id === data.chatId) {
        const tempMsgIndex = this.currentChat.messages.findIndex(msg => {
          // Si es mensaje temporal mío con mismo contenido
          if (msg._id?.startsWith('temp_') && 
              msg.content === data.message.content &&
              msg.senderType === 'user' &&
              (msg.sender?._id || msg.sender?.id) === myUserId) {
            return true;
          }
          
          // Si ya existe con el mismo ID real
          if (msg._id && data.message._id && msg._id === data.message._id) {
            return true;
          }
          
          // Si son muy similares (mismo contenido, mismo sender, tiempo cercano)
          const sameContent = msg.content === data.message.content;
          const sameSender = (msg.sender?._id || msg.sender?.id || msg.sender) === 
                            (data.message.sender?._id || data.message.sender?.id || data.message.sender);
          const sameType = msg.senderType === data.message.senderType;
          const timeClose = Math.abs(new Date(msg.createdAt) - new Date(data.message.createdAt)) < 2000;
          
          return sameContent && sameSender && sameType && timeClose;
        });
        
        if (tempMsgIndex !== -1) {
          console.log('🔄 Reemplazando mensaje temporal con mensaje real');
          this.currentChat.messages[tempMsgIndex] = {
            ...data.message,
            _id: data.message._id || this.currentChat.messages[tempMsgIndex]._id
          };
        } else {

          const messageToAdd = {
            ...data.message,
            _id: data.message._id || `msg_${Date.now()}_${Math.random()}`
          };
          
          this.currentChat.messages.push(messageToAdd);
          console.log('Mensaje agregado al chat actual');
        }
        
        if (this.currentChannel === data.channel) {
          this.markAsRead(this.currentChannel);
        }
      }
    
      // Actualizar la lista de chats
      const chatIndex = this.chats.findIndex(chat => chat._id === data.chatId);
      if (chatIndex !== -1) {
        this.chats[chatIndex].lastMessage = data.message.createdAt;
        
        if (!this.chats[chatIndex].messages) {
          this.chats[chatIndex].messages = [];
        }
        
        // Buscar y reemplazar/agregar en la lista
        const msgIndex = this.chats[chatIndex].messages.findIndex(msg => 
          (msg._id?.startsWith('temp_') && msg.content === data.message.content) ||
          (msg._id && data.message._id && msg._id === data.message._id) ||
          (msg.content === data.message.content && 
           Math.abs(new Date(msg.createdAt) - new Date(data.message.createdAt)) < 2000)
        );
        
        if (msgIndex !== -1) {
          this.chats[chatIndex].messages[msgIndex] = data.message;
        } else {
          this.chats[chatIndex].messages.push(data.message);
        }
        
        // Solo incrementar unread si NO es el chat actual Y es mensaje de admin
        const isCurrentChat = this.currentChat && this.currentChat._id === data.chatId;
        
        if (!isCurrentChat && data.message.senderType === 'admin') {
          this.chats[chatIndex].unreadCount = this.chats[chatIndex].unreadCount || { user: 0, admin: 0 };
          this.chats[chatIndex].unreadCount.user += 1;
        }
        
        if (isCurrentChat) {
          this.chats[chatIndex].unreadCount = this.chats[chatIndex].unreadCount || { user: 0, admin: 0 };
          this.chats[chatIndex].unreadCount.user = 0;
        }
      } else {
        console.log('Chat no encontrado, recargando lista...');
        this.fetchUserChats();
      }
    },

    handleNewUserMessage(data) {
      console.log('Nuevo mensaje de usuario recibido:', data);
      
      // Buscar el chat en la lista
      const chatIndex = this.chats.findIndex(chat => chat._id === data.chatId);
      
      if (chatIndex !== -1) {
        // Actualizar último mensaje
        this.chats[chatIndex].lastMessage = data.message.createdAt;
        
        // Actualizar mensajes
        if (!this.chats[chatIndex].messages) {
          this.chats[chatIndex].messages = [];
        }
        
        const messageExists = this.chats[chatIndex].messages.find(msg => 
          msg._id === data.message._id
        );
        
        if (!messageExists) {
          this.chats[chatIndex].messages.push(data.message);
        }
        
        // Si hay información del chat completo, actualizar
        if (data.chat) {
          this.chats[chatIndex] = {
            ...this.chats[chatIndex],
            ...data.chat
          };
        }
      } else if (data.chat) {
        // Agregar nuevo chat a la lista
        console.log('Agregando nuevo chat a la lista');
        this.chats.unshift(data.chat);
      } else {
        // Refrescar lista completa
        this.fetchChats();
      }
    },

    startTyping() {
      if (!this.currentChannel) return;
      
      const authStore = useAuthStore();
      const userId = authStore.user._id || authStore.user.id;
      
      console.log('Start typing:', { userId, channel: this.currentChannel });
      
      const { emit } = useSocket();
      emit('typing', {
        userId,
        channel: this.currentChannel
      });
    },

    stopTyping() {
      if (!this.currentChannel) return;
      
      const authStore = useAuthStore();
      const userId = authStore.user._id || authStore.user.id;
      
      console.log('Stop typing:', { userId, channel: this.currentChannel });
      
      const { emit } = useSocket();
      emit('stop-typing', {
        userId,
        channel: this.currentChannel
      });
    },

    leaveChannel() {
      if (!this.currentChannel) return;

      const authStore = useAuthStore();
      const { emit } = useSocket();

      emit('leave-channel', {
        userId: authStore.user.id,
        channel: this.currentChannel
      });

      this.currentChat = null;
      this.currentChannel = null;
    },

    reset() {
      this.chats = [];
      this.currentChat = null;
      this.currentChannel = null;
      this.typingUsers.clear();
      
      const { disconnect } = useSocket();
      disconnect();
    }
  }
});
