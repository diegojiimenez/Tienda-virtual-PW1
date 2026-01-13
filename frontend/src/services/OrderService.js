class OrderService {
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

  async getMyOrders() {
    const query = `
      query MyOrders {
        myOrders {
          id
          numeroOrden
          items {
            id
            producto {
              id
              nombre
              imagen
            }
            nombre
            imagen
            cantidad
            talla
            color
            precioUnitario
            subtotal
          }
          subtotal
          impuestos
          total
          estado
          fechaOrden
          fechaCompletada
          fechaCancelada
          motivoCancelacion
          createdAt
        }
      }
    `

    const data = await this.graphqlRequest(query)
    return data.myOrders
  }

  async getOrder(id) {
    const query = `
      query GetOrder($id: ID!) {
        order(id: $id) {
          id
          numeroOrden
          items {
            id
            producto {
              id
              nombre
              imagen
              descripcion
              categoria
            }
            nombre
            imagen
            cantidad
            talla
            color
            precioUnitario
            subtotal
          }
          subtotal
          impuestos
          total
          estado
          fechaOrden
          fechaCompletada
          fechaCancelada
          motivoCancelacion
          createdAt
        }
      }
    `

    const variables = { id }

    const data = await this.graphqlRequest(query, variables)
    return data.order
  }

  async createOrder() {
    const mutation = `
      mutation CreateOrder {
        createOrder {
          id
          numeroOrden
          items {
            id
            producto {
              id
              nombre
              imagen
            }
            nombre
            imagen
            cantidad
            talla
            color
            precioUnitario
            subtotal
          }
          subtotal
          impuestos
          total
          estado
          fechaOrden
          createdAt
        }
      }
    `

    const data = await this.graphqlRequest(mutation)
    return data.createOrder
  }

  async cancelOrder(orderId, motivo) {
    const mutation = `
      mutation CancelOrder($input: CancelOrderInput!) {
        cancelOrder(input: $input) {
          id
          numeroOrden
          estado
          fechaCancelada
          motivoCancelacion
        }
      }
    `

    const variables = {
      input: { orderId, motivo }
    }

    const data = await this.graphqlRequest(mutation, variables)
    return data.cancelOrder
  }
}

export default new OrderService()