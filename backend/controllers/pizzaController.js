// ============================================
// pizzaController.js - GET/ADD/EDIT/DELETE PIZZAS (menu)
// ============================================
const Pizza = require('../models/Pizza');

const getAllPizzas = async (req, res, next) => {
  try {
    const filter = {};
    const isAdmin = req.user && req.user.role === 'admin';

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
