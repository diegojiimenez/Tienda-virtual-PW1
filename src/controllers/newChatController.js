const Chat = require('../models/Chat');

const channelNames = {
  'orders': 'Order Inquiry',
  'customer-support': 'Customer Support',
  'admin': 'Admin',
  'shipping': 'Shipping'
};

exports.getOrCreateChat = async (req, res) => {
  try {
    const { channel } = req.params;
    const userId = req.user.id;

    if (!['orders', 'customer-support', 'admin', 'shipping'].includes(channel)) {
      return res.status(400).json({
        success: false,
        message: 'Canal inválido'
      });
    }

    let chat = await Chat.findOne({ user: userId, channel })
      .populate('user', 'nombre apellido email')
      .populate('messages.sender', 'nombre apellido rol');

    if (!chat) {
      chat = await Chat.create({
        user: userId,
        channel,
        channelName: channelNames[channel],
        messages: []
      });

      chat = await Chat.findById(chat._id)
        .populate('user', 'nombre apellido email')
        .populate('messages.sender', 'nombre apellido rol');
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const channels = ['orders', 'customer-support', 'admin', 'shipping'];
    const chats = [];

    for (const channel of channels) {
      let chat = await Chat.findOne({ user: userId, channel })
        .populate('user', 'nombre apellido email')
        .populate('messages.sender', 'nombre apellido rol');

      if (!chat) {
        chat = await Chat.create({
          user: userId,
          channel,
          channelName: channelNames[channel],
          messages: []
        });

        chat = await Chat.findById(chat._id)
          .populate('user', 'nombre apellido email')
          .populate('messages.sender', 'nombre apellido rol');
      }

      chats.push(chat);
    }

    res.json({
      success: true,
      data: chats.sort((a, b) => b.lastMessage - a.lastMessage)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { channel } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.rol === 'administrador';

    let chat = await Chat.findOne({ user: userId, channel });

    if (!chat) {
      chat = await Chat.create({
        user: userId,
        channel,
        channelName: channelNames[channel],
        messages: []
      });
    }

    const newMessage = {
      sender: req.user.id,
      senderType: isAdmin ? 'admin' : 'user',
      content,
      read: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = new Date();

    if (isAdmin) {
      chat.unreadCount.user += 1;
    } else {
      chat.unreadCount.admin += 1;
    }

    await chat.save();

    chat = await Chat.findById(chat._id)
      .populate('user', 'nombre apellido email')
      .populate('messages.sender', 'nombre apellido rol');

    const messageToSend = chat.messages[chat.messages.length - 1];

    res.json({
      success: true,
      data: {
        message: messageToSend,
        chat: chat
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { channel } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.rol === 'administrador';

    const chat = await Chat.findOne({ user: userId, channel });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    chat.messages.forEach(msg => {
      if (!msg.read && msg.senderType !== (isAdmin ? 'admin' : 'user')) {
        msg.read = true;
      }
    });

    if (isAdmin) {
      chat.unreadCount.admin = 0;
    } else {
      chat.unreadCount.user = 0;
    }

    await chat.save();

    res.json({
      success: true,
      message: 'Mensajes marcados como leídos'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllChats = async (req, res) => {
  try {
    const { channel, status } = req.query;
    
    const filter = {};
    if (channel) filter.channel = channel;
    if (status) filter.status = status;

    const chats = await Chat.find(filter)
      .populate('user', 'nombre apellido email')
      .populate('messages.sender', 'nombre apellido rol')
      .sort({ lastMessage: -1 });

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAdminChat = async (req, res) => {
  try {
    const { userId, channel } = req.params;

    const chat = await Chat.findOne({ user: userId, channel })
      .populate('user', 'nombre apellido email')
      .populate('messages.sender', 'nombre apellido rol');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.closeChat = async (req, res) => {
  try {
    const { channel } = req.params;
    const userId = req.user.rol === 'administrador' 
      ? req.body.userId 
      : req.user.id;

    const chat = await Chat.findOne({ user: userId, channel });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat no encontrado'
      });
    }

    chat.status = 'closed';
    await chat.save();

    res.json({
      success: true,
      message: 'Chat cerrado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};