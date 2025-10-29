const express = require('express');
const router = express.Router();
const { getMessages, cleanupMessages } = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/auth');

// Todas las rutas del chat requieren autenticación
router.get('/messages', protect, getMessages);
router.delete('/messages/cleanup', protect, authorize('administrador'), cleanupMessages);

module.exports = router;
