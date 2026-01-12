const Cart = require('../../models/Cart');
const Product = require('../../models/Product');
const { GraphQLError } = require('graphql');

const cartResolvers = {
  Query: {
    // Obtener carrito del usuario autenticado
    myCart: async (_, __, { user }) => {
      if (!user) {
        throw new GraphQLError('No autenticado', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      let cart = await Cart.findOne({ usuario: user.id, activo: true })
        .populate('usuario')
        .populate('items.producto');

      // Si no existe carrito, crear uno nuevo
      if (!cart) {
        cart = await Cart.create({
          usuario: user.id,
          items: [],
          total: 0
        });
        cart = await Cart.findById(cart._id)
          .populate('usuario')
          .populate('items.producto');
      }

      return cart;
    },

    // Obtener carrito por ID (solo admin)
    cart: async (_, { id }, { user }) => {
      if (!user) {
        throw new GraphQLError('No autenticado', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      if (user.rol !== 'administrador') {
        throw new GraphQLError('No autorizado', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      const cart = await Cart.findById(id)
        .populate('usuario')
        .populate('items.producto');

      if (!cart) {
        throw new GraphQLError('Carrito no encontrado', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      return cart;
    }
  },

  Mutation: {
    // Agregar producto al carrito
    addToCart: async (_, { input }, { user }) => {
      if (!user) {
        throw new GraphQLError('No autenticado', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const { productoId, cantidad, talla, color } = input;

      // Verificar que el producto existe
      const producto = await Product.findById(productoId);
      if (!producto) {
        throw new GraphQLError('Producto no encontrado', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      // Verificar que el producto está disponible
      if (!producto.disponible) {
        throw new GraphQLError('Producto no disponible', {
          extensions: { code: 'BAD_REQUEST' }
        });
      }

      // Verificar stock
      if (producto.stock < cantidad) {
        throw new GraphQLError(`Stock insuficiente. Solo hay ${producto.stock} unidades disponibles`, {
          extensions: { code: 'BAD_REQUEST' }
        });
      }

      // Verificar que la talla existe
      if (!producto.tallas.includes(talla)) {
        throw new GraphQLError('Talla no disponible para este producto', {
          extensions: { code: 'BAD_REQUEST' }
        });
      }

      // Verificar que el color existe
      if (!producto.colores.includes(color)) {
        throw new GraphQLError('Color no disponible para este producto', {
          extensions: { code: 'BAD_REQUEST' }
        });
      }

      // Buscar o crear carrito
      let cart = await Cart.findOne({ usuario: user.id, activo: true });
      
      if (!cart) {
        cart = new Cart({
          usuario: user.id,
          items: []
        });
      }

      // Agregar item al carrito
      cart.addItem(productoId, cantidad, talla, color, producto.precio);

      await cart.save();

      // Retornar carrito poblado
      cart = await Cart.findById(cart._id)
        .populate('usuario')
        .populate('items.producto');

      return cart;
    },

    // Actualizar cantidad de un item
    updateCartItem: async (_, { input }, { user }) => {
      if (!user) {
        throw new GraphQLError('No autenticado', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const { itemId, cantidad } = input;

      if (cantidad < 1) {
        throw new GraphQLError('La cantidad debe ser al menos 1', {
          extensions: { code: 'BAD_REQUEST' }
        });
      }

      const cart = await Cart.findOne({ usuario: user.id, activo: true });

      if (!cart) {
        throw new GraphQLError('Carrito no encontrado', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      const item = cart.items.id(itemId);
      if (!item) {
        throw new GraphQLError('Item no encontrado en el carrito', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      // Verificar stock del producto
      const producto = await Product.findById(item.producto);
      if (producto.stock < cantidad) {
        throw new GraphQLError(`Stock insuficiente. Solo hay ${producto.stock} unidades disponibles`, {
          extensions: { code: 'BAD_REQUEST' }
        });
      }

      cart.updateItemQuantity(itemId, cantidad);
      await cart.save();

      // Retornar carrito poblado
      const updatedCart = await Cart.findById(cart._id)
        .populate('usuario')
        .populate('items.producto');

      return updatedCart;
    },

    // Remover item del carrito
    removeFromCart: async (_, { itemId }, { user }) => {
      if (!user) {
        throw new GraphQLError('No autenticado', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const cart = await Cart.findOne({ usuario: user.id, activo: true });

      if (!cart) {
        throw new GraphQLError('Carrito no encontrado', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      cart.removeItem(itemId);
      await cart.save();

      // Retornar carrito poblado
      const updatedCart = await Cart.findById(cart._id)
        .populate('usuario')
        .populate('items.producto');

      return updatedCart;
    },

    // Limpiar carrito
    clearCart: async (_, __, { user }) => {
      if (!user) {
        throw new GraphQLError('No autenticado', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const cart = await Cart.findOne({ usuario: user.id, activo: true });

      if (!cart) {
        throw new GraphQLError('Carrito no encontrado', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      cart.clear();
      await cart.save();

      // Retornar carrito poblado
      const updatedCart = await Cart.findById(cart._id)
        .populate('usuario')
        .populate('items.producto');

      return updatedCart;
    }
  },

  // Field resolvers
  CartItem: {
    id: (parent) => parent._id.toString(),
    subtotal: (parent) => parent.precioUnitario * parent.cantidad
  },

  Cart: {
    id: (parent) => parent._id.toString()
  },

  Product: {
    id: (parent) => parent._id.toString()
  },

  User: {
    id: (parent) => parent._id.toString()
  }
};

module.exports = cartResolvers;