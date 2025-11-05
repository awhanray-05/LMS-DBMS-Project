const express = require('express');
const router = express.Router();
const { 
  createReservation,
  getReservations,
  cancelReservation,
  fulfillReservation,
  getMemberReservations
} = require('../controllers/reservationController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Member routes (authentication required but not admin)
router.post('/', authenticateToken, createReservation);
router.get('/member/:member_id', authenticateToken, getMemberReservations);
router.put('/cancel/:reservation_id', authenticateToken, cancelReservation);
router.put('/fulfill/:reservation_id', authenticateToken, fulfillReservation);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getReservations);

module.exports = router;

