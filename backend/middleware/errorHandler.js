// ============================================
// errorHandler.js - SENDS JSON ERROR RESPONSES
// Put last in server.js so it catches errors from routes
// ============================================

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // mongoose validation (wrong field types etc)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(statusCode).json({
      success: false,
      message,
      statusCode,
      errors,
    });
  }

  // duplicate email or unique field
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    return res.status(statusCode).json({
      success: false,
      message,
      statusCode,
    });
  }

  // invalid MongoDB id in URL
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
};

module.exports = errorHandler;
