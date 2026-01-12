import api from './api'

class CartService {
  // Cliente GraphQL simple usando fetch
  async graphqlRequest(query, variables = {}) {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          query,
          variables
        })
      })

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors[0].message)
      }

      return result.data
    } catch (error) {
      console.error('GraphQL Error:', error)
      throw error
    }
  }

  async getMyCart() {
    const query = `
      query MyCart {
        myCart {
          id
          items {
            id
            producto {
              id
              nombre
              descripcion
              precio
              categoria
              imagen
              disponible
              stock
            }
            cantidad
            talla
            color
            precioUnitario
            subtotal
          }
          total
        }
      }
    `

    const data = await this.graphqlRequest(query)
    return data.myCart
  }

  async addToCart({ productoId, cantidad, talla, color }) {
    const mutation = `
      mutation AddToCart($input: AddToCartInput!) {
        addToCart(input: $input) {
          id
          items {
            id
            producto {
              id
              nombre
              descripcion
              precio
              categoria
              imagen
              disponible
              stock
            }
            cantidad
            talla
            color
            precioUnitario
            subtotal
          }
          total
        }
      }
    `

    const variables = {
      input: { productoId, cantidad, talla, color }
    }

    const data = await this.graphqlRequest(mutation, variables)
    return data.addToCart
  }

  async updateCartItem({ itemId, cantidad }) {
    const mutation = `
      mutation UpdateCartItem($input: UpdateCartItemInput!) {
        updateCartItem(input: $input) {
          id
          items {
            id
            producto {
              id
              nombre
              descripcion
              precio
              categoria
              imagen
              disponible
              stock
            }
            cantidad
            talla
            color
            precioUnitario
            subtotal
          }
          total
        }
      }
    `

    const variables = {
      input: { itemId, cantidad }
    }

    const data = await this.graphqlRequest(mutation, variables)
    return data.updateCartItem
  }

  async removeFromCart(itemId) {
    const mutation = `
      mutation RemoveFromCart($itemId: ID!) {
        removeFromCart(itemId: $itemId) {
          id
          items {
            id
            producto {
              id
              nombre
              descripcion
              precio
              categoria
              imagen
              disponible
              stock
            }
            cantidad
            talla
            color
            precioUnitario
            subtotal
          }
          total
        }
      }
    `

    const variables = { itemId }

    const data = await this.graphqlRequest(mutation, variables)
    return data.removeFromCart
  }

  async clearCart() {
    const mutation = `
      mutation ClearCart {
        clearCart {
          id
          items {
            id
            producto {
              id
              nombre
              descripcion
              precio
              categoria
              imagen
              disponible
              stock
            }
            cantidad
            talla
            color
            precioUnitario
            subtotal
          }
          total
        }
      }
    `

    const data = await this.graphqlRequest(mutation)
    return data.clearCart
  }
}

export default new CartService()