// ============================================
// authRoutes.js - LOGIN & REGISTER
// Base URL: /api/auth
// POST /register  - new customer account
// POST /login     - returns JWT token
// GET  /profile   - current user (needs token)
// PUT  /profile   - update name/email/password
// ============================================

const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getProfile,
  updateProfile,
  handleValidationErrors,
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  handleValidationErrors,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidationErrors,
  login
);

router.get('/profile', verifyToken, getProfile);

router.put(
  '/profile',
  verifyToken,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  handleValidationErrors,
  updateProfile
);

module.exports = router;
