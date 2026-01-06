const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmer.postgres.controller');
const subsidyController = require('../controllers/subsidy.postgres.controller');
const marketPriceController = require('../controllers/marketPrice.postgres.controller');
const notificationController = require('../controllers/notification.postgres.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');
const jwt = require('jsonwebtoken');

// ==================== FARMER ROUTES ====================

/**
 * @route   POST /api/farmers/register
 * @desc    Register a new farmer
 * @access  Public
 */
router.post('/farmers/register', farmerController.registerFarmer);

/**
 * @route   POST /api/farmers/login
 * @desc    Login farmer
 * @access  Public
 */
router.post('/farmers/login', farmerController.loginFarmer);

/**
 * @route   GET /api/farmers/profile
 * @desc    Get farmer profile
 * @access  Private (Farmer)
 */
router.get('/farmers/profile', verifyToken, farmerController.getFarmerProfile);

/**
 * @route   PUT /api/farmers/profile
 * @desc    Update farmer profile
 * @access  Private (Farmer)
 */
router.put('/farmers/profile', verifyToken, farmerController.updateFarmerProfile);

// ==================== ADMIN ROUTES ====================

/**
 * @route   POST /api/admin/login
 * @desc    Admin login
 * @access  Public
 */
router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple hardcoded admin check (from .env)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@krushimithra.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  
  console.log('[ADMIN LOGIN] Login attempt for:', email);
  
  if (email === adminEmail && password === adminPassword) {
    const token = jwt.sign(
      { email: adminEmail, role: 'MAIN_ADMIN' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('[ADMIN LOGIN] ✅ Login successful');
    
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: { email: adminEmail, role: 'MAIN_ADMIN' }
    });
  }
  
  console.log('[ADMIN LOGIN] ❌ Invalid credentials');
  res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  });
});

/**
 * @route   GET /api/admin/farmers
 * @desc    Get all farmers (Admin)
 * @access  Private (Admin)
 */
router.get('/admin/farmers', farmerController.getAllFarmers);

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/admin/stats', farmerController.getDashboardStats);

// ==================== SUBSIDY ROUTES ====================

/**
 * @route   GET /api/subsidies
 * @desc    Get all active subsidies
 * @access  Public
 */
router.get('/subsidies', subsidyController.getAllSubsidies);

/**
 * @route   GET /api/admin/subsidies
 * @desc    Get all subsidies (Admin)
 * @access  Private (Admin)
 */
router.get('/admin/subsidies', subsidyController.getAllSubsidies);

/**
 * @route   POST /api/admin/subsidies
 * @desc    Create new subsidy
 * @access  Private (Admin)
 */
router.post('/admin/subsidies', subsidyController.createSubsidy);

/**
 * @route   GET /api/admin/subsidies/:id
 * @desc    Get single subsidy
 * @access  Private (Admin)
 */
router.get('/admin/subsidies/:id', subsidyController.getSubsidy);

/**
 * @route   PUT /api/admin/subsidies/:id
 * @desc    Update subsidy
 * @access  Private (Admin)
 */
router.put('/admin/subsidies/:id', subsidyController.updateSubsidy);

/**
 * @route   DELETE /api/admin/subsidies/:id
 * @desc    Delete subsidy
 * @access  Private (Admin)
 */
router.delete('/admin/subsidies/:id', subsidyController.deleteSubsidy);

// ==================== MARKET PRICE ROUTES ====================

/**
 * @route   GET /api/market-prices
 * @desc    Get all market prices
 * @access  Public
 */
router.get('/market-prices', marketPriceController.getAllMarketPrices);

/**
 * @route   GET /api/farmer/market-prices
 * @desc    Get market prices for farmers
 * @access  Public
 */
router.get('/farmer/market-prices', marketPriceController.getAllMarketPrices);

/**
 * @route   POST /api/admin/market-prices
 * @desc    Add/Update market price
 * @access  Private (Admin)
 */
router.post('/admin/market-prices', marketPriceController.addMarketPrice);

/**
 * @route   POST /api/admin/market-prices/bulk
 * @desc    Bulk add/update market prices
 * @access  Private (Admin)
 */
router.post('/admin/market-prices/bulk', marketPriceController.bulkAddMarketPrices);

/**
 * @route   DELETE /api/admin/market-prices/:id
 * @desc    Delete market price
 * @access  Private (Admin)
 */
router.delete('/admin/market-prices/:id', marketPriceController.deleteMarketPrice);

// ==================== NOTIFICATION ROUTES ====================

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications
 * @access  Public
 */
router.get('/notifications', notificationController.getAllNotifications);

/**
 * @route   POST /api/admin/notifications
 * @desc    Create new notification
 * @access  Private (Admin)
 */
router.post('/admin/notifications', notificationController.createNotification);

/**
 * @route   GET /api/admin/notifications/:id
 * @desc    Get single notification
 * @access  Private (Admin)
 */
router.get('/admin/notifications/:id', notificationController.getNotification);

/**
 * @route   DELETE /api/admin/notifications/:id
 * @desc    Delete notification
 * @access  Private (Admin)
 */
router.delete('/admin/notifications/:id', notificationController.deleteNotification);

module.exports = router;
