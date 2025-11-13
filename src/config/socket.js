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
      const userId = decoded.userId || decoded.id || decoded.user_id || decoded._id;
      
      if (!userId) {
        return next(new Error('No userId in token'));
      }
      
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      console.log('Socket autenticado:', user.nombre, '- Rol:', user.rol);
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      next(new Error('Authentication failed: ' + error.message));
    }
  });

  io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.user.nombre, '(', socket.id, ')');

    // Unirse a un canal
    socket.on('join-channel', async ({ userId, channel }) => {
      try {
        const roomName = `${userId}:${channel}`;
        socket.join(roomName);
        console.log(`${socket.user.nombre} se unió al canal ${roomName}`);
        
        if (socket.user.rol === 'administrador') {
          const chat = await Chat.findOne({ user: userId, channel });
          if (chat) {
            chat.unreadCount.admin = 0;
            chat.messages.forEach(msg => {
              if (msg.senderType === 'user') msg.read = true;
            });
            await chat.save();
            
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
      console.log('Mensaje de USUARIO recibido');
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('Usuario:', socket.user.nombre, '| ID:', socket.user._id);
      
      try {
        const { userId, channel, content } = data;

        if (socket.user._id.toString() !== userId) {
          console.log('Usuario no autorizado');
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        let chat = await Chat.findOne({ user: userId, channel });
        
        if (!chat) {
          console.log('Creando nuevo chat...');
          chat = new Chat({
            user: userId,
            channel,
            channelName: getChannelName(channel),
            messages: [],
            unreadCount: { user: 0, admin: 0 },
            status: 'active'
          });
        }


        const newMessage = {
          content,
          sender: socket.user._id,
          senderType: 'user',
          read: false,  
          createdAt: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastMessage = new Date();
        chat.unreadCount.admin += 1;
        
        await chat.save();
        console.log('Mensaje guardado en BD');

        // Popular el sender para la respuesta
        await chat.populate('messages.sender', 'nombre apellido email');
        
        const savedMessage = chat.messages[chat.messages.length - 1];
        
        const messageWithSender = {
          _id: savedMessage._id,
          content: savedMessage.content,
          senderType: savedMessage.senderType,
          read: savedMessage.read,
          createdAt: savedMessage.createdAt,
          sender: {
            _id: socket.user._id,
            nombre: socket.user.nombre,
            apellido: socket.user.apellido,
            email: socket.user.email
          }
        };

        const userRoom = `${userId}:${channel}`;
        console.log('Emitiendo a sala:', userRoom);
        
        io.to(userRoom).emit('new-message', {
          chatId: chat._id,
          channel,
          message: messageWithSender
        });
        
        io.emit('new-user-message', {
          userId,
          channel,
          chatId: chat._id,
          message: messageWithSender,
          chat: {
            _id: chat._id,
            user: chat.user,
            channel: chat.channel,
            channelName: chat.channelName,
            lastMessage: chat.lastMessage,
            unreadCount: chat.unreadCount,
            status: chat.status
          }
        });

        console.log('Mensaje procesado completamente');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      } catch (error) {
        console.error('ERROR en send-message:', error);
        console.error('Stack:', error.stack);
        socket.emit('error', { message: 'Error sending message: ' + error.message });
      }
    });

    // Enviar mensaje de ADMIN
    socket.on('send-admin-message', async (data) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👨‍💼 Mensaje de ADMIN recibido');
      console.log('Data:', JSON.stringify(data, null, 2));
      
      try {
        const { userId, channel, content } = data;

        if (socket.user.rol !== 'administrador') {
          console.log('Usuario no es admin');
          socket.emit('error', { message: 'Unauthorized - Admin only' });
          return;
        }

        let chat = await Chat.findOne({ user: userId, channel });
        
        if (!chat) {
          console.log('Chat no encontrado');
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        const newMessage = {
          content,
          sender: socket.user._id,
          senderType: 'admin',
          read: false,  
          createdAt: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastMessage = new Date();
        chat.unreadCount.user += 1;
        
        await chat.save();
        console.log('Mensaje de admin guardado');

        await chat.populate('messages.sender', 'nombre apellido email');
        
        const savedMessage = chat.messages[chat.messages.length - 1];
        
        const messageWithSender = {
          _id: savedMessage._id,
          content: savedMessage.content,
          senderType: savedMessage.senderType,
          read: savedMessage.read,
          createdAt: savedMessage.createdAt,
          sender: {
            _id: socket.user._id,
            nombre: socket.user.nombre,
            apellido: socket.user.apellido,
            email: socket.user.email
          }
        };

        const userRoom = `${userId}:${channel}`;
        console.log('Emitiendo a sala:', userRoom);
        
        io.to(userRoom).emit('new-admin-message', {
          chatId: chat._id,
          channel,
          message: messageWithSender
        });

        socket.broadcast.emit('admin-message-sent', {
          chatId: chat._id,
          channel,
          userId,
          message: messageWithSender
        });
        
        socket.emit('admin-message-confirmed', {
          chatId: chat._id,
          message: messageWithSender
        });

        console.log('Mensaje de admin procesado');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      } catch (error) {
        console.error('Error sending admin message:', error);
        socket.emit('error', { message: 'Error sending admin message: ' + error.message });
      }
    });

    // Usuario escribiendo
    socket.on('typing', ({ userId, channel }) => {
      const roomName = `${userId}:${channel}`;
      
      if (socket.user.rol === 'administrador') {
        io.to(roomName).emit('admin-typing', {
          adminName: socket.user.nombre,
          channel
        });
      } else {
        socket.broadcast.emit('user-typing', {
          userId,
          channel,
          userName: socket.user.nombre
        });
      }
    });

    socket.on('stop-typing', ({ userId, channel }) => {
      const roomName = `${userId}:${channel}`;
      
      if (socket.user.rol === 'administrador') {
        io.to(roomName).emit('admin-stop-typing', { channel });
      } else {
        socket.broadcast.emit('user-stop-typing', { userId, channel });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.user.nombre} (${socket.id})`);
    });
  });

  io.engine.on('connection_error', (err) => {
    console.error('Error de conexión:', err.message);
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
