const { getConnection } = require('../config/database');
const oracledb = require('oracledb');
const bcrypt = require('bcryptjs');
const { sendMemberCreationEmail } = require('../utils/emailService');

// Get all members with pagination and search
const getMembers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      membership_type = '', 
      status = '',
      sortBy = 'member_id',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const connection = await getConnection();

    // Build search conditions
    let whereConditions = [];
    let bindVars = {};

    if (search) {
      whereConditions.push(`(LOWER(first_name) LIKE LOWER(:search) OR LOWER(last_name) LIKE LOWER(:search) OR LOWER(email) LIKE LOWER(:search))`);
      bindVars.search = `%${search}%`;
    }

    if (membership_type) {
      whereConditions.push(`membership_type = :membership_type`);
      bindVars.membership_type = membership_type;
    }

    if (status) {
      whereConditions.push(`status = :status`);
      bindVars.status = status;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM members ${whereClause}`;
    const countResult = await connection.execute(countQuery, bindVars);
    const total = countResult.rows[0].TOTAL;

    // Get members with pagination
    const membersQuery = `
      SELECT member_id, first_name, last_name, email, phone, address, 
             membership_type, membership_date, status, created_at, updated_at
      FROM members 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    bindVars.offset = offset;
    bindVars.limit = parseInt(limit);

    const membersResult = await connection.execute(membersQuery, bindVars);
    await connection.close();

    const members = membersResult.rows.map(row => ({
      id: row.MEMBER_ID,
      firstName: row.FIRST_NAME,
      lastName: row.LAST_NAME,
      email: row.EMAIL,
      phone: row.PHONE,
      address: row.ADDRESS,
      membershipType: row.MEMBERSHIP_TYPE,
      membershipDate: row.MEMBERSHIP_DATE,
      status: row.STATUS,
      createdAt: row.CREATED_AT,
      updatedAt: row.UPDATED_AT
    }));

    res.json({
      success: true,
      data: {
        members,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch members',
      error: error.message
    });
  }
};

