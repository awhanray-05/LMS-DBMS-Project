const express = require('express');
const router = express.Router();
const { 
  issueBook, 
  returnBook, 
  getTransactions, 
  getOverdueBooks,
  getFineHistory,
  payFine
} = require('../controllers/transactionController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validation');

// All routes require authentication and admin access
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getTransactions);
router.get('/overdue', getOverdueBooks);
router.post('/issue', validateTransaction, issueBook);
router.put('/return/:transaction_id', returnBook);
router.get('/fines/:member_id', getFineHistory);
router.put('/fines/:fine_id/pay', payFine);

module.exports = router;
