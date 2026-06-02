// ============================================
// paymentRoutes.js - RAZORPAY PAYMENT API
// Base URL: /api/payments
// GET  /config        - tells frontend if Razorpay test mode is on
// POST /create-order  - creates Razorpay order (login required)
// POST /verify        - checks payment signature and saves order
// ============================================

const express = require('express');
const { body } = require('express-validator');
const {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment,
} = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../controllers/authController');

const router = express.Router();

// same cart item rules used for create-order and verify
const orderItemsValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.pizza').notEmpty().withMessage('Pizza ID is required'),
  body('items.*.qty')
    .custom(function (val) {
      var n = Number(val);
      return Number.isInteger(n) && n >= 1;
    })
    .withMessage('Quantity must be at least 1'),
];

// public - frontend checks if online payment is available
router.get('/config', getPaymentConfig);

// step 1: logged-in user starts payment (returns razorpay order id)
router.post(
  '/create-order',
  verifyToken,
  orderItemsValidation,
  handleValidationErrors,
  createPaymentOrder
);

// step 2: after Razorpay popup, frontend sends payment ids here to confirm
router.post(
  '/verify',
  verifyToken,
  [
    ...orderItemsValidation,
    body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required'),
    body('razorpay_order_id').notEmpty().withMessage('Razorpay order ID is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Razorpay payment ID is required'),
    body('razorpay_signature').notEmpty().withMessage('Razorpay signature is required'),
  ],
  handleValidationErrors,
  verifyPayment
);

module.exports = router;
