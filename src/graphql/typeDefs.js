const { gql } = require('graphql-tag');

const typeDefs = gql`
  type User {
    id: ID!
    nombre: String!
    apellido: String!
    email: String!
    rol: String!
    activo: Boolean!
    createdAt: String!
  }

  type Product {
    id: ID!
    nombre: String!
    descripcion: String!
    precio: Float!
    categoria: String!
    tallas: [String!]!
    colores: [String!]!
    stock: Int!
    imagen: String
    disponible: Boolean!
    createdAt: String!
  }

  type CartItem {
    id: ID!
    producto: Product!
    cantidad: Int!
    talla: String!
    color: String!
    precioUnitario: Float!
    subtotal: Float!
  }

  type Cart {
    id: ID!
    usuario: User!
    items: [CartItem!]!
    total: Float!
    activo: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  # ===== NUEVOS TIPOS PARA ÓRDENES =====
  
  type OrderItem {
    id: ID!
    producto: Product!
    nombre: String!
    imagen: String
    cantidad: Int!
    talla: String!
    color: String!
    precioUnitario: Float!
    subtotal: Float!
  }

  type Order {
    id: ID!
    usuario: User!
    numeroOrden: String!
    items: [OrderItem!]!
    subtotal: Float!
    impuestos: Float!
    total: Float!
    estado: String!
    fechaOrden: String!
    fechaCompletada: String
    fechaCancelada: String
    motivoCancelacion: String
    createdAt: String!
    updatedAt: String!
  }

  # ===== INPUTS =====

  input AddToCartInput {
    productoId: ID!
    cantidad: Int!
    talla: String!
    color: String!
  }

  input UpdateCartItemInput {
    itemId: ID!
    cantidad: Int!
  }

  input CancelOrderInput {
    orderId: ID!
    motivo: String!
  }

  # ===== QUERIES =====

  type Query {
    # Carrito
    myCart: Cart
    cart(id: ID!): Cart
    
    # Órdenes
    myOrders: [Order!]!
    order(id: ID!): Order
    orderByNumber(numeroOrden: String!): Order
    
    # Admin - Órdenes
    allOrders(estado: String): [Order!]!
  }

  # ===== MUTATIONS =====

  type Mutation {
    # Carrito
    addToCart(input: AddToCartInput!): Cart!
    updateCartItem(input: UpdateCartItemInput!): Cart!
    removeFromCart(itemId: ID!): Cart!
    clearCart: Cart!
    
    # Órdenes
    createOrder: Order!
    cancelOrder(input: CancelOrderInput!): Order!
    
    # Admin - Órdenes
    completeOrder(orderId: ID!): Order!
  }
`;

module.exports = typeDefs;