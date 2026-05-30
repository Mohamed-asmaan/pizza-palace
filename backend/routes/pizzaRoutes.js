const express = require('express');
const { body } = require('express-validator');
const {
  getAllPizzas,
  getPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
} = require('../controllers/pizzaController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { handleValidationErrors } = require('../controllers/authController');

const router = express.Router();

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, getAllPizzas);
router.get('/:id', optionalAuth, getPizzaById);

router.post(
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

router.put(
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

router.delete('/:id', verifyToken, isAdmin, deletePizza);

module.exports = router;
