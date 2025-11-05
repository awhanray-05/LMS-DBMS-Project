const { getConnection } = require('../config/database');
const oracledb = require('oracledb');

// Issue a book
const issueBook = async (req, res) => {
  let connection;
  try {
    // Parse and validate input
    const member_id = parseInt(req.body.member_id);
    const book_id = parseInt(req.body.book_id);
    const due_date = req.body.due_date;
    
    console.log('Issue book request:', { member_id, book_id, due_date });
    
    if (isNaN(member_id) || isNaN(book_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID or book ID'
      });
    }
    
    connection = await getConnection();

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

    // Check if book exists and is available
    const bookResult = await connection.execute(
      `SELECT book_id, available_copies, status FROM books WHERE book_id = :book_id`,
      { book_id }
    );

    if (bookResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (bookResult.rows[0].STATUS !== 'AVAILABLE') {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Book is not available'
      });
    }

    if (bookResult.rows[0].AVAILABLE_COPIES <= 0) {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'No copies available'
      });
    }

    // Check if member already has this book issued
    const existingTransaction = await connection.execute(
      `SELECT transaction_id FROM transactions 
       WHERE member_id = :member_id AND book_id = :book_id AND status = 'ISSUED'`,
      { member_id, book_id }
    );

    if (existingTransaction.rows.length > 0) {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Member already has this book issued'
      });
    }

    // Calculate due date (default 14 days from now)
    let calculatedDueDate;
    if (due_date) {
      // Convert string date to JavaScript Date object
      calculatedDueDate = new Date(due_date);
    } else {
      calculatedDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }

    // Create transaction
    const transactionResult = await connection.execute(
      `INSERT INTO transactions (member_id, book_id, due_date)
       VALUES (:member_id, :book_id, :due_date)
       RETURNING transaction_id INTO :transaction_id`,
      {
        member_id,
        book_id,
        due_date: calculatedDueDate,
        transaction_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    const transactionId = transactionResult.outBinds.transaction_id[0];

    // Update book available copies
    await connection.execute(
      `UPDATE books SET available_copies = available_copies - 1 
       WHERE book_id = :book_id`,
      { book_id }
    );

    await connection.commit();
    await connection.close();

    res.status(201).json({
      success: true,
      message: 'Book issued successfully',
      data: { transactionId }
    });
  } catch (error) {
    console.error('Issue book error:', error);
    console.error('Error stack:', error.stack);
    
    // Close connection if it was opened
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to issue book',
      error: error.message
    });
  }
};

// Return a book
const returnBook = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const connection = await getConnection();

    // Get transaction details
    const transactionResult = await connection.execute(
      `SELECT transaction_id, member_id, book_id, issue_date, due_date, status
       FROM transactions WHERE transaction_id = :transaction_id`,
      { transaction_id }
    );

    if (transactionResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const transaction = transactionResult.rows[0];

    if (transaction.STATUS !== 'ISSUED' && transaction.STATUS !== 'OVERDUE') {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Book is not currently issued'
      });
    }

    // Calculate fine if overdue
    const returnDate = new Date();
    const dueDate = new Date(transaction.DUE_DATE);
    let fineAmount = 0;

    if (returnDate > dueDate) {
      const daysOverdue = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = daysOverdue * 1; // Rs1 per day fine
    }

    // Update transaction
    await connection.execute(
      `UPDATE transactions SET 
         return_date = :return_date,
         fine_amount = :fine_amount,
         status = 'RETURNED'
       WHERE transaction_id = :transaction_id`,
      {
        return_date: returnDate,
        fine_amount: fineAmount,
        transaction_id
      }
    );

    // Update book available copies
    await connection.execute(
      `UPDATE books SET available_copies = available_copies + 1 
       WHERE book_id = :book_id`,
      { book_id: transaction.BOOK_ID }
    );

    // Create fine record if applicable
    if (fineAmount > 0) {
      await connection.execute(
        `INSERT INTO fine_history (transaction_id, member_id, fine_amount, fine_reason)
         VALUES (:transaction_id, :member_id, :fine_amount, :fine_reason)`,
        {
          transaction_id,
          member_id: transaction.MEMBER_ID,
          fine_amount: fineAmount,
          fine_reason: 'Late return'
        }
      );
    }

    await connection.close();

    res.json({
      success: true,
      message: 'Book returned successfully',
      data: { fineAmount }
    });
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to return book',
      error: error.message
    });
  }
};

