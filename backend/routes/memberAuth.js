const express = require('express');
const router = express.Router();
const { memberLogin, changeMemberPassword, getMemberProfile, getMyBorrowedBooks, getMyFineHistory, getMyReservations, createMyReservation, cancelMyReservation, getMemberBooks, getMemberBookById } = require('../controllers/memberAuthController');
const paymentRoutes = require('./payments');
const { authenticateMemberToken } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Member login validation
const validateMemberLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Change password validation
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  handleValidationErrors
];

// Public routes
router.post('/login', validateMemberLogin, memberLogin);

// Protected routes (require member authentication)
router.use(authenticateMemberToken);
router.get('/profile', getMemberProfile);
router.put('/change-password', validateChangePassword, changeMemberPassword);
router.get('/borrowed-books', getMyBorrowedBooks);
router.get('/fines', getMyFineHistory);
router.get('/reservations', getMyReservations);
router.post('/reservations', [body('book_id').notEmpty().withMessage('Book ID is required'), handleValidationErrors], createMyReservation);
router.put('/reservations/cancel/:reservation_id', cancelMyReservation);
router.get('/books', getMemberBooks);
router.get('/books/:id', getMemberBookById);

// Payment routes
router.use('/payments', paymentRoutes);

module.exports = router;

