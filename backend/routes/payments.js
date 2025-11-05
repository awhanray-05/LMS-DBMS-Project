const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');
const { authenticateMemberToken } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Validation middleware for creating order
const validateCreateOrder = [
  body('fine_id')
    .notEmpty()
    .withMessage('Fine ID is required')
    .isNumeric()
    .withMessage('Fine ID must be a number'),
  handleValidationErrors
];

// Validation middleware for verifying payment
const validateVerifyPayment = [
  body('fine_id')
    .notEmpty()
    .withMessage('Fine ID is required')
    .isNumeric()
    .withMessage('Fine ID must be a number'),
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Razorpay payment ID is required'),
  body('razorpay_signature')
    .notEmpty()
    .withMessage('Razorpay signature is required'),
  handleValidationErrors
];

// All payment routes require member authentication
router.use(authenticateMemberToken);

// Create Razorpay order
router.post('/create-order', validateCreateOrder, createRazorpayOrder);

// Verify payment
router.post('/verify', validateVerifyPayment, verifyPayment);

module.exports = router;

