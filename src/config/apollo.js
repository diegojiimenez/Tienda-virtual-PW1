const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const typeDefs = require('../graphql/typeDefs');
const resolvers = require('../graphql/resolvers');
const { getUser } = require('../middleware/graphqlAuth');

async function createApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (formattedError, error) => {
      console.error('GraphQL Error:', formattedError);
      return formattedError;
    },
    introspection: process.env.NODE_ENV !== 'production',
  });

  await server.start();
  
  return server;
}

function getGraphQLMiddleware(server) {
  return expressMiddleware(server, {
    context: async ({ req }) => {
      // Extraer token del header
      const token = req.headers.authorization || '';
      
      // Obtener usuario autenticado
      const user = await getUser(token);
      
      return { user };
    }
  });
}

module.exports = { createApolloServer, getGraphQLMiddleware };