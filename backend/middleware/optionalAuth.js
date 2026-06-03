// ============================================
// optionalAuth.js - attach user when Bearer token present (menu browse)
// ============================================

const verifyToken = require('./verifyToken');

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
};

module.exports = optionalAuth;
