const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  getUserStats
} = require('../controllers/adminUserController');

const { protect, authorize } = require('../middleware/auth');

// Todas las rutas requieren autenticación de admin
router.use(protect, authorize('administrador'));

// Rutas de gestión de usuarios
router.get('/users', getAllUsers);
router.get('/users/stats', getUserStats);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);

module.exports = router;