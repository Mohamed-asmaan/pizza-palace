// ============================================
// orderRoutes.js - ORDERS
// Base URL: /api/orders
// POST   /           - place order (COD, login required)
// GET    /my         - logged-in user's orders
// GET    /           - all orders (admin only)
// PUT    /:id/status - update status (admin only)
// DELETE /:id        - cancel own order
// ============================================

const express = require('express');
const { body } = require('express-validator');
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { handleValidationErrors } = require('../controllers/authController');

const router = express.Router();

router.post(
  '/',
  verifyToken,
  [
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.pizza').notEmpty().withMessage('Pizza ID is required'),
    body('items.*.qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required'),
  ],
  handleValidationErrors,
  placeOrder
);

router.get('/my', verifyToken, getMyOrders);
router.get('/', verifyToken, isAdmin, getAllOrders);

router.put(
  '/:id/status',
  verifyToken,
  isAdmin,
  [body('status').notEmpty().withMessage('Status is required')],
  handleValidationErrors,
  updateOrderStatus
);

router.delete('/:id', verifyToken, cancelOrder);

module.exports = router;
