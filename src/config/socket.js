const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { saveMessage } = require('../controllers/chatController');

const usuarios = new Map();

const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Token no proporcionado'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !user.activo) {
        return next(new Error('Usuario no autorizado'));
      }

      socket.userId = user._id.toString();
      socket.userName = user.nombre;
      socket.userRole = user.rol;

      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Usuario conectado al chat: ${socket.userName} (${socket.userId})`);

    usuarios.set(socket.userId, {
      socketId: socket.id,
      nombre: socket.userName,
      rol: socket.userRole
    });

    io.emit('usuarios-conectados', Array.from(usuarios.values()));

    socket.broadcast.emit('usuario-conectado', {
      nombre: socket.userName,
      mensaje: `${socket.userName} se ha unido al chat`
    });

    socket.on('escribiendo', () => {
      socket.broadcast.emit('usuario-escribiendo', {
        usuario: socket.userName
      });
    });

    socket.on('dejo-de-escribir', () => {
      socket.broadcast.emit('usuario-dejo-de-escribir', {
        usuario: socket.userName
      });
    });

    socket.on('mensaje', async (data) => {
      try {
        const mensajeData = {
          usuario: socket.userName,
          userId: socket.userId,
          mensaje: data.mensaje,
          timestamp: new Date()
        };

        const mensajeGuardado = await saveMessage(mensajeData);

        io.emit('mensaje', {
          id: mensajeGuardado._id,
          usuario: mensajeGuardado.usuario,
          mensaje: mensajeGuardado.mensaje,
          timestamp: mensajeGuardado.timestamp,
          rol: socket.userRole
        });

        console.log(`💬 Mensaje de ${socket.userName}: ${data.mensaje}`);
      } catch (error) {
        console.error('Error al guardar mensaje:', error);
        socket.emit('error-mensaje', {
          mensaje: 'Error al enviar el mensaje'
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.userName}`);
      
      usuarios.delete(socket.userId);

      io.emit('usuarios-conectados', Array.from(usuarios.values()));

      socket.broadcast.emit('usuario-desconectado', {
        nombre: socket.userName,
        mensaje: `${socket.userName} ha salido del chat`
      });
    });
  });
};

module.exports = initializeSocket;
