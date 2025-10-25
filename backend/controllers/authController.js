const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../config/database');

// Admin login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const connection = await getConnection();

    // Find admin by username
    const result = await connection.execute(
      `SELECT admin_id, username, email, password_hash, first_name, last_name, role, status 
       FROM admins WHERE username = :username`,
      { username }
    );
    await connection.close();

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const admin = result.rows[0];

    // Check if admin is active
    if (admin.STATUS !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.PASSWORD_HASH);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.ADMIN_ID,
        username: admin.USERNAME,
        role: admin.ROLE 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin.ADMIN_ID,
          username: admin.USERNAME,
          email: admin.EMAIL,
          firstName: admin.FIRST_NAME,
          lastName: admin.LAST_NAME,
          role: admin.ROLE
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current admin profile
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.user.ADMIN_ID,
        username: req.user.USERNAME,
        email: req.user.EMAIL,
        firstName: req.user.FIRST_NAME,
        lastName: req.user.LAST_NAME,
        role: req.user.ROLE
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const connection = await getConnection();

    // Get current admin with password
    const result = await connection.execute(
      `SELECT password_hash FROM admins WHERE admin_id = :admin_id`,
      { admin_id: req.user.ADMIN_ID }
    );

    if (result.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, result.rows[0].PASSWORD_HASH);
    if (!isCurrentPasswordValid) {
      await connection.close();
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await connection.execute(
      `UPDATE admins SET password_hash = :password_hash WHERE admin_id = :admin_id`,
      { password_hash: hashedPassword, admin_id: req.user.ADMIN_ID }
    );
    await connection.close();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Logout (client-side token removal)
const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

module.exports = {
  login,
  getProfile,
  changePassword,
  logout
};
