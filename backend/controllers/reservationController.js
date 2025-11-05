const { getConnection } = require('../config/database');
const oracledb = require('oracledb');

// Create a reservation
const createReservation = async (req, res) => {
  try {
    const { member_id, book_id } = req.body;
    const connection = await getConnection();

    // Check if member exists and is active
    const memberResult = await connection.execute(
      `SELECT member_id, status FROM members WHERE member_id = :member_id`,
      { member_id }
    );

    if (memberResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    if (memberResult.rows[0].STATUS !== 'ACTIVE') {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Member account is not active'
      });
    }

    // Check if book exists
    const bookResult = await connection.execute(
      `SELECT book_id, available_copies FROM books WHERE book_id = :book_id`,
      { book_id }
    );

    if (bookResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if book is already available
    if (bookResult.rows[0].AVAILABLE_COPIES > 0) {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Book is currently available. Please issue it directly.'
      });
    }

    // Check if member already has this book reserved
    const existingReservation = await connection.execute(
      `SELECT reservation_id FROM reservations 
       WHERE member_id = :member_id AND book_id = :book_id AND status = 'PENDING'`,
      { member_id, book_id }
    );

    if (existingReservation.rows.length > 0) {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'You already have a pending reservation for this book'
      });
    }

    // Check if member already has this book issued
    const existingTransaction = await connection.execute(
      `SELECT transaction_id FROM transactions 
       WHERE member_id = :member_id AND book_id = :book_id AND status IN ('ISSUED', 'OVERDUE')`,
      { member_id, book_id }
    );

    if (existingTransaction.rows.length > 0) {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'You already have this book issued'
      });
    }

    // Set expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    // Create reservation
    const result = await connection.execute(
      `INSERT INTO reservations (member_id, book_id, expiry_date)
       VALUES (:member_id, :book_id, :expiry_date)
       RETURNING reservation_id INTO :reservation_id`,
      {
        member_id,
        book_id,
        expiry_date: expiryDate,
        reservation_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    const reservationId = result.outBinds.reservation_id[0];
    await connection.close();

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: { reservationId }
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reservation',
      error: error.message
    });
  }
};

