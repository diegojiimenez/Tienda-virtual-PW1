const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  usuario: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mensaje: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índice para consultas más rápidas
messageSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema);
