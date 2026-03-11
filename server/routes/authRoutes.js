import express from 'express';
import { body } from 'express-validator';
import {
  register, login, logout, getMe,
  refreshAccessToken, forgotPassword, resetPassword, changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ── Validation Rules ──────────────────────────────────────────────────────────
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 60 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and a number'),
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// ── Routes ────────────────────────────────────────────────────────────────────
router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login',    authLimiter, loginRules,    validate, login);
router.post('/logout',   protect, logout);
router.get( '/me',       protect, getMe);
router.post('/refresh',  refreshAccessToken);
router.post('/forgot-password', authLimiter,
  [body('email').isEmail().normalizeEmail()], validate, forgotPassword);
router.post('/reset-password/:token',
  [body('password').isLength({ min: 8 })], validate, resetPassword);
router.post('/change-password', protect,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
  ], validate, changePassword);

export default router;