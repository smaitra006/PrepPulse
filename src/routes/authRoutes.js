const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/security');
const { registerValidation, loginValidation } = require('../middleware/validators');

const router = express.Router();

// Apply the strict rate limiter and validation chains before hitting controllers
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

module.exports = router;
