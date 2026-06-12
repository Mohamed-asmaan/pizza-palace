// ============================================
// handleValidationErrors.js - express-validator error formatter
// Used after body() rules in routes; stops chain if validation failed
// ============================================

const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      statusCode: 400,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = handleValidationErrors;
