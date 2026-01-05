const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

/**
 * Verify JWT Token and Extract User Info
 * Middleware to authenticate any user (admin or farmer)
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Access denied.'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Access denied.'
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
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * Verify MAIN_ADMIN Only - Uses PostgreSQL only
 * Middleware to ensure only the main admin can access protected routes
 * BLOCKS all other users including farmers
 */
const verifyMainAdmin = async (req, res, next) => {
  try {
    // First verify token
    await verifyToken(req, res, async () => {
      // Check if user has MAIN_ADMIN role
      if (req.user.role !== 'MAIN_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only main admin allowed'
        });
      }

      // PostgreSQL mode - set admin info from token
      req.admin = {
        _id: req.user.id,
        email: req.user.email,
        role: 'MAIN_ADMIN',
        isActive: true
      };
      
      return next();
    });
  } catch (error) {
    console.error('[ADMIN AUTH] Main admin verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication. Database connection required.'
    });
  }
};

/**
 * Verify Approved Farmer Only
 * Middleware to ensure only approved farmers can access farmer routes
 */
const verifyApprovedFarmer = async (req, res, next) => {
  try {
    // First verify token
    await verifyToken(req, res, async () => {
      const Farmer = require('../models/farmer.model');
      
      // Find farmer
      const farmer = await Farmer.findById(req.user.id).select('-password');
      
      if (!farmer) {
        return res.status(404).json({
          success: false,
          message: 'Farmer not found'
        });
      }

      // Check approval status
      if (farmer.status === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending admin approval. Please wait for approval.'
        });
      }

      if (farmer.status === 'rejected') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been rejected.',
          reason: farmer.rejectionReason || 'No reason provided'
        });
      }

      if (farmer.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact admin.'
        });
      }

      if (farmer.status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Invalid account status.'
        });
      }

      if (!farmer.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account is inactive'
        });
      }

      // Attach farmer to request
      req.farmer = farmer;
      
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization error',
      error: error.message
    });
  }
};

module.exports = {
  verifyToken,
  verifyMainAdmin,
  verifyApprovedFarmer
};
