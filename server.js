require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const connectDB = require('./src/config/database');
const initializeSocket = require('./src/config/socket');
const errorHandler = require('./src/middleware/errorHandler');

// Importar rutas
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const chatRoutes = require('./src/routes/chatRoutes');

// Crear aplicación Express
const app = express();
const server = http.createServer(app);

// Configurar Socket.IO con CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);

// Ruta principal de la API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API de Tienda de Ropa',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      chat: '/api/chat'
    }
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Servir el frontend - usando middleware en lugar de route
// Esto maneja cualquier ruta que no sea de la API
app.use((req, res, next) => {
  // Si la ruta no empieza con /api, servir el index.html
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

// Inicializar Socket.IO
initializeSocket(io);

// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`💬 Chat con Socket.IO habilitado`);
  console.log(`🔐 JWT Autenticación activada`);
  console.log('='.repeat(50));
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error(`❌ Error no manejado: ${err.message}`);
  server.close(() => process.exit(1));
});
