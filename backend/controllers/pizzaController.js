// ============================================
// pizzaController.js - MENU LOGIC (called from pizzaRoutes.js)
// Customers only see available pizzas; admin sees everything.
// ============================================
const Pizza = require('../models/Pizza');

// GET /api/pizzas — list menu (optional ?category=Veg)
const getAllPizzas = async (req, res, next) => {
  try {
    const filter = {};
    const isAdmin = req.user && req.user.role === 'admin';

    // hide unavailable items from normal shoppers
    if (!isAdmin) {
      filter.isAvailable = true;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const pizzas = await Pizza.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: pizzas.length,
      data: pizzas,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/pizzas/:id — single pizza detail page
const getPizzaById = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id);

    const isAdmin = req.user && req.user.role === 'admin';

    if (!pizza || (!pizza.isAvailable && !isAdmin)) {
      return res.status(404).json({
        success: false,
        message: 'Pizza not found',
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: pizza,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/pizzas — admin adds new menu item
const createPizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.create(req.body);

    res.status(201).json({
      success: true,
      data: pizza,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/pizzas/:id — admin edits name, price, availability, etc.
const updatePizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: 'Pizza not found',
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: pizza,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/pizzas/:id — admin removes pizza from database
const deletePizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.findByIdAndDelete(req.params.id);

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: 'Pizza not found',
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pizza deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPizzas,
  getPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
};
