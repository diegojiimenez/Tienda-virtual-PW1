const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: ['camisas', 'pantalones', 'vestidos', 'zapatos', 'accesorios', 'otros'],
    default: 'otros'
  },
  tallas: [{
    type: String
  }],
  colores: [{
    type: String
  }],
  stock: {
    type: Number,
    required: [true, 'El stock es obligatorio'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  imagen: {
    type: String,
    default: 'https://via.placeholder.com/300x400?text=Producto'
  },
  disponible: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Índice para búsquedas más rápidas
productSchema.index({ nombre: 'text', descripcion: 'text' });

module.exports = mongoose.model('Product', productSchema);
