const Pizza = require('../models/Pizza');

const validateAndBuildOrderItems = async (items) => {
  if (!items || items.length === 0) {
    const error = new Error('Order must contain at least one item');
    error.statusCode = 400;
    throw error;
  }

  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const pizza = await Pizza.findById(item.pizza);
    if (!pizza || !pizza.isAvailable) {
      const error = new Error(`Pizza not available: ${item.pizza}`);
      error.statusCode = 400;
      throw error;
    }
    orderItems.push({ pizza: pizza._id, qty: item.qty });
    totalAmount += pizza.price * item.qty;
  }

  return { orderItems, totalAmount };
};

module.exports = { validateAndBuildOrderItems };