// Get all reservations
const getReservations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      member_id = '',
      book_id = '',
      sortBy = 'reservation_id',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const connection = await getConnection();

    let whereConditions = [];
    let bindVars = {};

    if (status) {
      whereConditions.push(`r.status = :status`);
      bindVars.status = status;
    }

    if (member_id) {
      whereConditions.push(`r.member_id = :member_id`);
      bindVars.member_id = member_id;
    }

    if (book_id) {
      whereConditions.push(`r.book_id = :book_id`);
      bindVars.book_id = book_id;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sortBy to prevent SQL injection
    const allowedSortColumns = ['reservation_id', 'reservation_date', 'status', 'expiry_date', 'created_at'];
    const safeSortBy = allowedSortColumns.includes(sortBy.toLowerCase()) ? sortBy.toUpperCase() : 'RESERVATION_ID';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM reservations r ${whereClause}`;
    const countResult = await connection.execute(countQuery, bindVars);
    const total = countResult.rows[0].TOTAL;

    // Get reservations with pagination
    const reservationsQuery = `
      SELECT r.reservation_id, r.reservation_date, r.status, r.expiry_date, r.created_at,
             m.first_name, m.last_name, m.email,
             b.title, b.author, b.isbn, b.book_id
      FROM reservations r
      JOIN members m ON r.member_id = m.member_id
      JOIN books b ON r.book_id = b.book_id
      ${whereClause}
      ORDER BY r.${safeSortBy} ${safeSortOrder}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    bindVars.offset = offset;
    bindVars.limit = parseInt(limit);

    const reservationsResult = await connection.execute(reservationsQuery, bindVars);
    await connection.close();

    const reservations = reservationsResult.rows.map(row => ({
      reservationId: row.RESERVATION_ID,
      reservationDate: row.RESERVATION_DATE,
      status: row.STATUS,
      expiryDate: row.EXPIRY_DATE,
      createdAt: row.CREATED_AT,
      member: {
        firstName: row.FIRST_NAME,
        lastName: row.LAST_NAME,
        email: row.EMAIL
      },
      book: {
        id: row.BOOK_ID,
        title: row.TITLE,
        author: row.AUTHOR,
        isbn: row.ISBN
      }
    }));

    res.json({
      success: true,
      data: {
        reservations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reservations error:', error);
    
    // Check if it's a table doesn't exist error
    if (error.message && error.message.includes('table') && error.message.includes('not exist')) {
      return res.status(500).json({
        success: false,
        message: 'Reservations table does not exist. Please run the reservations schema SQL file.',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservations',
      error: error.message
    });
  }
};

// Cancel a reservation
const cancelReservation = async (req, res) => {
  try {
    const { reservation_id } = req.params;
    const connection = await getConnection();

    // Check if reservation exists
    const reservationResult = await connection.execute(
      `SELECT reservation_id, status FROM reservations WHERE reservation_id = :reservation_id`,
      { reservation_id }
    );

    if (reservationResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    if (reservationResult.rows[0].STATUS !== 'PENDING' && reservationResult.rows[0].STATUS !== 'AVAILABLE') {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Only pending or available reservations can be cancelled'
      });
    }

    // Update reservation status
    await connection.execute(
      `UPDATE reservations SET status = 'CANCELLED' WHERE reservation_id = :reservation_id`,
      { reservation_id }
    );

    await connection.close();

    res.json({
      success: true,
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel reservation',
      error: error.message
    });
  }
};

// Fulfill a reservation (when book becomes available)
const fulfillReservation = async (req, res) => {
  try {
    const { reservation_id } = req.params;
    const connection = await getConnection();

    // Get reservation details
    const reservationResult = await connection.execute(
      `SELECT reservation_id, member_id, book_id, status 
       FROM reservations WHERE reservation_id = :reservation_id`,
      { reservation_id }
    );

    if (reservationResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    const reservation = reservationResult.rows[0];

    if (reservation.STATUS !== 'AVAILABLE') {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Reservation is not available for fulfillment'
      });
    }

    // Check if book is still available
    const bookResult = await connection.execute(
      `SELECT available_copies FROM books WHERE book_id = :book_id`,
      { book_id: reservation.BOOK_ID }
    );

    if (bookResult.rows[0].AVAILABLE_COPIES <= 0) {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Book is no longer available'
      });
    }

    // Update reservation status
    await connection.execute(
      `UPDATE reservations SET status = 'FULFILLED' WHERE reservation_id = :reservation_id`,
      { reservation_id }
    );

    await connection.close();

    res.json({
      success: true,
      message: 'Reservation marked as fulfilled. You can now issue the book.'
    });
  } catch (error) {
    console.error('Fulfill reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fulfill reservation',
      error: error.message
    });
  }
};

// Get member's reservations
const getMemberReservations = async (req, res) => {
  try {
    const { member_id } = req.params;
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT r.reservation_id, r.reservation_date, r.status, r.expiry_date, r.created_at,
              b.title, b.author, b.isbn, b.book_id, b.available_copies
       FROM reservations r
       JOIN books b ON r.book_id = b.book_id
       WHERE r.member_id = :member_id
       ORDER BY r.reservation_date DESC`,
      { member_id }
    );
    await connection.close();

    const reservations = result.rows.map(row => ({
      reservationId: row.RESERVATION_ID,
      reservationDate: row.RESERVATION_DATE,
      status: row.STATUS,
      expiryDate: row.EXPIRY_DATE,
      createdAt: row.CREATED_AT,
      book: {
        id: row.BOOK_ID,
        title: row.TITLE,
        author: row.AUTHOR,
        isbn: row.ISBN,
        availableCopies: row.AVAILABLE_COPIES
      }
    }));

    res.json({
      success: true,
      data: { reservations }
    });
  } catch (error) {
    console.error('Get member reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch member reservations',
      error: error.message
    });
  }
};

module.exports = {
  createReservation,
  getReservations,
  cancelReservation,
  fulfillReservation,
  getMemberReservations
};

