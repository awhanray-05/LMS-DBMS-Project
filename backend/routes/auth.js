const express = require('express');
const router = express.Router();
const { login, getProfile, changePassword, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateLogin } = require('../middleware/validation');

// Public routes
router.post('/login', validateLogin, login);
router.post('/logout', logout);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/change-password', authenticateToken, changePassword);

module.exports = router;
