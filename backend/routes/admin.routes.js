const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { verifyMainAdmin } = require('../middleware/admin.auth.middleware');
const { pool } = require('../db');

// Import PostgreSQL controller for dynamic stats
const adminPgController = require('../controllers/admin.postgres.controller');

// Import market price service
const karnatakaMarketService = require('../services/karnataka-market-price.service');

/**
 * @route   POST /api/admin/login
 * @desc    Main Admin Login - Uses environment variables (PostgreSQL mode only)
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[ADMIN LOGIN] Received login request for:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // PostgreSQL mode - validate against environment variables
    console.log('[ADMIN LOGIN] Using PostgreSQL authentication');
    
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('[ADMIN LOGIN] Admin credentials not set in environment');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Database connection required.'
      });
    }

    // Check credentials
    if (email.toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
      console.log('[ADMIN LOGIN] Invalid credentials');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: 'main_admin_postgresql',
        email: adminEmail,
        role: 'MAIN_ADMIN'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('[ADMIN LOGIN] Login successful');

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        email: adminEmail,
        role: 'MAIN_ADMIN',
        isActive: true,
        lastLogin: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[ADMIN LOGIN] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Database connection required.',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/farmers
 * @desc    Get all farmer registrations with filtering
 * @access  Private (MAIN_ADMIN only)
 */
