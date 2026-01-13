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
const adminRoutes = require('./src/routes/adminRoutes'); // ← AGREGAR
const { createApolloServer, getGraphQLMiddleware } = require('./src/config/apollo');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

async function startServer() {
  await connectDB();

  // Middleware básico
  if (process.env.NODE_ENV !== 'production') {
    app.use(cors({
      origin: 'http://localhost:5173',
      credentials: true
    }));
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // Inicializar Apollo Server
  const apolloServer = await createApolloServer();
  
  // GraphQL middleware ANTES de las rutas REST
  const graphqlMiddleware = getGraphQLMiddleware(apolloServer);
  app.use('/graphql', graphqlMiddleware);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      mongodb: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
      graphql: '/graphql'
    });
  });

  // Rutas REST (NO TOCAR)
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/chats', chatRoutes);
  app.use('/api/admin', adminRoutes); // ← AGREGAR

  // Servir frontend en producción
  const frontendDist = path.join(__dirname, 'frontend', 'dist');
  app.use(express.static(frontendDist));

  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/graphql')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    } else {
      next();
    }
  });

  app.use(errorHandler);

  initializeSocket(io);

  const PORT = process.env.PORT || 3000;

  server.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(60));
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ MongoDB: ${require('mongoose').connection.readyState === 1 ? 'conectado' : 'desconectado'}`);
    console.log(`✓ API REST: /api`);
    console.log(`✓ GraphQL: http://localhost:${PORT}/graphql`);
    console.log(`✓ Socket.IO: habilitado`);
    console.log('='.repeat(60));
  });
}

startServer().catch(err => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});

module.exports = { app, server, io };
