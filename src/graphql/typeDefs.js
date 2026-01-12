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

  type Query {
    # Obtener el carrito del usuario autenticado
    myCart: Cart
    
    # Obtener carrito por ID (solo admin)
    cart(id: ID!): Cart
  }

  type Mutation {
    # Agregar producto al carrito
    addToCart(input: AddToCartInput!): Cart!
    
    # Actualizar cantidad de un item
    updateCartItem(input: UpdateCartItemInput!): Cart!
    
    # Remover item del carrito
    removeFromCart(itemId: ID!): Cart!
    
    # Limpiar todo el carrito
    clearCart: Cart!
  }
`;

module.exports = typeDefs;