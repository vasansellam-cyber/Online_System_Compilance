const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login a user
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/users
// @desc    Get all registered users for Mock Google Login
// @access  Public
router.get('/users', authController.getUsers);

// @route   POST /api/auth/mock-google-login
// @desc    Login a user without password for Mock Google Login
// @access  Public
router.post('/mock-google-login', authController.mockGoogleLogin);

// @route   POST /api/auth/request-unblock
// @desc    Request unblock for an account
// @access  Public
router.post('/request-unblock', authController.requestUnblock);

module.exports = router;
