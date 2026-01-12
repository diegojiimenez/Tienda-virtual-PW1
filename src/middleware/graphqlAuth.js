const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getUser = async (token) => {
  if (!token) {
    return null;
  }

  try {
    // Remover "Bearer " si existe
    const tokenWithoutBearer = token.replace('Bearer ', '');
    
    // Verificar token
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    
    // Buscar usuario
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.activo) {
      return null;
    }

    return {
      id: user._id.toString(),
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol
    };
  } catch (error) {
    console.error('Error en autenticación GraphQL:', error.message);
    return null;
  }
};

module.exports = { getUser };