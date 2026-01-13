const Order = require('../../models/Order');
const Cart = require('../../models/Cart');
const Product = require('../../models/Product');
const { GraphQLError } = require('graphql');

const orderResolvers = {
  Query: {
    // Obtener órdenes del usuario autenticado
    myOrders: async (_, __, { user }) => {
      if (!user) {
        throw new GraphQLError('No autenticado', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const orders = await Order.find({ usuario: user.id })
        .populate('usuario')
        .populate('items.producto')
        .sort({ createdAt: -1 });

      return orders;
    },

    // Obtener orden por ID
    order: async (_, { id }, { user }) => {
      if (!user) {
        throw new GraphQLError('No autenticado', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const order = await Order.findById(id)
        .populate('usuario')
        .populate('items.producto');

      if (!order) {
        throw new GraphQLError('Orden no encontrada', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      // Verificar que el usuario sea dueño de la orden o sea admin
      if (order.usuario._id.toString() !== user.id && user.rol !== 'administrador') {
        throw new GraphQLError('No autorizado', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      return order;
    },

    // Obtener orden por número de orden
    orderByNumber: async (_, { numeroOrden }, { user }) => {
      if (!user) {
        throw new GraphQLError('No autenticado', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const order = await Order.findOne({ numeroOrden })
        .populate('usuario')
        .populate('items.producto');

      if (!order) {
        throw new GraphQLError('Orden no encontrada', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      // Verificar que el usuario sea dueño de la orden o sea admin
      if (order.usuario._id.toString() !== user.id && user.rol !== 'administrador') {
        throw new GraphQLError('No autorizado', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      return order;
    },

    // Admin: Obtener todas las órdenes (con filtro opcional)
    allOrders: async (_, { estado }, { user }) => {
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

      const filter = {};
      if (estado) {
        filter.estado = estado;
      }

      const orders = await Order.find(filter)
        .populate('usuario')
        .populate('items.producto')
        .sort({ createdAt: -1 });

      return orders;
    }
  },

  Mutation: {
    // Crear orden desde el carrito
    createOrder: async (_, __, { user }) => {
      if (!user) {
        throw new GraphQLError('No autenticado', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      // Obtener carrito del usuario
      const cart = await Cart.findOne({ usuario: user.id, activo: true })
        .populate('items.producto');

      if (!cart || cart.items.length === 0) {
        throw new GraphQLError('El carrito está vacío', {
          extensions: { code: 'BAD_REQUEST' }
        });
      }

      // Verificar stock de todos los productos
      for (const item of cart.items) {
        const producto = await Product.findById(item.producto._id);
        
        if (!producto) {
          throw new GraphQLError(`Producto ${item.producto.nombre} no encontrado`, {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        if (!producto.disponible) {
          throw new GraphQLError(`Producto ${item.producto.nombre} no está disponible`, {
            extensions: { code: 'BAD_REQUEST' }
          });
        }

        if (producto.stock < item.cantidad) {
          throw new GraphQLError(`Stock insuficiente para ${item.producto.nombre}. Solo hay ${producto.stock} unidades disponibles`, {
            extensions: { code: 'BAD_REQUEST' }
          });
        }
      }

      // Calcular totales - USAR precioUnitario * cantidad, NO subtotal
      const subtotal = cart.items.reduce((total, item) => {
        return total + (item.precioUnitario * item.cantidad);
      }, 0);
      const impuestos = subtotal * 0.16;
      const total = subtotal + impuestos;

      // Generar número de orden
      const numeroOrden = await Order.generateOrderNumber();

      // Crear orden - CALCULAR subtotal de cada item
      const orderItems = cart.items.map(item => ({
        producto: item.producto._id,
        nombre: item.producto.nombre,
        imagen: item.producto.imagen,
        cantidad: item.cantidad,
        talla: item.talla,
        color: item.color,
        precioUnitario: item.precioUnitario,
        subtotal: item.precioUnitario * item.cantidad  // ← CALCULAR AQUÍ
      }));

      const order = await Order.create({
        usuario: user.id,
        numeroOrden,
        items: orderItems,
        subtotal,
        impuestos,
        total,
        estado: 'en-curso'
      });

      // Reducir stock de productos y actualizar disponibilidad
      for (const item of cart.items) {
        const newStock = item.producto.stock - item.cantidad;
        const updateData = { stock: newStock };
        
        // Si el stock llega a 0, marcar como no disponible
        if (newStock === 0) {
          updateData.disponible = false;
        }
        
        await Product.findByIdAndUpdate(item.producto._id, updateData);
      }

      // Limpiar carrito
      cart.clear();
      await cart.save();

      // Retornar orden poblada
      const populatedOrder = await Order.findById(order._id)
        .populate('usuario')
        .populate('items.producto');

      return populatedOrder;
    },

    // Cancelar orden
    cancelOrder: async (_, { input }, { user }) => {
      if (!user) {
        throw new GraphQLError('No autenticado', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const { orderId, motivo } = input;

      const order = await Order.findById(orderId)
        .populate('usuario')
        .populate('items.producto');

      if (!order) {
        throw new GraphQLError('Orden no encontrada', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      // Verificar que el usuario sea dueño de la orden
      if (order.usuario._id.toString() !== user.id) {
        throw new GraphQLError('No autorizado', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      // Verificar que la orden no esté completada o cancelada
      if (order.estado === 'completada') {
        throw new GraphQLError('No se puede cancelar una orden completada', {
          extensions: { code: 'BAD_REQUEST' }
        });
      }

      if (order.estado === 'cancelada') {
        throw new GraphQLError('Esta orden ya está cancelada', {
          extensions: { code: 'BAD_REQUEST' }
        });
      }

      // Restaurar stock de productos y actualizar disponibilidad
      for (const item of order.items) {
        const producto = await Product.findById(item.producto._id);
        if (producto) {
          const newStock = producto.stock + item.cantidad;
          const updateData = { stock: newStock };
          
          // Si el producto estaba en 0, volver a marcarlo como disponible
          if (producto.stock === 0 && newStock > 0) {
            updateData.disponible = true;
          }
          
          await Product.findByIdAndUpdate(item.producto._id, updateData);
        }
      }

      // Actualizar orden
      order.estado = 'cancelada';
      order.fechaCancelada = new Date();
      order.motivoCancelacion = motivo;
      await order.save();

      return order;
    },

    // Admin: Completar orden
    completeOrder: async (_, { orderId }, { user }) => {
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

      const order = await Order.findById(orderId)
        .populate('usuario')
        .populate('items.producto');

      if (!order) {
        throw new GraphQLError('Orden no encontrada', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      if (order.estado === 'cancelada') {
        throw new GraphQLError('No se puede completar una orden cancelada', {
          extensions: { code: 'BAD_REQUEST' }
        });
      }

      if (order.estado === 'completada') {
        throw new GraphQLError('Esta orden ya está completada', {
          extensions: { code: 'BAD_REQUEST' }
        });
      }

      order.estado = 'completada';
      order.fechaCompletada = new Date();
      await order.save();

      return order;
    }
  },

  // Field resolvers
  OrderItem: {
    id: (parent) => parent._id.toString(),
    subtotal: (parent) => parent.precioUnitario * parent.cantidad
  },

  Order: {
    id: (parent) => parent._id.toString()
  }
};

module.exports = orderResolvers;