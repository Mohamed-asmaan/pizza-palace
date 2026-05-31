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

const orderItemsValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.pizza').notEmpty().withMessage('Pizza ID is required'),
  body('items.*.qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

router.get('/config', getPaymentConfig);

router.post(
  '/create-order',
  verifyToken,
  orderItemsValidation,
  handleValidationErrors,
  createPaymentOrder
);

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
