const express = require('express');
const router = express.Router();
const { getMessages, cleanupMessages } = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/auth');

router.get('/messages', protect, getMessages);
router.delete('/messages/cleanup', protect, authorize('administrador'), cleanupMessages);

module.exports = router;