// Get all transactions with pagination
const getTransactions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '',
      member_id = '',
      book_id = '',
      sortBy = 'transaction_id',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const connection = await getConnection();

    // Build search conditions
    let whereConditions = [];
    let bindVars = {};

    if (status) {
      whereConditions.push(`t.status = :status`);
      bindVars.status = status;
    }

    if (member_id) {
      whereConditions.push(`t.member_id = :member_id`);
      bindVars.member_id = member_id;
    }

    if (book_id) {
      whereConditions.push(`t.book_id = :book_id`);
      bindVars.book_id = book_id;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM transactions t ${whereClause}`;
    const countResult = await connection.execute(countQuery, bindVars);
    const total = countResult.rows[0].TOTAL;

    // Get transactions with pagination
    const transactionsQuery = `
      SELECT t.transaction_id, t.issue_date, t.due_date, t.return_date, 
             t.fine_amount, t.status, t.created_at,
             m.first_name, m.last_name, m.email,
             b.title, b.author, b.isbn
      FROM transactions t
      JOIN members m ON t.member_id = m.member_id
      JOIN books b ON t.book_id = b.book_id
      ${whereClause}
      ORDER BY t.${sortBy} ${sortOrder}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    bindVars.offset = offset;
    bindVars.limit = parseInt(limit);

    const transactionsResult = await connection.execute(transactionsQuery, bindVars);
    await connection.close();

    const transactions = transactionsResult.rows.map(row => ({
      transactionId: row.TRANSACTION_ID,
      issueDate: row.ISSUE_DATE,
      dueDate: row.DUE_DATE,
      returnDate: row.RETURN_DATE,
      fineAmount: row.FINE_AMOUNT,
      status: row.STATUS,
      createdAt: row.CREATED_AT,
      member: {
        firstName: row.FIRST_NAME,
        lastName: row.LAST_NAME,
        email: row.EMAIL
      },
      book: {
        title: row.TITLE,
        author: row.AUTHOR,
        isbn: row.ISBN
      }
    }));

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

// Get overdue books
const getOverdueBooks = async (req, res) => {
  try {
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT t.transaction_id, t.issue_date, t.due_date, t.fine_amount,
              m.first_name, m.last_name, m.email, m.phone,
              b.title, b.author, b.isbn
       FROM transactions t
       JOIN members m ON t.member_id = m.member_id
       JOIN books b ON t.book_id = b.book_id
       WHERE t.status = 'ISSUED' AND t.due_date < SYSDATE
       ORDER BY t.due_date ASC`
    );
    await connection.close();

    const overdueBooks = result.rows.map(row => ({
      transactionId: row.TRANSACTION_ID,
      issueDate: row.ISSUE_DATE,
      dueDate: row.DUE_DATE,
      fineAmount: row.FINE_AMOUNT,
      member: {
        firstName: row.FIRST_NAME,
        lastName: row.LAST_NAME,
        email: row.EMAIL,
        phone: row.PHONE
      },
      book: {
        title: row.TITLE,
        author: row.AUTHOR,
        isbn: row.ISBN
      }
    }));

    res.json({
      success: true,
      data: { overdueBooks }
    });
  } catch (error) {
    console.error('Get overdue books error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue books',
      error: error.message
    });
  }
};

// Get fine history for a member
const getFineHistory = async (req, res) => {
  try {
    const { member_id } = req.params;
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT fh.fine_id, fh.fine_amount, fh.fine_reason, fh.paid_date, 
              fh.status, fh.created_at, t.issue_date, t.due_date,
              b.title, b.author
       FROM fine_history fh
       JOIN transactions t ON fh.transaction_id = t.transaction_id
       JOIN books b ON t.book_id = b.book_id
       WHERE fh.member_id = :member_id
       ORDER BY fh.created_at DESC`,
      { member_id }
    );
    await connection.close();

    const fineHistory = result.rows.map(row => ({
      fineId: row.FINE_ID,
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

// Pay fine
const payFine = async (req, res) => {
  try {
    const { fine_id } = req.params;
    const connection = await getConnection();

    // Get fine details
    const fineResult = await connection.execute(
      `SELECT fine_id, fine_amount, status FROM fine_history WHERE fine_id = :fine_id`,
      { fine_id }
    );

    if (fineResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Fine not found'
      });
    }

    if (fineResult.rows[0].STATUS === 'PAID') {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Fine already paid'
      });
    }

    // Update fine status
    await connection.execute(
      `UPDATE fine_history SET 
         status = 'PAID',
         paid_date = SYSDATE
       WHERE fine_id = :fine_id`,
      { fine_id }
    );

    await connection.close();

    res.json({
      success: true,
      message: 'Fine paid successfully'
    });
  } catch (error) {
    console.error('Pay fine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pay fine',
      error: error.message
    });
  }
};

