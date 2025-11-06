const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../config/database');

// Member login
const memberLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await getConnection();

    // Find member by email
    const result = await connection.execute(
      `SELECT member_id, first_name, last_name, email, password_hash, password_changed, status 
       FROM members WHERE email = :email`,
      { email }
    );
    await connection.close();

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const member = result.rows[0];

    // Check if member has a password set (for existing members without password)
    if (!member.PASSWORD_HASH) {
      return res.status(401).json({
        success: false,
        message: 'Account not properly set up. Please contact administrator.'
      });
    }

    // Check if member is active
    if (member.STATUS !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, member.PASSWORD_HASH);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        memberId: member.MEMBER_ID,
        email: member.EMAIL,
        type: 'member'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log(member);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        member: {
          id: member.MEMBER_ID,
          email: member.EMAIL,
          firstName: member.FIRST_NAME,
          lastName: member.LAST_NAME,
          passwordChanged: member.PASSWORD_CHANGED === 1
        }
      }
    });
  } catch (error) {
    console.error('Member login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Change member password
const changeMemberPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const memberId = req.member.id; // From authentication middleware

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const connection = await getConnection();

    // Get current password hash
    const result = await connection.execute(
      `SELECT password_hash, password_changed FROM members WHERE member_id = :id`,
      { id: memberId }
    );

    if (result.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const member = result.rows[0];

    // Verify current password (only if password was already changed)
    if (member.PASSWORD_CHANGED === 1) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, member.PASSWORD_HASH);
      if (!isCurrentPasswordValid) {
        await connection.close();
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    } else {
      // For first-time password change, verify the temporary password
      const isTempPasswordValid = await bcrypt.compare(currentPassword, member.PASSWORD_HASH);
      if (!isTempPasswordValid) {
        await connection.close();
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password and set password_changed flag
    await connection.execute(
      `UPDATE members SET password_hash = :password_hash, password_changed = 1 WHERE member_id = :id`,
      {
        password_hash: newPasswordHash,
        id: memberId
      }
    );

    await connection.close();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change member password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Get member profile
const getMemberProfile = async (req, res) => {
  try {
    const memberId = req.member.id; // From authentication middleware
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT member_id, first_name, last_name, email, phone, address, 
              membership_type, membership_date, status, password_changed
       FROM members WHERE member_id = :id`,
      { id: memberId }
    );
    await connection.close();

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const member = result.rows[0];
    res.json({
      success: true,
      data: {
        id: member.MEMBER_ID,
        firstName: member.FIRST_NAME,
        lastName: member.LAST_NAME,
        email: member.EMAIL,
        phone: member.PHONE,
        address: member.ADDRESS,
        membershipType: member.MEMBERSHIP_TYPE,
        membershipDate: member.MEMBERSHIP_DATE,
        status: member.STATUS,
        passwordChanged: member.PASSWORD_CHANGED === 1
      }
    });
  } catch (error) {
    console.error('Get member profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch member profile',
      error: error.message
    });
  }
};

// Get member's borrowed books (member-specific endpoint)
const getMyBorrowedBooks = async (req, res) => {
  try {
    const memberId = req.member.id; // From authentication middleware
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT t.transaction_id, t.issue_date, t.due_date, t.fine_amount, 
              b.title, b.author, b.isbn, b.book_id
       FROM transactions t
       JOIN books b ON t.book_id = b.book_id
       WHERE t.member_id = :id AND t.status IN ('ISSUED', 'OVERDUE')
       ORDER BY t.issue_date DESC`,
      { id: memberId }
    );
    await connection.close();

    const borrowedBooks = result.rows.map(row => ({
      transactionId: row.TRANSACTION_ID,
      issueDate: row.ISSUE_DATE,
      dueDate: row.DUE_DATE,
      fineAmount: row.FINE_AMOUNT,
      book: {
        id: row.BOOK_ID,
        title: row.TITLE,
        author: row.AUTHOR,
        isbn: row.ISBN
      }
    }));

    res.json({
      success: true,
      data: { borrowedBooks }
    });
  } catch (error) {
    console.error('Get member borrowed books error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch borrowed books',
      error: error.message
    });
  }
};

// Get member's fine history (member-specific endpoint)
const getMyFineHistory = async (req, res) => {
  try {
    const memberId = req.member.id; // From authentication middleware
    const connection = await getConnection();

    // Get fines from fine_history table
    const fineHistoryResult = await connection.execute(
      `SELECT fh.fine_id, fh.transaction_id, fh.fine_amount, fh.fine_reason, fh.paid_date, 
              fh.status, fh.created_at, t.issue_date, t.due_date,
              b.title, b.author
       FROM fine_history fh
       JOIN transactions t ON fh.transaction_id = t.transaction_id
       JOIN books b ON t.book_id = b.book_id
       WHERE fh.member_id = :member_id
       ORDER BY fh.created_at DESC`,
      { member_id: memberId }
    );

    // Get currently overdue books that haven't been returned
    const overdueBooksResult = await connection.execute(
      `SELECT t.transaction_id, t.issue_date, t.due_date,
              b.title, b.author
       FROM transactions t
       JOIN books b ON t.book_id = b.book_id
       WHERE t.member_id = :member_id 
         AND t.status IN ('ISSUED', 'OVERDUE')
         AND t.due_date < SYSDATE`,
      { member_id: memberId }
    );

    await connection.close();

    // Map fine history records
    const fineHistory = fineHistoryResult.rows.map(row => ({
      fineId: row.FINE_ID,
      transactionId: row.TRANSACTION_ID,
      fineAmount: row.FINE_AMOUNT,
      fineReason: row.FINE_REASON,
      paidDate: row.PAID_DATE,
      status: row.STATUS,
      createdAt: row.CREATED_AT,
      transaction: {
        issueDate: row.ISSUE_DATE,
        dueDate: row.DUE_DATE
      },
      book: {
        title: row.TITLE,
        author: row.AUTHOR
      }
    }));

    // Get set of transaction IDs that already have fines
    const transactionsWithFines = new Set(
      fineHistoryResult.rows
        .filter(row => row.STATUS === 'PENDING')
        .map(row => row.TRANSACTION_ID)
    );

    // Calculate and add fines for currently overdue books
    const currentDate = new Date();
    overdueBooksResult.rows.forEach(row => {
      const transactionId = row.TRANSACTION_ID;
      const dueDate = new Date(row.DUE_DATE);
      
      // Only add calculated fine if no pending fine exists for this transaction
      if (currentDate > dueDate && !transactionsWithFines.has(transactionId)) {
        const daysOverdue = Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24));
        const fineAmount = daysOverdue * 1; // Rs1 per day fine
        
        fineHistory.push({
          fineId: null, // No fine_id yet as it's not in the database
          transactionId: transactionId,
          fineAmount: fineAmount,
          fineReason: 'Late return (Currently overdue)',
          paidDate: null,
          status: 'PENDING',
          createdAt: dueDate, // Use due date as creation date
          transaction: {
            issueDate: row.ISSUE_DATE,
            dueDate: row.DUE_DATE
          },
          book: {
            title: row.TITLE,
            author: row.AUTHOR
          },
          isCalculated: true // Flag to indicate this is a calculated fine
        });
      }
    });

    // Sort by creation date (most recent first)
    fineHistory.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.transaction?.dueDate);
      const dateB = new Date(b.createdAt || b.transaction?.dueDate);
      return dateB - dateA;
    });

    res.json({
      success: true,
      data: { fineHistory }
    });
  } catch (error) {
    console.error('Get fine history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fine history',
      error: error.message
    });
  }
};

