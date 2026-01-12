const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1'],
    default: 1
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
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    default: 0,
    min: 0
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calcular el total antes de guardar
cartSchema.pre('save', function(next) {
  this.total = this.items.reduce((sum, item) => {
    return sum + (item.precioUnitario * item.cantidad);
  }, 0);
  next();
});

// Método para agregar item al carrito
cartSchema.methods.addItem = function(productoId, cantidad, talla, color, precio) {
  const existingItemIndex = this.items.findIndex(item => 
    item.producto.toString() === productoId.toString() &&
    item.talla === talla &&
    item.color === color
  );

  if (existingItemIndex > -1) {
    // Si ya existe, actualizar cantidad
    this.items[existingItemIndex].cantidad += cantidad;
  } else {
    // Si no existe, agregar nuevo item
    this.items.push({
      producto: productoId,
      cantidad,
      talla,
      color,
      precioUnitario: precio
    });
  }
};

// Método para actualizar cantidad de un item
cartSchema.methods.updateItemQuantity = function(itemId, cantidad) {
  const item = this.items.id(itemId);
  if (item) {
    item.cantidad = cantidad;
  }
};

// Método para remover item
cartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
};

// Método para limpiar carrito
cartSchema.methods.clear = function() {
  this.items = [];
  this.total = 0;
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;