// ============================================
// orderController.js - PLACE ORDER, VIEW ORDERS, CANCEL
// ============================================
const Order = require('../models/Order');
const { validateAndBuildOrderItems } = require('../utils/orderItems');

const VALID_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

const placeOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress } = req.body;
    const { orderItems, totalAmount } = await validateAndBuildOrderItems(items);

    const order = await Order.create({
      customerId: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      status: 'Pending',
      paymentStatus: 'unpaid',
      paymentMethod: 'cod',
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

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('items.pizza')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'name email')
      .populate('items.pizza')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status',
        statusCode: 400,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('customerId', 'name email')
      .populate('items.pizza');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        statusCode: 404,
      });
    }

    const isOwner = order.customerId.toString() === req.user._id.toString();
    const isAdminUser = req.user.role === 'admin';

    if (!isOwner && !isAdminUser) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
        statusCode: 403,
      });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled',
        statusCode: 400,
      });
    }

    await Order.findByIdAndDelete(order._id);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
