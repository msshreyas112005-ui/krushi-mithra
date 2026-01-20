const db = require('../config/database.postgres');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Get Dashboard Statistics
 * Returns real-time counts from database
 */
const getDashboardStats = async (req, res) => {
  try {
    // Check if PostgreSQL is configured
    if (!db.isConfigured()) {
      // Fallback to demo mode
      return res.json({
        success: true,
        stats: {
          totalFarmers: 0,
          pendingApprovals: 0,
          approvedFarmers: 0,
          marketPrices: 0
        },
        mode: 'demo'
      });
    }

    // Get real counts from database
    const [farmersCount, approvedCount, marketCount] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM farmers'),
      db.query('SELECT COUNT(*) as count FROM farmers WHERE is_approved = true'),
      db.query('SELECT COUNT(DISTINCT crop_name) as count FROM market_prices WHERE updated_at >= CURRENT_DATE - INTERVAL \'7 days\'')
    ]);

    const stats = {
      totalFarmers: parseInt(farmersCount.rows[0].count),
      pendingApprovals: 0, // No pending system in simplified schema
      approvedFarmers: parseInt(approvedCount.rows[0].count),
      marketPrices: parseInt(marketCount.rows[0].count)
    };

    console.log('📊 Dashboard stats:', stats);

    res.json({
      success: true,
      stats,
      mode: 'database'
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    
    // Fallback to zero counts on error
    res.json({
      success: true,
      stats: {
        totalFarmers: 0,
        pendingApprovals: 0,
        approvedFarmers: 0,
        marketPrices: 0
      },
      mode: 'error-fallback',
      error: error.message
    });
  }
};

/**
 * Get All Farmers with filtering
 */
const getAllFarmers = async (req, res) => {
  try {
    const { status, page = 1, limit = 50, search } = req.query;

    if (!db.isConfigured()) {
      return res.json({
        success: true,
        farmers: [],
        pagination: { total: 0, page: 1, limit, pages: 0 }
      });
    }

    let query = 'SELECT id, full_name, email, mobile, location, district, primary_crop, status, created_at FROM farmers';
    let countQuery = 'SELECT COUNT(*) as count FROM farmers';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    // Add status filter
    if (status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Add search filter
    if (search) {
      conditions.push(`(
        full_name ILIKE $${paramIndex} OR 
        email ILIKE $${paramIndex} OR 
        mobile LIKE $${paramIndex} OR 
        location ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Apply conditions
    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    // Add ordering and pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    // Execute queries
    const [farmersResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2)) // Exclude limit and offset for count
    ]);

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      farmers: farmersResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching farmers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farmers',
      error: error.message
    });
  }
};

/**
 * Approve Farmer
 */
const approveFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const adminId = req.user?.id || 1;

    if (!db.isConfigured()) {
      return res.json({
        success: true,
        message: 'Farmer approved (demo mode)'
      });
    }

    const result = await db.query(
      `UPDATE farmers 
       SET status = $1, approved_at = CURRENT_TIMESTAMP, approved_by = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, full_name, email, status`,
      ['approved', adminId, farmerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    console.log('✅ Farmer approved:', result.rows[0]);

    res.json({
      success: true,
      message: 'Farmer approved successfully',
      farmer: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error approving farmer:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving farmer',
      error: error.message
    });
  }
};

/**
 * Reject Farmer
 */
const rejectFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { reason } = req.body;

    if (!db.isConfigured()) {
      return res.json({
        success: true,
        message: 'Farmer rejected (demo mode)'
      });
    }

    const result = await db.query(
      `UPDATE farmers 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, full_name, email, status`,
      ['rejected', farmerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    console.log('❌ Farmer rejected:', result.rows[0]);

    res.json({
      success: true,
      message: 'Farmer rejected successfully',
      farmer: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error rejecting farmer:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting farmer',
      error: error.message
    });
  }
};

/**
 * Get Market Price Statistics
 */
const getMarketStats = async (req, res) => {
  try {
    if (!db.isConfigured()) {
      return res.json({
        success: true,
        stats: {
          totalCommodities: 0,
          vegetables: 0,
          fruits: 0,
          grains: 0,
          lastUpdated: new Date()
        }
      });
    }

    const result = await db.query(`
      SELECT 
        COUNT(DISTINCT crop_name) as total,
        MAX(updated_at) as last_updated
      FROM market_prices
      WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days'
    `);

    const stats = result.rows[0];

    res.json({
      success: true,
      stats: {
        totalCommodities: parseInt(stats.total) || 0,
        vegetables: 0,
        fruits: 0,
        grains: 0,
        lastUpdated: stats.last_updated
      }
    });
  } catch (error) {
    console.error('❌ Error fetching market stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching market statistics',
      error: error.message
    });
  }
};

/**
 * Get Recent Market Prices
 */
const getRecentMarketPrices = async (req, res) => {
  try {
    const { limit = 20, type, district } = req.query;

    if (!db.isConfigured()) {
      return res.json({
        success: true,
        prices: []
      });
    }

    let query = `
      SELECT 
        crop_name, 
        market_name, 
        price, 
        unit, 
        updated_at
      FROM market_prices
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Note: type and district filters removed as columns don't exist in current schema
    
    query += ` ORDER BY updated_at DESC, crop_name LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await db.query(query, params);

    res.json({
      success: true,
      prices: result.rows
    });
  } catch (error) {
    console.error('❌ Error fetching market prices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching market prices',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllFarmers,
  approveFarmer,
  rejectFarmer,
  getMarketStats,
  getRecentMarketPrices
};
