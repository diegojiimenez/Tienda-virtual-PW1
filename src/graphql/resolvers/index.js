const cartResolvers = require('./cartResolvers');

const resolvers = {
  Query: {
    ...cartResolvers.Query
  },
  Mutation: {
    ...cartResolvers.Mutation
  },
  CartItem: cartResolvers.CartItem,
  Cart: cartResolvers.Cart,
  Product: cartResolvers.Product,
  User: cartResolvers.User
};

module.exports = resolvers;