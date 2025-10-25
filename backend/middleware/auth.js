const jwt = require('jsonwebtoken');
const { getConnection } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists in database
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT admin_id, username, email, role, status FROM admins 
       WHERE admin_id = :admin_id AND status = 'ACTIVE'`,
      { admin_id: decoded.adminId }
    );
    await connection.close();

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token or user not found' 
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'LIBRARIAN') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
};

// Middleware to check super admin role
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ 
      success: false, 
      message: 'Super admin access required' 
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
};
