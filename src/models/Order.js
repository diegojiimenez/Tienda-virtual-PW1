const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  imagen: String,
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  talla: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  precioUnitario: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  numeroOrden: {
    type: String,
    required: true,
    unique: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  impuestos: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  estado: {
    type: String,
    enum: ['en-curso', 'completada', 'cancelada'],
    default: 'en-curso'
  },
  fechaOrden: {
    type: Date,
    default: Date.now
  },
  fechaCompletada: Date,
  fechaCancelada: Date,
  motivoCancelacion: String
}, {
  timestamps: true
});

// Índices (SOLO UNO POR CAMPO)
orderSchema.index({ usuario: 1, createdAt: -1 });
orderSchema.index({ numeroOrden: 1 }); // ← SOLO UNA VEZ
orderSchema.index({ estado: 1 });

// Método para generar número de orden único
orderSchema.statics.generateOrderNumber = async function() {
  const count = await this.countDocuments();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}-${count + 1}`;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;