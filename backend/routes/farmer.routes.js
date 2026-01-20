const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { verifyApprovedFarmer } = require('../middleware/admin.auth.middleware');

/**
 * @route   POST /api/farmers/register
 * @desc    Farmer registration - Uses PostgreSQL (Neon) database only
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, mobile, password, location, cropType, language } = req.body;

    console.log('[FARMER REGISTER] Registration attempt for:', email);

    // Validate required fields
    if (!fullName || !email || !mobile || !password || !location || !cropType) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if farmer already exists in PostgreSQL
    const existingFarmerQuery = await pool.query(
      'SELECT id FROM farmers WHERE email = $1 OR phone = $2',
      [email.toLowerCase(), mobile]
    );

    if (existingFarmerQuery.rows.length > 0) {
      console.log('[FARMER REGISTER] Farmer already exists');
      return res.status(409).json({
        success: false,
        message: 'Farmer with this email or mobile number already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new farmer into PostgreSQL with crop information
    const insertQuery = await pool.query(
      `INSERT INTO farmers (name, email, phone, location, password, language, is_approved, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       RETURNING id, name, email, phone, location, language, created_at`,
      [fullName, email.toLowerCase(), mobile, location, hashedPassword, language || 'en']
    );

    const farmer = insertQuery.rows[0];
    console.log('[FARMER REGISTER] ✅ Farmer registered:', farmer.email, 'Location:', farmer.location);

    // Send welcome email notification
    try {
      const notificationService = require('../services/notification.service');
      await notificationService.sendRegistrationEmail({
        email: farmer.email,
        name: farmer.name
      });
      console.log('[FARMER REGISTER] 📧 Welcome email sent to:', farmer.email);
    } catch (emailError) {
      console.error('[FARMER REGISTER] ⚠️ Email send failed:', emailError.message);
      // Continue even if email fails
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login.',
      farmer: {
        id: farmer.id,
        fullName: farmer.name,
        email: farmer.email,
        mobile: farmer.phone,
        location: farmer.location,
        registeredAt: farmer.created_at
      }
    });

  } catch (error) {
    console.error('[FARMER REGISTER] Error:', error);
    console.error('[FARMER REGISTER] Error code:', error.code);
    console.error('[FARMER REGISTER] Error message:', error.message);
    
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(409).json({
        success: false,
        message: 'Email or mobile number already registered'
      });
    }

    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
      return res.status(503).json({
        success: false,
        message: 'Database connection failed. Please contact support.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Generic error with actual error message for debugging
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/farmers/login
 * @desc    Farmer login - Uses PostgreSQL (Neon) database only
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[FARMER LOGIN] 🔐 Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      console.log('[FARMER LOGIN] ❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find farmer in PostgreSQL
    const farmerQuery = await pool.query(
      'SELECT id, name, email, phone, location, password, is_approved FROM farmers WHERE email = $1',
      [email.toLowerCase()]
    );

    if (farmerQuery.rows.length === 0) {
      console.log('[FARMER LOGIN] ❌ Farmer not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const farmer = farmerQuery.rows[0];
    console.log('[FARMER LOGIN] ✅ Farmer found:', farmer.email);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, farmer.password);

    if (!isPasswordValid) {
      console.log('[FARMER LOGIN] ❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('[FARMER LOGIN] ✅ Password verified for:', email);

    // Update last login
    await pool.query(
      'UPDATE farmers SET last_login = NOW() WHERE id = $1',
      [farmer.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        id: farmer.id,
        email: farmer.email,
        role: 'farmer'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('[FARMER LOGIN] ✅ Login successful for:', email);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      farmer: {
        id: farmer.id,
        fullName: farmer.name,
        email: farmer.email,
        mobile: farmer.phone,
        location: farmer.location
      }
    });

  } catch (error) {
    console.error('[FARMER LOGIN] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Database connection required.',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/farmers/profile
 * @desc    Get farmer profile - Uses PostgreSQL only
 * @access  Private
 */
router.get('/profile', verifyApprovedFarmer, async (req, res) => {
  try {
    const farmerQuery = await pool.query(
      'SELECT id, name, email, phone, location, crop_type, crop_date, crop_location, language, created_at FROM farmers WHERE id = $1',
      [req.user.id]
    );

    if (farmerQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.json({
      success: true,
      farmer: farmerQuery.rows[0]
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile. Please try again.',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/farmers/profile
 * @desc    Update farmer profile - Uses PostgreSQL only
 * @access  Private
 */
router.put('/profile', verifyApprovedFarmer, async (req, res) => {
  try {
    const { fullName, mobile, location } = req.body;

    const updateQuery = await pool.query(
      `UPDATE farmers 
       SET name = COALESCE($1, name), 
           phone = COALESCE($2, phone), 
           location = COALESCE($3, location)
       WHERE id = $4
       RETURNING id, name, email, phone, location`,
      [fullName, mobile, location, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      farmer: updateQuery.rows[0]
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. Database connection required.',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/farmers/subsidies
 * @desc    Get all active subsidies - Uses PostgreSQL only
 * @access  Private
 */
router.get('/subsidies', verifyApprovedFarmer, async (req, res) => {
  try {
    const { category, state } = req.query;

    let query = 'SELECT * FROM subsidies WHERE is_active = true';
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (state) {
      query += ` AND state = $${paramCount}`;
      params.push(state);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const subsidiesQuery = await pool.query(query, params);

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
 * @route   GET /api/farmers/notifications
 * @desc    Get farmer notifications - Uses PostgreSQL only
 * @access  Private
 */
router.get('/notifications', verifyApprovedFarmer, async (req, res) => {
  try {
    const notificationsQuery = await pool.query(
      `SELECT * FROM notifications 
       WHERE target_audience IN ('all', 'farmers')
       ORDER BY created_at DESC
       LIMIT 50`
    );

    res.json({
      success: true,
      count: notificationsQuery.rows.length,
      notifications: notificationsQuery.rows
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications. Database connection required.',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/farmers/notifications/:id/read
 * @desc    Mark notification as read (stub - notifications table doesn't track individual reads)
 * @access  Private
 */
router.put('/notifications/:id/read', verifyApprovedFarmer, async (req, res) => {
  try {
    // This is a stub endpoint since notifications table doesn't track individual farmer reads
    // In future, you can add a separate table for farmer_notification_reads
    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification',
      error: error.message
    });
  }
});

module.exports = router;
