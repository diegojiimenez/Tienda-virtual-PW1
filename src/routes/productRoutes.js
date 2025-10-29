const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Rutas públicas
router.get('/', getProducts);
router.get('/:id', getProduct);

// Rutas protegidas solo para administradores
router.post('/', protect, authorize('administrador'), createProduct);
router.put('/:id', protect, authorize('administrador'), updateProduct);
router.delete('/:id', protect, authorize('administrador'), deleteProduct);

module.exports = router;
