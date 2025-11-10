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
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

connectDB();

if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chats', require('./src/routes/chatRoutes'));

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
const frontendDist = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendDist));

app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDist, 'index.html'));
  } else {
    next();
  }
});

app.use(errorHandler);

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

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

module.exports = { app, server, io };
