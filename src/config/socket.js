const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');
const User = require('../models/User');

const initializeSocket = (io) => {

  // Middleware de autenticación
  io.use(async (socket, next) => {
    try {
      console.log('Intentando autenticar socket...');
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('No token provided'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔍 Token decodificado COMPLETO:', decoded);
      
      const userId = decoded.userId || decoded.id || decoded.user_id || decoded._id;

      
      if (!userId) {
        return next(new Error('No userId in token'));
      }
      
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed: ' + error.message));
    }
  });

  io.on('connection', (socket) => {

    // Registrar todos los eventos disponibles
    console.log('📋 Eventos registrados para:', socket.user.nombre);

    // Unirse a un canal
    socket.on('join-channel', async ({ userId, channel }) => {
      try {
        const roomName = `${userId}:${channel}`;
        socket.join(roomName);
        console.log(`🔗 Usuario ${socket.user.nombre} se unió al canal ${roomName}`);
        
        if (socket.user.rol === 'administrador') {
          console.log('📖 Admin se unió, marcando mensajes como leídos...');
          
          const chat = await Chat.findOne({ user: userId, channel });
          if (chat) {
            chat.unreadCount.admin = 0;
            await chat.save();
            console.log('Mensajes marcados como leídos para admin');
            
            // Emitir actualización de unread count
            io.to(roomName).emit('unread-updated', {
              chatId: chat._id,
              unreadCount: chat.unreadCount
            });
          }
        }
        
      } catch (error) {
        console.error('Error joining channel:', error);
        socket.emit('error', { message: 'Error joining channel' });
      }
    });

    // Enviar mensaje de USUARIO
    socket.on('send-message', async (data) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('PASO 1: Mensaje de USUARIO recibido en backend');
      console.log('Data completa:', JSON.stringify(data, null, 2));
      console.log('Usuario que envía:', socket.user.nombre, '| ID:', socket.user._id);
      
      try {
        const { userId, channel, content } = data;

        console.log('PASO 2: Validando usuario...');
        if (socket.user._id.toString() !== userId) {
          console.log('Usuario no autorizado');
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }
        console.log('Usuario validado correctamente');

        console.log('PASO 3: Buscando chat en DB...');
        let chat = await Chat.findOne({ user: userId, channel });
        
        if (!chat) {
          console.log('Chat no existe, creando nuevo...');
          chat = new Chat({
            user: userId,
            channel,
            channelName: getChannelName(channel),
            messages: [],
            unreadCount: { user: 0, admin: 0 },
            status: 'active'
          });
        } else {
          console.log('Chat encontrado:', chat._id);
        }

        console.log('🔵 PASO 4: Creando mensaje...');
        const newMessage = {
          content,
          sender: socket.user._id,
          senderType: 'user',
          createdAt: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastMessage = new Date();
        chat.unreadCount.admin += 1;
        
        console.log('PASO 5: Guardando en DB...');
        await chat.save();
        console.log('Mensaje guardado en DB');

        const messageWithSender = {
          ...newMessage,
          _id: chat.messages[chat.messages.length - 1]._id,
          sender: {
            _id: socket.user._id,
            nombre: socket.user.nombre,
            apellido: socket.user.apellido
          }
        };

        console.log('PASO 6: Preparando emisión...');
        console.log('Mensaje a emitir:', JSON.stringify(messageWithSender, null, 2));

        const userRoom = `${userId}:${channel}`;
        console.log('PASO 7: Emitiendo a sala de usuario:', userRoom);
        io.to(userRoom).emit('new-message', {
          chatId: chat._id,
          channel,
          message: messageWithSender
        });
        console.log('Emitido a sala de usuario (incluye al remitente)');
        
        io.emit('new-user-message', {
          userId,
          channel,
          chatId: chat._id,
          message: messageWithSender
        });


      } catch (error) {
        console.error('ERROR en send-message:', error);
        console.error('Stack:', error.stack);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    //  MENSAJE DE ADMIN
    socket.on('send-admin-message', async (data) => {
      console.log('*** EVENTO send-admin-message RECIBIDO ***');
      console.log('Datos recibidos:', JSON.stringify(data, null, 2));
      console.log('Usuario que envía:', socket.user.nombre, '- Rol:', socket.user.rol);
      
      try {
        const { userId, channel, content } = data;

        // Verificar que el usuario es admin
        if (socket.user.rol !== 'administrador') {
          console.log('Usuario no es admin:', socket.user.rol);
          socket.emit('error', { message: 'Unauthorized - Admin only' });
          return;
        }

        // Buscar el chat existente
        let chat = await Chat.findOne({ user: userId, channel }).populate('user', 'nombre apellido email');
        
        if (!chat) {
          console.log('Chat no encontrado para userId:', userId, 'channel:', channel);
          socket.emit('error', { message: 'Chat not found' });
          return;
        }


        // Crear el mensaje del admin
        const newMessage = {
          content,
          sender: socket.user._id,
          senderType: 'admin',
          createdAt: new Date()
        };

        // Agregar mensaje al chat
        chat.messages.push(newMessage);
        chat.lastMessage = new Date();
        chat.unreadCount.user += 1;
        
        await chat.save();
        
        console.log('Mensaje de admin guardado en DB:', newMessage);

        const messageWithSender = {
          ...newMessage,
          _id: chat.messages[chat.messages.length - 1]._id,
          sender: {
            _id: socket.user._id,
            nombre: socket.user.nombre,
            apellido: socket.user.apellido
          }
        };

        // Emitir a la sala del usuario
        const userRoom = `${userId}:${channel}`;
        console.log('Emitiendo a sala de usuario:', userRoom);
        io.to(userRoom).emit('new-admin-message', {
          chatId: chat._id,
          channel,
          message: messageWithSender
        });

        // Emitir a otros admins
        console.log('Emitiendo a otros admins...');
        socket.broadcast.emit('admin-message-sent', {
          chatId: chat._id,
          channel,
          userId,
          message: messageWithSender
        });
        // Confirmar al admin que envió
        console.log('Confirmando al admin...');
        socket.emit('admin-message-confirmed', {
          chatId: chat._id,
          message: messageWithSender
        });

        console.log('Mensaje de admin procesado completamente');

      } catch (error) {
        console.error('Error sending admin message:', error);
        socket.emit('error', { message: 'Error sending admin message: ' + error.message });
      }
    });

    // Usuario escribiendo
    socket.on('typing', ({ userId, channel }) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⌨️ Typing event recibido:', { userId, channel, from: socket.user.nombre, rol: socket.user.rol });
      
      const roomName = `${userId}:${channel}`;
      
      if (socket.user.rol === 'administrador') {
        console.log('Admin escribiendo para usuario:', userId, 'en canal:', channel);
        console.log('Emitiendo admin-typing a sala:', roomName);
        console.log('Clientes en sala:', io.sockets.adapter.rooms.get(roomName)?.size || 0);
        
        // Emitir a la sala del usuario
        io.to(roomName).emit('admin-typing', {
          adminName: socket.user.nombre,
          channel
        });
        
        console.log('Evento admin-typing emitido a sala:', roomName);
      } else {
        // Usuario escribiendo -> emitir a todos los admins
        console.log('👤 Usuario escribiendo, emitiendo a todos los admins');
        socket.broadcast.emit('user-typing', {
          userId,
          channel,
          userName: socket.user.nombre
        });
        console.log('Evento user-typing emitido a todos');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    // Usuario dejó de escribir
    socket.on('stop-typing', ({ userId, channel }) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Stop typing event recibido:', { userId, channel, from: socket.user.nombre, rol: socket.user.rol });
      
      const roomName = `${userId}:${channel}`;
      
      if (socket.user.rol === 'administrador') {
        
        io.to(roomName).emit('admin-stop-typing', {
          channel
        });
        
        console.log('Evento admin-stop-typing emitido a sala:', roomName);
      } else {
        // Usuario dejó de escribir -> emitir a todos los admins
        console.log('👤 Usuario dejó de escribir, emitiendo a todos los admins');
        socket.broadcast.emit('user-stop-typing', {
          userId,
          channel
        });
        console.log('Evento user-stop-typing emitido a todos');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.user.nombre} (${socket.id})`);
    });

    const originalOnevent = socket.onevent;
    socket.onevent = function (packet) {
      console.log('📨 Evento recibido:', packet.data[0], 'de:', socket.user.nombre);
      originalOnevent.call(this, packet);
    };
  });

  // Debug para conexiones fallidas
  io.engine.on('connection_error', (err) => {
    console.log('Error de conexión del motor:', err.req);
    console.log('Código de error:', err.code);
    console.log('Mensaje:', err.message);
    console.log('Contexto:', err.context);
  });
};

function getChannelName(channel) {
  const channelNames = {
    'orders': 'Order Inquiry',
    'customer-support': 'Customer Support', 
    'admin': 'Admin Contact',
    'shipping': 'Shipping'
  };
  return channelNames[channel] || 'Unknown Channel';
}

module.exports = initializeSocket;
