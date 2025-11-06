const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  getProductsTable
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');

// Rutas públicas/protegidas
router.get('/', protect, getProducts);
router.get('/:id', protect, getProduct);

// Rutas solo para admin - CAMBIAR 'admin' por 'administrador'
router.post('/', protect, authorize('administrador'), createProduct);
router.put('/:id', protect, authorize('administrador'), updateProduct);
router.delete('/:id', protect, authorize('administrador'), deleteProduct);

// Rutas de estadísticas (solo admin)
router.get('/stats/overview', protect, authorize('administrador'), getProductStats);
router.get('/stats/table', protect, authorize('administrador'), getProductsTable);

module.exports = router;