const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  let error = { ...err };
  error.message = err.message;

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message);
    error.message = message;
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} ya existe`;
    return res.status(400).json({
      success: false,
      message: message
    });
  }

  if (err.name === 'CastError') {
    const message = 'ID de recurso no válido';
    return res.status(404).json({
      success: false,
      message: message
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Error del servidor'
  });
};

module.exports = errorHandler;
