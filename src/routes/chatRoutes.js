const express = require('express');
const router = express.Router();
const { getMessages, cleanupMessages } = require('../controllers/chatController');
const chatController = require('../controllers/chatController'); 
const {
  getOrCreateChat,
  sendMessage,
  markAsRead,
  getUserChats,
  getAllChats,
  getAdminChat,
  closeChat
} = require('../controllers/newChatController');
const { protect, authorize } = require('../middleware/auth');

// Rutas antiguas (mantener por compatibilidad)
router.get('/messages', protect, getMessages);
router.delete('/messages/cleanup', protect, authorize('administrador'), cleanupMessages);

// Nuevas rutas para chat con canales
router.get('/my-chats', protect, getUserChats);
router.get('/:channel', protect, getOrCreateChat);
router.post('/:channel/message', protect, sendMessage);
router.put('/:channel/read', protect, chatController.markAsRead); 
router.put('/:channel/close', protect, closeChat);

// Rutas para admin
router.get('/admin/all', protect, authorize('administrador'), getAllChats);
router.get('/admin/:userId/:channel', protect, authorize('administrador'), getAdminChat);

module.exports = router;