router.get('/farmers', verifyMainAdmin, async (req, res) => {
  try {
    const { search, page = 1, limit = 100 } = req.query;

    console.log('[ADMIN FARMERS] Fetching all farmers from Neon PostgreSQL');

    // Query PostgreSQL directly - match actual schema
    let query = 'SELECT id, name, email, phone, location, is_approved, created_at, last_login FROM farmers';
    let params = [];
    let whereClauses = [];

    // Filter by is_approved (always show approved farmers by default)
    whereClauses.push('is_approved = true');

    // Filter by search
    if (search) {
      const searchParam = `%${search.toLowerCase()}%`;
      whereClauses.push(`(LOWER(name) LIKE $${params.length + 1} OR LOWER(email) LIKE $${params.length + 2} OR phone LIKE $${params.length + 3} OR LOWER(location) LIKE $${params.length + 4})`);
      params.push(searchParam, searchParam, search, searchParam);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Sort by created_at (newest first)
    query += ' ORDER BY created_at DESC';

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);
    
    // Map database fields to frontend-expected format
    const farmers = result.rows.map(farmer => ({
      id: farmer.id,
      fullName: farmer.name,
      name: farmer.name,
      email: farmer.email,
      mobile: farmer.phone,
      phone: farmer.phone,
      location: farmer.location,
      isActive: farmer.is_approved,
      status: farmer.is_approved ? 'approved' : 'pending',
      registeredAt: farmer.created_at,
      createdAt: farmer.created_at,
      lastLogin: farmer.last_login
    }));

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM farmers WHERE is_approved = true';
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    console.log('[ADMIN FARMERS] ✅ Found', total, 'approved farmers in Neon DB');

    return res.json({
      success: true,
      farmers: farmers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('[ADMIN FARMERS] ❌ Error fetching farmers from Neon DB:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch farmers. Database connection required.',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/farmers/:id/approve
 * @desc    Approve farmer account - Uses PostgreSQL only
 * @access  Private (MAIN_ADMIN only)
 */
router.put('/farmers/:id/approve', verifyMainAdmin, async (req, res) => {
  try {
    console.log('[ADMIN APPROVE] Approving farmer:', req.params.id);

    // Update farmer status in PostgreSQL
    const updateQuery = await pool.query(
      'UPDATE farmers SET is_approved = true WHERE id = $1 RETURNING id, name, email, phone, location',
      [req.params.id]
    );

    if (updateQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    console.log('[ADMIN APPROVE] ✅ Farmer approved:', updateQuery.rows[0].email);

    return res.json({
      success: true,
      message: 'Farmer approved successfully',
      farmer: updateQuery.rows[0]
    });

  } catch (error) {
    console.error('[ADMIN APPROVE] Error approving farmer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve farmer. Database connection required.',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/farmers/:id/reject
 * @desc    Reject farmer account - Uses PostgreSQL only
 * @access  Private (MAIN_ADMIN only)
 */
router.put('/farmers/:id/reject', verifyMainAdmin, async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Update farmer in PostgreSQL
    const updateQuery = await pool.query(
      'UPDATE farmers SET is_approved = false WHERE id = $1 RETURNING id, name, email, phone, location',
      [req.params.id]
    );

    if (updateQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.json({
      success: true,
      message: 'Farmer rejected successfully',
      farmer: updateQuery.rows[0]
    });

  } catch (error) {
    console.error('Error rejecting farmer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject farmer. Database connection required.',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/farmers/:id/suspend
 * @desc    Suspend farmer account - Uses PostgreSQL only
 * @access  Private (MAIN_ADMIN only)
 */
router.put('/farmers/:id/suspend', verifyMainAdmin, async (req, res) => {
  try {
    const { reason } = req.body;

    // Update farmer in PostgreSQL
    const updateQuery = await pool.query(
      'UPDATE farmers SET is_approved = false WHERE id = $1 RETURNING id, name, email, phone, location',
      [req.params.id]
    );

    if (updateQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.json({
      success: true,
      message: 'Farmer suspended successfully',
      farmer: updateQuery.rows[0]
    });

  } catch (error) {
    console.error('Error suspending farmer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend farmer. Database connection required.',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/farmers/:id
 * @desc    Delete farmer from database - Uses PostgreSQL only
 * @access  Private (MAIN_ADMIN only)
 */
router.delete('/farmers/:id', verifyMainAdmin, async (req, res) => {
  try {
    console.log('[ADMIN DELETE] Deleting farmer:', req.params.id);

    // Delete farmer from PostgreSQL
    const deleteQuery = await pool.query(
      'DELETE FROM farmers WHERE id = $1 RETURNING id, name, email',
      [req.params.id]
    );

    if (deleteQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    console.log('[ADMIN DELETE] ✅ Farmer deleted:', deleteQuery.rows[0].email);

    res.json({
      success: true,
      message: 'Farmer deleted successfully',
      farmer: deleteQuery.rows[0]
    });

  } catch (error) {
    console.error('[ADMIN DELETE] ❌ Error deleting farmer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete farmer. Database connection required.',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/subsidies
 * @desc    Get all subsidies - Uses PostgreSQL only
 * @access  Private (MAIN_ADMIN only)
 */
router.get('/subsidies', verifyMainAdmin, async (req, res) => {
  try {
    const subsidiesQuery = await pool.query(
      'SELECT * FROM subsidies ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      count: subsidiesQuery.rows.length,
      subsidies: subsidiesQuery.rows
    });

  } catch (error) {
    console.error('Error fetching subsidies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subsidies. Database connection required.',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/subsidies
 * @desc    Create new subsidy scheme - Uses PostgreSQL only
 * @access  Private (MAIN_ADMIN only)
 */
router.post('/subsidies', verifyMainAdmin, async (req, res) => {
  try {
    const { title, description, government_url, category, state, eligibility } = req.body;

    const insertQuery = await pool.query(
      `INSERT INTO subsidies (title, description, government_url, category, state, eligibility, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       RETURNING *`,
      [title, description, government_url, category || 'other', state || 'All India', eligibility || '']
    );

    res.status(201).json({
      success: true,
      message: 'Subsidy created successfully',
      subsidy: insertQuery.rows[0]
    });

  } catch (error) {
    console.error('Error creating subsidy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subsidy. Database connection required.',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/subsidies/:id
 * @desc    Update subsidy scheme - Uses PostgreSQL only
 * @access  Private (MAIN_ADMIN only)
 */
router.put('/subsidies/:id', verifyMainAdmin, async (req, res) => {
  try {
    const { title, description, government_url, category, state, eligibility, is_active } = req.body;

    const updateQuery = await pool.query(
      `UPDATE subsidies 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           government_url = COALESCE($3, government_url),
           category = COALESCE($4, category),
           state = COALESCE($5, state),
           eligibility = COALESCE($6, eligibility),
           is_active = COALESCE($7, is_active)
       WHERE id = $8
       RETURNING *`,
      [title, description, government_url, category, state, eligibility, is_active, req.params.id]
    );

    if (updateQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subsidy not found'
      });
    }

    res.json({
      success: true,
      message: 'Subsidy updated successfully',
      subsidy: updateQuery.rows[0]
    });

  } catch (error) {
    console.error('Error updating subsidy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subsidy. Database connection required.',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/subsidies/:id
 * @desc    Delete subsidy scheme - Uses PostgreSQL only
 * @access  Private (MAIN_ADMIN only)
 */
router.delete('/subsidies/:id', verifyMainAdmin, async (req, res) => {
  try {
    const deleteQuery = await pool.query(
      'DELETE FROM subsidies WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (deleteQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subsidy not found'
      });
    }

    res.json({
      success: true,
      message: 'Subsidy deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subsidy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subsidy. Database connection required.',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/notifications/broadcast
 * @desc    Send notification to all farmers
 * @access  Private (MAIN_ADMIN only)
 */
router.post('/notifications/broadcast', verifyMainAdmin, async (req, res) => {
  try {
    const { title, message, type = 'announcement', priority = 'medium' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Get all approved farmers
    const farmers = await Farmer.find({ status: 'approved' }).select('_id');

    // Create notifications for all farmers
    const notifications = farmers.map(farmer => ({
      farmer: farmer._id,
      title,
      message,
      type,
      priority
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: `Notification sent to ${farmers.length} farmers`,
      count: farmers.length
    });

  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/statistics
 * @desc    Get platform statistics
 * @access  Private (MAIN_ADMIN only)
 */
router.get('/statistics', verifyMainAdmin, async (req, res) => {
  try {
    const [
      totalFarmers,
      pendingFarmers,
      approvedFarmers,
      rejectedFarmers,
      totalSubsidies,
      activeSubsidies
    ] = await Promise.all([
      Farmer.countDocuments(),
      Farmer.countDocuments({ status: 'pending' }),
      Farmer.countDocuments({ status: 'approved' }),
      Farmer.countDocuments({ status: 'rejected' }),
      Subsidy.countDocuments(),
      Subsidy.countDocuments({ isActive: true })
    ]);

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = await Farmer.countDocuments({
      registeredAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      statistics: {
        farmers: {
          total: totalFarmers,
          pending: pendingFarmers,
          approved: approvedFarmers,
          rejected: rejectedFarmers,
          recentRegistrations
        },
        subsidies: {
          total: totalSubsidies,
          active: activeSubsidies
        }
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/notifications
 * @desc    Create and send notification to farmers (with email support)
 * @access  Admin only
 */
const notificationController = require('../controllers/notification.controller');
router.post('/notifications', verifyMainAdmin, notificationController.createNotification);

/**
 * @route   POST /api/admin/notifications/broadcast
 * @desc    Create and broadcast notification to farmers (legacy endpoint)
 * @access  Admin only
 */
router.post('/notifications/broadcast', verifyMainAdmin, notificationController.createNotification);

/**
 * @route   GET /api/admin/notifications
 * @desc    Get admin notifications
 * @access  Admin only
 */
router.get('/notifications', verifyMainAdmin, notificationController.getAdminNotifications);

// ==================== DYNAMIC STATISTICS ROUTES (PostgreSQL) ====================
// New routes for real-time dashboard statistics

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics (real-time from database)
 * @access  Admin
 */
router.get('/stats', adminPgController.getDashboardStats);

/**
 * @route   GET /api/admin/market/stats
 * @desc    Get market price statistics
 * @access  Admin
 */
router.get('/market/stats', adminPgController.getMarketStats);

/**
 * @route   GET /api/admin/market/prices
 * @desc    Get recent market prices
 * @access  Admin
 */
router.get('/market/prices', adminPgController.getRecentMarketPrices);

/**
 * @route   POST /api/admin/market/update
 * @desc    Manually trigger market price update
 * @access  Admin
 */
router.post('/market/update', async (req, res) => {
  try {
    console.log('🔄 Manual market price update triggered by admin');
    const result = await karnatakaMarketService.updateMarketPrices();
    
    res.json({
      success: result.success,
      message: result.success ? 'Market prices updated successfully' : 'Market price update failed',
      data: result
    });
  } catch (error) {
    console.error('❌ Market update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating market prices',
      error: error.message
    });
  }
});

module.exports = router;
