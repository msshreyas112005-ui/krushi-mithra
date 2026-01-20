const jwt = require('jsonwebtoken');
const { pool } = require('../db');

/**
 * Verify Farmer JWT Token - Uses PostgreSQL only
 * Middleware to authenticate farmer requests
 */
const verifyFarmerToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // PostgreSQL mode - verify farmer exists in database
    const farmerQuery = await pool.query(
      'SELECT id, name, email, phone, location, is_approved FROM farmers WHERE id = $1',
      [decoded.id]
    );

    if (farmerQuery.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Farmer not found in database.'
      });
    }

    const farmer = farmerQuery.rows[0];

    // Attach farmer info to request
    req.user = {
      id: farmer.id,
      email: farmer.email,
      fullName: farmer.name,
      role: 'FARMER'
    };
    req.farmer = farmer;

    next();
  } catch (error) {
    console.error('[FARMER AUTH] Token verification failed:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed. Database connection required.'
    });
  }
};

module.exports = {
  verifyFarmerToken
};
