import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth';

const socket = ref(null);
const connected = ref(false);

export function useSocket() {
  const authStore = useAuthStore();

  const connect = () => {
    console.log('🔌 Intentando conectar socket...');
    
    if (socket.value?.connected) {
      console.log('Socket ya conectado');
      return socket.value;
    }

    // VERIFICAR MÚLTIPLES FUENTES DE TOKEN
    let token = authStore.token;
    
    if (!token) {
      token = localStorage.getItem('token');
      console.log('🔍 Token desde localStorage:', token ? token.substring(0, 20) + '...' : 'NO ENCONTRADO');
    }

    if (!token) {
      console.error('No hay token disponible en ningún lugar');
      return null;
    }

    console.log('Token encontrado para socket:', token.substring(0, 20) + '...');
    

    let socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    // Si la URL tiene /api, removerlo para socket
    if (socketUrl.endsWith('/api')) {
      socketUrl = socketUrl.replace('/api', '');
    }


    socket.value = io(socketUrl, {
      auth: { 
        token: token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: true,
      transports: ['websocket', 'polling']
    });

    socket.value.on('connect', () => {
      connected.value = true;
      console.log('*** SOCKET CONECTADO EXITOSAMENTE ***');
      console.log('Socket ID:', socket.value.id);
    });

    socket.value.on('disconnect', (reason) => {
      connected.value = false;
      console.log('Socket desconectado. Razón:', reason);
    });

    socket.value.on('connect_error', (error) => {
      console.error('ERROR DE CONEXIÓN SOCKET:');
      console.error('Mensaje:', error.message);
      console.error('Tipo:', error.type);
      console.error('Descripción:', error.description);
      console.error('Detalles completos:', error);
    });

    return socket.value;
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      connected.value = false;
      console.log('🔌 Socket desconectado manualmente');
    }
  };

  const emit = (event, data) => {
    console.log('Intentando emitir evento:', event);
    console.log('Socket existe:', !!socket.value);
    console.log('Socket conectado:', socket.value?.connected || false);
    
    if (socket.value?.connected) {
      console.log('Emitiendo evento:', event, 'Datos:', data);
      socket.value.emit(event, data);
    } else {
      console.error('SOCKET NO CONECTADO - No se puede emitir');
      console.error('Estado del socket:', {
        exists: !!socket.value,
        connected: socket.value?.connected || false,
        id: socket.value?.id || 'NO ID'
      });
      
      // Intentar reconectar
      connect();
      
      // Intentar emitir después de reconectar
      setTimeout(() => {
        if (socket.value?.connected) {
          console.log('Reintentando emisión después de reconexión...');
          socket.value.emit(event, data);
        }
      }, 1000);
    }
  };

  const on = (event, callback) => {
    if (socket.value) {
      socket.value.on(event, callback);
      console.log('Listener agregado para evento:', event);
    } else {
      console.warn('Socket no existe, no se puede agregar listener para:', event);
    }
  };

  const off = (event, callback) => {
    if (socket.value) {
      socket.value.off(event, callback);
    }
  };

  return {
    socket,
    connected,
    connect,
    disconnect,
    emit,
    on,
    off
  };
}
