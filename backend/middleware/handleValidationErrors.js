// ============================================
// handleValidationErrors.js - express-validator error formatter
// Used after body() rules in routes; stops chain if validation failed
// ============================================

const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    // turn express-validator errors into a simple { field, message } list
    const errorList = [];
    for (const e of result.array()) {
      errorList.push({ field: e.path, message: e.msg });
    }

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      statusCode: 400,
      errors: errorList,
    });
  }

  next();
};

module.exports = handleValidationErrors;