// Renew a book (extend due date)
const renewBook = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const { extension_days = 14 } = req.body;
    const connection = await getConnection();

    // Get transaction details
    const transactionResult = await connection.execute(
      `SELECT transaction_id, member_id, book_id, issue_date, due_date, status, 
              (SELECT COUNT(*) FROM transactions WHERE member_id = t.member_id AND book_id = t.book_id AND status IN ('ISSUED', 'OVERDUE')) as renewal_count
       FROM transactions t WHERE transaction_id = :transaction_id`,
      { transaction_id }
    );

    if (transactionResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const transaction = transactionResult.rows[0];

    if (transaction.STATUS !== 'ISSUED' && transaction.STATUS !== 'OVERDUE') {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Only issued or overdue books can be renewed'
      });
    }

    // Check if already renewed too many times (max 2 renewals)
    if (transaction.RENEWAL_COUNT >= 2) {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Maximum renewal limit reached for this book'
      });
    }

    // Calculate new due date
    const currentDueDate = new Date(transaction.DUE_DATE);
    const newDueDate = new Date(currentDueDate.getTime() + extension_days * 24 * 60 * 60 * 1000);

    // Update transaction with new due date
    await connection.execute(
      `UPDATE transactions SET 
         due_date = :new_due_date,
         status = CASE 
           WHEN :new_due_date < SYSDATE THEN 'OVERDUE'
           ELSE 'ISSUED'
         END,
         updated_at = CURRENT_TIMESTAMP
       WHERE transaction_id = :transaction_id`,
      {
        new_due_date: newDueDate,
        transaction_id
      }
    );

    await connection.close();

    res.json({
      success: true,
      message: 'Book renewed successfully',
      data: { 
        newDueDate: newDueDate.toISOString().split('T')[0],
        extensionDays: extension_days
      }
    });
  } catch (error) {
    console.error('Renew book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to renew book',
      error: error.message
    });
  }
};

// Get analytics/reports data
const getAnalytics = async (req, res) => {
  try {
    const connection = await getConnection();

    // Get popular books
    const popularBooksResult = await connection.execute(
      `SELECT b.book_id, b.title, b.author, COUNT(t.transaction_id) as borrow_count
       FROM books b
       LEFT JOIN transactions t ON b.book_id = t.book_id
       GROUP BY b.book_id, b.title, b.author
       ORDER BY borrow_count DESC
       FETCH FIRST 10 ROWS ONLY`
    );

    // Get member activity
    const memberActivityResult = await connection.execute(
      `SELECT m.member_id, m.first_name || ' ' || m.last_name as name, 
              COUNT(t.transaction_id) as transaction_count
       FROM members m
       LEFT JOIN transactions t ON m.member_id = t.member_id
       GROUP BY m.member_id, m.first_name, m.last_name
       ORDER BY transaction_count DESC
       FETCH FIRST 10 ROWS ONLY`
    );

    // Get category distribution
    const categoryDistributionResult = await connection.execute(
      `SELECT category, COUNT(*) as book_count
       FROM books
       WHERE category IS NOT NULL
       GROUP BY category
       ORDER BY book_count DESC`
    );

    // Get monthly transactions
    const monthlyTransactionsResult = await connection.execute(
      `SELECT TO_CHAR(issue_date, 'YYYY-MM') as month, COUNT(*) as count
       FROM transactions
       WHERE issue_date >= ADD_MONTHS(SYSDATE, -12)
       GROUP BY TO_CHAR(issue_date, 'YYYY-MM')
       ORDER BY month`
    );

    // Get fine statistics
    const fineStatsResult = await connection.execute(
      `SELECT 
         SUM(CASE WHEN status = 'PENDING' THEN fine_amount ELSE 0 END) as pending_fines,
         SUM(CASE WHEN status = 'PAID' THEN fine_amount ELSE 0 END) as paid_fines,
         COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
         COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid_count
       FROM fine_history`
    );

    await connection.close();

    const popularBooks = popularBooksResult.rows.map(row => ({
      bookId: row.BOOK_ID,
      title: row.TITLE,
      author: row.AUTHOR,
      borrowCount: row.BORROW_COUNT
    }));

    const memberActivity = memberActivityResult.rows.map(row => ({
      memberId: row.MEMBER_ID,
      name: row.NAME,
      transactionCount: row.TRANSACTION_COUNT
    }));

    const categoryDistribution = categoryDistributionResult.rows.map(row => ({
      category: row.CATEGORY,
      bookCount: row.BOOK_COUNT
    }));

    const monthlyTransactions = monthlyTransactionsResult.rows.map(row => ({
      month: row.MONTH,
      count: row.COUNT
    }));

    const fineStats = fineStatsResult.rows[0] ? {
      pendingFines: fineStatsResult.rows[0].PENDING_FINES || 0,
      paidFines: fineStatsResult.rows[0].PAID_FINES || 0,
      pendingCount: fineStatsResult.rows[0].PENDING_COUNT || 0,
      paidCount: fineStatsResult.rows[0].PAID_COUNT || 0
    } : {
      pendingFines: 0,
      paidFines: 0,
      pendingCount: 0,
      paidCount: 0
    };

    res.json({
      success: true,
      data: {
        popularBooks,
        memberActivity,
        categoryDistribution,
        monthlyTransactions,
        fineStats
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

module.exports = {
  issueBook,
  returnBook,
  getTransactions,
  getOverdueBooks,
  getFineHistory,
  payFine,
  renewBook,
  getAnalytics
};
