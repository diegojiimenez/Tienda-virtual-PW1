const Message = require('../models/Message');
const Chat = require('../models/Chat');

// Obtener todos los chats del usuario
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const channels = ['orders', 'customer-support', 'admin', 'shipping'];
    const chats = [];

    // Crear o obtener cada canal
    for (const channel of channels) {
      let chat = await Chat.findOne({ user: userId, channel })
        .populate('user', 'nombre apellido email');

      if (!chat) {
        // Crear el chat si no existe
        chat = await Chat.create({
          user: userId,
          channel,
          channelName: getChannelName(channel),
          messages: [],
          unreadCount: { user: 0, admin: 0 },
          status: 'active'
        });

        chat = await Chat.findById(chat._id)
          .populate('user', 'nombre apellido email');
      }

      chats.push(chat);
    }

    res.json({
      success: true,
      data: chats.sort((a, b) => new Date(b.lastMessage) - new Date(a.lastMessage))
    });
  } catch (error) {
    console.error('Error getting user chats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener o crear un chat
exports.getOrCreateChat = async (req, res) => {
  try {
    const { channel } = req.params;
    const userId = req.user._id;

    let chat = await Chat.findOne({ user: userId, channel })
      .populate('user', 'nombre apellido email');

    if (!chat) {
      chat = await Chat.create({
        user: userId,
        channel,
        channelName: getChannelName(channel),
        messages: [],
        unreadCount: { user: 0, admin: 0 },
        status: 'active'
      });
      
      chat = await Chat.findById(chat._id)
        .populate('user', 'nombre apellido email');
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error getting or creating chat:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Enviar mensaje
exports.sendMessage = async (req, res) => {
  try {
    const { channel } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    let chat = await Chat.findOne({ user: userId, channel });

    if (!chat) {
      chat = await Chat.create({
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
      sender: userId,
      senderType: 'user',
      createdAt: new Date()
    };

    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    chat.unreadCount.admin += 1;

    await chat.save();

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Marcar chat como leído
exports.markAsRead = async (req, res) => {
  try {
    const { channel } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.rol === 'administrador';

    console.log('Marking as read:', { channel, userId, isAdmin });

    const chat = await Chat.findOne({ 
      user: isAdmin ? req.body.userId : userId, 
      channel 
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Resetear contador según el rol
    if (isAdmin) {
      chat.unreadCount.admin = 0;
    } else {
      chat.unreadCount.user = 0;
    }

    await chat.save();

    console.log('Chat marked as read:', chat._id, chat.unreadCount);

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error marking chat as read:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cerrar chat
exports.closeChat = async (req, res) => {
  try {
    const { channel } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOne({ user: userId, channel });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    chat.status = 'closed';
    await chat.save();

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error closing chat:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener todos los chats (ADMIN)
exports.getAllChats = async (req, res) => {
  try {
    const { channel, status } = req.query;
    
    const filter = {};
    if (channel) filter.channel = channel;
    if (status) filter.status = status;

    const chats = await Chat.find(filter)
      .populate('user', 'nombre apellido email')
      .sort({ lastMessage: -1 });

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Error getting all chats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener chat específico (ADMIN)
exports.getAdminChat = async (req, res) => {
  try {
    const { userId, channel } = req.params;

    const chat = await Chat.findOne({ user: userId, channel })
      .populate('user', 'nombre apellido email');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error getting admin chat:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Funciones antiguas (mantener por compatibilidad)
exports.getMessages = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const messages = await Message.find()
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'nombre email');

    messages.reverse();

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.saveMessage = async (messageData) => {
  try {
    const message = await Message.create(messageData);
    return await message.populate('userId', 'nombre email');
  } catch (error) {
    console.error('Error guardando mensaje:', error);
    throw error;
  }
};

exports.cleanupMessages = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - parseInt(days));

    const result = await Message.deleteMany({
      timestamp: { $lt: fecha }
    });

    res.status(200).json({
      success: true,
      message: `Se eliminaron ${result.deletedCount} mensajes antiguos`,
      deleted: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function
function getChannelName(channel) {
  const channelNames = {
    'orders': 'Order Inquiry',
    'customer-support': 'Customer Support',
    'admin': 'Admin Contact',
    'shipping': 'Shipping'
  };
  return channelNames[channel] || 'Unknown Channel';
}