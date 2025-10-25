const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Book validation rules
const validateBook = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('author')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters'),
  body('isbn')
    .optional()
    .isLength({ min: 10, max: 20 })
    .withMessage('ISBN must be between 10 and 20 characters'),
  body('publisher')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Publisher must be less than 100 characters'),
  body('publication_year')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() + 1 })
    .withMessage('Publication year must be a valid year'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
  body('total_copies')
    .optional()
    .isInt({ min: 1, max: 999 })
    .withMessage('Total copies must be between 1 and 999'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  handleValidationErrors
];

// Member validation rules
const validateMember = [
  body('first_name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone must be between 10 and 15 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
  body('membership_type')
    .optional()
    .isIn(['STUDENT', 'FACULTY', 'STAFF'])
    .withMessage('Membership type must be STUDENT, FACULTY, or STAFF'),
  handleValidationErrors
];

// Admin validation rules
const validateAdmin = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('first_name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('role')
    .optional()
    .isIn(['SUPER_ADMIN', 'LIBRARIAN'])
    .withMessage('Role must be SUPER_ADMIN or LIBRARIAN'),
  handleValidationErrors
];

// Login validation rules
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Transaction validation rules
const validateTransaction = [
  body('member_id')
    .isInt({ min: 1 })
    .withMessage('Valid member ID is required'),
  body('book_id')
    .isInt({ min: 1 })
    .withMessage('Valid book ID is required'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  handleValidationErrors
];

// Search validation rules
const validateSearch = [
  body('query')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  body('type')
    .optional()
    .isIn(['title', 'author', 'isbn', 'category'])
    .withMessage('Search type must be title, author, isbn, or category'),
  handleValidationErrors
];

module.exports = {
  validateBook,
  validateMember,
  validateAdmin,
  validateLogin,
  validateTransaction,
  validateSearch,
  handleValidationErrors
};
