const express = require('express');
const router = express.Router();
const { 
  getMembers, 
  getMemberById, 
  createMember, 
  updateMember, 
  deleteMember,
  getMemberTransactions,
  getMemberBorrowedBooks
} = require('../controllers/memberController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateMember } = require('../middleware/validation');

// All routes require authentication and admin access
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getMembers);
router.get('/:id', getMemberById);
router.post('/', validateMember, createMember);
router.put('/:id', validateMember, updateMember);
router.delete('/:id', deleteMember);
router.get('/:id/transactions', getMemberTransactions);
router.get('/:id/borrowed-books', getMemberBorrowedBooks);

module.exports = router;
