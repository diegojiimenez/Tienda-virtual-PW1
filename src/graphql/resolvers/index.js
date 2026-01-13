const cartResolvers = require('./cartResolvers');
const orderResolvers = require('./orderResolvers');

const resolvers = {
  Query: {
    ...cartResolvers.Query,
    ...orderResolvers.Query
  },
  Mutation: {
    ...cartResolvers.Mutation,
    ...orderResolvers.Mutation
  },
  CartItem: cartResolvers.CartItem,
  Cart: cartResolvers.Cart,
  OrderItem: orderResolvers.OrderItem,
  Order: orderResolvers.Order,
  Product: cartResolvers.Product,
  User: cartResolvers.User
};

module.exports = resolvers;