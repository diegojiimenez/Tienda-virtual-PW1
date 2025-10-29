require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const connectDB = require('./src/config/database');
const initializeSocket = require('./src/config/socket');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const chatRoutes = require('./src/routes/chatRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);

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

app.use(errorHandler);

app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

initializeSocket(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`Chat con Socket.IO habilitado`);
  console.log(`JWT Autenticación activada`);
  console.log('='.repeat(50));
});

process.on('unhandledRejection', (err) => {
  console.error(`Error no manejado: ${err.message}`);
  server.close(() => process.exit(1));
});
