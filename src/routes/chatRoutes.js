const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/auth');

// Rutas para usuarios
router.get('/my-chats', protect, chatController.getUserChats);
router.get('/:channel', protect, chatController.getOrCreateChat);
router.post('/:channel/message', protect, chatController.sendMessage);
router.put('/:channel/read', protect, chatController.markAsRead);
router.put('/:channel/close', protect, chatController.closeChat);

// Rutas para admin
router.get('/admin/all', protect, authorize('administrador'), chatController.getAllChats);
router.get('/admin/:userId/:channel', protect, authorize('administrador'), chatController.getAdminChat);

// Rutas antiguas (mantener por compatibilidad)
router.get('/messages', protect, chatController.getMessages);
router.delete('/messages/cleanup', protect, authorize('administrador'), chatController.cleanupMessages);

module.exports = router;