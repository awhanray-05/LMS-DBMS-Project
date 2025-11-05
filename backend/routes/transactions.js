const express = require('express');
const router = express.Router();
const { 
  issueBook, 
  returnBook, 
  getTransactions, 
  getOverdueBooks,
  getFineHistory,
  payFine,
  renewBook,
  getAnalytics
} = require('../controllers/transactionController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validation');

// All routes require authentication and admin access
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getTransactions);
router.get('/overdue', getOverdueBooks);
router.get('/analytics', getAnalytics);
router.post('/issue', validateTransaction, issueBook);
router.put('/return/:transaction_id', returnBook);
router.put('/renew/:transaction_id', renewBook);
router.get('/fines/:member_id', getFineHistory);
router.put('/fines/:fine_id/pay', payFine);

module.exports = router;
