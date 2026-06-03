// ============================================
// isAdmin.js - requires req.user.role === 'admin' (use after verifyToken)
// ============================================

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      statusCode: 403,
    });
  }
  next();
};

module.exports = isAdmin;
