// ============================================
// paymentController.js - RAZORPAY TEST PAYMENT
// create-order = start payment
// verify = check payment ok then save order
// ============================================

const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const { validateAndBuildOrderItems } = require('../utils/orderItems');

// only create Razorpay client when test keys are in .env (project uses test mode only)
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  if (!keyId.startsWith('rzp_test_')) {
    throw Object.assign(new Error('Only Razorpay test keys (rzp_test_*) are allowed'), {
      statusCode: 500,
    });
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const isTestMode = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  return Boolean(keyId && process.env.RAZORPAY_KEY_SECRET && keyId.startsWith('rzp_test_'));
};

// GET /api/payments/config — frontend uses this to show Razorpay vs COD
const getPaymentConfig = (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const enabled = isTestMode();

  res.status(200).json({
    success: true,
    data: {
      enabled,
      testMode: enabled,
      keyId: enabled ? keyId : null,
      currency: 'INR',
    },
  });
};

// POST /api/payments/create-order — step 1: create Razorpay order before popup opens
const createPaymentOrder = async (req, res, next) => {
  try {
    let razorpay;
    try {
      razorpay = getRazorpayInstance();
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        statusCode: error.statusCode || 500,
      });
    }

    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway is not configured',
        statusCode: 503,
      });
    }

    const { orderItems, totalAmount } = await validateAndBuildOrderItems(req.body.items);
    const amountInPaise = Math.round(totalAmount * 100);

    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum order amount is ₹1',
        statusCode: 400,
      });
    }

    // razorpay receipt max 40 chars - keep it short
    var receiptId = 'pp' + Date.now();

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        customerId: req.user._id.toString(),
        itemCount: String(orderItems.length),
      },
    });

    res.status(200).json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        totalAmount,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        statusCode: error.statusCode,
      });
    }
    // show razorpay api error message if available
    if (error.error && error.error.description) {
      return res.status(400).json({
        success: false,
        message: error.error.description,
        statusCode: 400,
      });
    }
    next(error);
  }
};

// POST /api/payments/verify — step 2: confirm payment signature, then save order as paid
const verifyPayment = async (req, res, next) => {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway is not configured',
        statusCode: 503,
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      deliveryAddress,
    } = req.body;

    // Razorpay sends a signature - we recreate it to prove payment is real
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        statusCode: 400,
      });
    }

    // if user refreshes after pay, don't create duplicate order for same Razorpay id
    const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        data: await Order.findById(existingOrder._id)
          .populate('customerId', 'name email')
          .populate('items.pizza'),
      });
    }

    const { orderItems, totalAmount } = await validateAndBuildOrderItems(items);

    const order = await Order.create({
      customerId: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      status: 'Confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name email')
      .populate('items.pizza');

    res.status(201).json({
      success: true,
      data: populatedOrder,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        statusCode: error.statusCode,
      });
    }
    next(error);
  }
};

module.exports = {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment,
};