// Get member by ID
const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT member_id, first_name, last_name, email, phone, address, 
              membership_type, membership_date, status, created_at, updated_at
       FROM members WHERE member_id = :id`,
      { id }
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
        createdAt: member.CREATED_AT,
        updatedAt: member.UPDATED_AT
      }
    });
  } catch (error) {
    console.error('Get member by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch member',
      error: error.message
    });
  }
};

// Generate a random temporary password
const generateTemporaryPassword = () => {
  // Generate an 8-character password with mixed case letters and numbers
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Create new member
const createMember = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      membership_type
    } = req.body;

    const connection = await getConnection();

    // Check if email already exists
    const existingMember = await connection.execute(
      `SELECT member_id FROM members WHERE email = :email`,
      { email }
    );

    if (existingMember.rows.length > 0) {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Member with this email already exists'
      });
    }

    // Generate temporary password and hash it
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    const result = await connection.execute(
      `INSERT INTO members (first_name, last_name, email, phone, address, membership_type, password_hash, password_changed)
       VALUES (:first_name, :last_name, :email, :phone, :address, :membership_type, :password_hash, 0)
       RETURNING member_id INTO :member_id`,
      {
        first_name,
        last_name,
        email,
        phone: phone || null,
        address: address || null,
        membership_type: membership_type || 'STUDENT',
        password_hash: passwordHash,
        member_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    const memberId = result.outBinds.member_id[0];
    await connection.close();

    // Send email with credentials (non-blocking)
    const memberName = `${first_name} ${last_name}`;
    sendMemberCreationEmail(email, memberName, temporaryPassword)
      .then(result => {
        if (result.success && !result.skipped) {
          console.log(`Email sent successfully to ${email}`);
        } else if (result.skipped) {
          console.log(`Email skipped (no email config). Credentials: ${email} / ${temporaryPassword}`);
        } else {
          console.error(`Failed to send email to ${email}:`, result.error);
        }
      })
      .catch(error => {
        console.error(`Error sending email to ${email}:`, error);
      });

    res.status(201).json({
      success: true,
      message: 'Member created successfully. Login credentials have been sent to the member\'s email.',
      data: { memberId }
    });
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create member',
      error: error.message
    });
  }
};

// Update member
const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      membership_type,
      status
    } = req.body;

    const connection = await getConnection();

    // Check if member exists
    const existingMember = await connection.execute(
      `SELECT member_id FROM members WHERE member_id = :id`,
      { id }
    );

    if (existingMember.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if email already exists (excluding current member)
    if (email) {
      const duplicateEmail = await connection.execute(
        `SELECT member_id FROM members WHERE email = :email AND member_id != :id`,
        { email, id }
      );

      if (duplicateEmail.rows.length > 0) {
        await connection.close();
        return res.status(400).json({
          success: false,
          message: 'Member with this email already exists'
        });
      }
    }

    // Update member
    await connection.execute(
      `UPDATE members SET 
         first_name = :first_name,
         last_name = :last_name,
         email = :email,
         phone = :phone,
         address = :address,
         membership_type = :membership_type,
         status = :status
       WHERE member_id = :id`,
      {
        first_name,
        last_name,
        email,
        phone: phone || null,
        address: address || null,
        membership_type: membership_type || 'STUDENT',
        status: status || 'ACTIVE',
        id
      }
    );

    await connection.close();

    res.json({
      success: true,
      message: 'Member updated successfully'
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update member',
      error: error.message
    });
  }
};

// Delete member
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getConnection();

    // Check if member exists
    const existingMember = await connection.execute(
      `SELECT member_id FROM members WHERE member_id = :id`,
      { id }
    );

    if (existingMember.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if member has active transactions
    const activeTransactions = await connection.execute(
      `SELECT COUNT(*) as count FROM transactions 
       WHERE member_id = :id AND status IN ('ISSUED', 'OVERDUE')`,
      { id }
    );

    if (activeTransactions.rows[0].COUNT > 0) {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Cannot delete member with active transactions'
      });
    }

    // Delete member
    await connection.execute(
      `DELETE FROM members WHERE member_id = :id`,
      { id }
    );

    await connection.close();

    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete member',
      error: error.message
    });
  }
};

// Get member's transaction history
const getMemberTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = '' } = req.query;
    const connection = await getConnection();

    let whereClause = 'WHERE t.member_id = :id';
    let bindVars = { id };

    if (status) {
      whereClause += ' AND t.status = :status';
      bindVars.status = status;
    }

    const result = await connection.execute(
      `SELECT t.transaction_id, t.issue_date, t.due_date, t.return_date, 
              t.fine_amount, t.status, b.title, b.author, b.isbn
       FROM transactions t
       JOIN books b ON t.book_id = b.book_id
       ${whereClause}
       ORDER BY t.issue_date DESC`,
      bindVars
    );
    await connection.close();

    const transactions = result.rows.map(row => ({
      transactionId: row.TRANSACTION_ID,
      issueDate: row.ISSUE_DATE,
      dueDate: row.DUE_DATE,
      returnDate: row.RETURN_DATE,
      fineAmount: row.FINE_AMOUNT,
      status: row.STATUS,
      book: {
        title: row.TITLE,
        author: row.AUTHOR,
        isbn: row.ISBN
      }
    }));

    res.json({
      success: true,
      data: { transactions }
    });
  } catch (error) {
    console.error('Get member transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch member transactions',
      error: error.message
    });
  }
};

// Get member's current borrowed books
const getMemberBorrowedBooks = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT t.transaction_id, t.issue_date, t.due_date, t.fine_amount, 
              b.title, b.author, b.isbn, b.book_id
       FROM transactions t
       JOIN books b ON t.book_id = b.book_id
       WHERE t.member_id = :id AND t.status IN ('ISSUED', 'OVERDUE')
       ORDER BY t.issue_date DESC`,
      { id }
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

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getMemberTransactions,
  getMemberBorrowedBooks
};
