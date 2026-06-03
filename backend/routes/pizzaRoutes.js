// ============================================
// pizzaRoutes.js - MENU (PIZZAS)
// Base URL: /api/pizzas
// GET    /       - list pizzas (customers see only available ones)
// GET    /:id    - single pizza
// POST   /       - add pizza (admin only)
// PUT    /:id    - edit pizza (admin only)
// DELETE /:id    - delete pizza (admin only)
// ============================================

const express = require('express');
const { body } = require('express-validator');
const {
  getAllPizzas,
  getPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
} = require('../controllers/pizzaController');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');
const optionalAuth = require('../middleware/optionalAuth');
const handleValidationErrors = require('../middleware/handleValidationErrors');

const pizzaRoutes = express.Router();

pizzaRoutes.get('/', optionalAuth, getAllPizzas);
pizzaRoutes.get('/:id', optionalAuth, getPizzaById);

pizzaRoutes.post(
  '/',
  verifyToken,
  isAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('imageUrl').notEmpty().withMessage('Image URL is required'),
    body('isAvailable').optional().isBoolean(),
  ],
  handleValidationErrors,
  createPizza
);

pizzaRoutes.put(
  '/:id',
  verifyToken,
  isAdmin,
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('category').optional().notEmpty(),
    body('imageUrl').optional().notEmpty(),
    body('isAvailable').optional().isBoolean(),
  ],
  handleValidationErrors,
  updatePizza
);

pizzaRoutes.delete('/:id', verifyToken, isAdmin, deletePizza);

module.exports = pizzaRoutes;
