// ============================================
// Pizza.js - MENU ITEM (one document = one pizza on the menu)
// isAvailable: false hides it from customers but admin can still see it
// ============================================
const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pizza name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Pizza', pizzaSchema);
