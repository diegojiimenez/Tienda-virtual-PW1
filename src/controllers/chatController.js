const Message = require('../models/Message');


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
