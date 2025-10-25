const express = require('express');
const router = express.Router();
const { 
  getBooks, 
  getBookById, 
  createBook, 
  updateBook, 
  deleteBook, 
  searchBooks 
} = require('../controllers/bookController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateBook, validateSearch } = require('../middleware/validation');

// Public routes (for member search)
router.get('/search', validateSearch, searchBooks);

// Protected routes
router.get('/', authenticateToken, getBooks);
router.get('/:id', authenticateToken, getBookById);
router.post('/', authenticateToken, requireAdmin, validateBook, createBook);
router.put('/:id', authenticateToken, requireAdmin, validateBook, updateBook);
router.delete('/:id', authenticateToken, requireAdmin, deleteBook);

module.exports = router;
