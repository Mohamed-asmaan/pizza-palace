// ============================================
// Order.js - CUSTOMER ORDER
// items[] = list of { pizza id, qty }
// paymentMethod: 'cod' or 'razorpay' | paymentStatus: unpaid/paid/failed
// ============================================
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    pizza: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pizza',
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: (items) => items.length >= 1,
      message: 'Order must contain at least one item',
    },
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'],
    default: 'Pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'failed'],
    default: 'unpaid',
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod'],
    default: 'cod',
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Delivery address is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