// Get member's reservations (member-specific endpoint)
const getMyReservations = async (req, res) => {
  try {
    const memberId = req.member.id; // From authentication middleware
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT r.reservation_id, r.book_id, r.reservation_date, r.status, 
              r.fulfilled_date, r.expiry_date, b.title, b.author, b.isbn, b.available_copies
       FROM reservations r
       JOIN books b ON r.book_id = b.book_id
       WHERE r.member_id = :member_id
       ORDER BY r.reservation_date DESC`,
      { member_id: memberId }
    );
    await connection.close();

    const reservations = result.rows.map(row => ({
      reservationId: row.RESERVATION_ID,
      bookId: row.BOOK_ID,
      reservationDate: row.RESERVATION_DATE,
      status: row.STATUS,
      fulfilledDate: row.FULFILLED_DATE,
      expiryDate: row.EXPIRY_DATE,
      book: {
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
      message: 'Failed to fetch reservations',
      error: error.message
    });
  }
};

// Create a reservation (member-specific endpoint)
const createMyReservation = async (req, res) => {
  try {
    const memberId = req.member.id; // From authentication middleware
    const { book_id } = req.body;
    const connection = await getConnection();
    const oracledb = require('oracledb');

    if (!book_id) {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    // Check if member is active
    const memberResult = await connection.execute(
      `SELECT member_id, status FROM members WHERE member_id = :member_id`,
      { member_id: memberId }
    );

    if (memberResult.rows.length === 0 || memberResult.rows[0].STATUS !== 'ACTIVE') {
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
      { member_id: memberId, book_id }
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
      { member_id: memberId, book_id }
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
        member_id: memberId,
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
    console.error('Create member reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reservation',
      error: error.message
    });
  }
};

// Cancel a reservation (member-specific endpoint)
const cancelMyReservation = async (req, res) => {
  try {
    const memberId = req.member.id; // From authentication middleware
    const { reservation_id } = req.params;
    const connection = await getConnection();

    // Check if reservation exists and belongs to the member
    const reservationResult = await connection.execute(
      `SELECT reservation_id, status, member_id FROM reservations WHERE reservation_id = :reservation_id`,
      { reservation_id }
    );

    if (reservationResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Verify reservation belongs to the member
    if (reservationResult.rows[0].MEMBER_ID !== memberId) {
      await connection.close();
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own reservations'
      });
    }

    const status = reservationResult.rows[0].STATUS;
    if (status !== 'PENDING' && status !== 'AVAILABLE') {
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
    console.error('Cancel member reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel reservation',
      error: error.message
    });
  }
};

// Get books for members (member-specific endpoint)
const getMemberBooks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category = '', 
      sortBy = 'book_id',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const connection = await getConnection();

    // Build search conditions
    let whereConditions = [];
    let bindVars = {};

    if (search) {
      whereConditions.push(`(LOWER(title) LIKE LOWER(:search) OR LOWER(author) LIKE LOWER(:search) OR LOWER(isbn) LIKE LOWER(:search))`);
      bindVars.search = `%${search}%`;
    }

    if (category) {
      whereConditions.push(`category = :category`);
      bindVars.category = category;
    }

    // Only show active books to members
    whereConditions.push(`status = 'ACTIVE'`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : `WHERE status = 'ACTIVE'`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM books ${whereClause}`;
    const countResult = await connection.execute(countQuery, bindVars);
    const total = countResult.rows[0].TOTAL;

    // Get books with pagination
    const booksQuery = `
      SELECT book_id, isbn, title, author, publisher, publication_year, 
             category, total_copies, available_copies, price, description
      FROM books 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    bindVars.offset = offset;
    bindVars.limit = parseInt(limit);

    const booksResult = await connection.execute(booksQuery, bindVars);
    await connection.close();

    const books = booksResult.rows.map(row => ({
      id: row.BOOK_ID,
      isbn: row.ISBN,
      title: row.TITLE,
      author: row.AUTHOR,
      publisher: row.PUBLISHER,
      publicationYear: row.PUBLICATION_YEAR,
      category: row.CATEGORY,
      totalCopies: row.TOTAL_COPIES,
      availableCopies: row.AVAILABLE_COPIES,
      price: row.PRICE,
      description: row.DESCRIPTION
    }));

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get member books error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books',
      error: error.message
    });
  }
};

// Get book by ID for members
const getMemberBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT book_id, isbn, title, author, publisher, publication_year, 
              category, total_copies, available_copies, price, description
       FROM books WHERE book_id = :id AND status = 'ACTIVE'`,
      { id }
    );
    await connection.close();

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const book = result.rows[0];
    res.json({
      success: true,
      data: {
        id: book.BOOK_ID,
        isbn: book.ISBN,
        title: book.TITLE,
        author: book.AUTHOR,
        publisher: book.PUBLISHER,
        publicationYear: book.PUBLICATION_YEAR,
        category: book.CATEGORY,
        totalCopies: book.TOTAL_COPIES,
        availableCopies: book.AVAILABLE_COPIES,
        price: book.PRICE,
        description: book.DESCRIPTION
      }
    });
  } catch (error) {
    console.error('Get member book by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book',
      error: error.message
    });
  }
};

module.exports = {
  memberLogin,
  changeMemberPassword,
  getMemberProfile,
  getMyBorrowedBooks,
  getMyFineHistory,
  getMyReservations,
  createMyReservation,
  cancelMyReservation,
  getMemberBooks,
  getMemberBookById
};

