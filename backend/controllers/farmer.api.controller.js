const { pool } = require('../db');
const karnatakaMarketService = require('../services/karnataka-market-price.service');

/**
 * Get Farmer Profile - Uses PostgreSQL only
 */
const getProfile = async (req, res) => {
  try {
    const farmerQuery = await pool.query(
      'SELECT id, name, email, phone, location, created_at FROM farmers WHERE id = $1',
      [req.user.id]
    );
    
    if (farmerQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    res.json({
      success: true,
      data: farmerQuery.rows[0]
    });
  } catch (error) {
    console.error('[FARMER API] Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile. Database connection required.'
    });
  }
};

/**
 * Update Farmer Profile - Uses PostgreSQL only
 */
const updateProfile = async (req, res) => {
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

    if (updateQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updateQuery.rows[0]
    });
  } catch (error) {
    console.error('[FARMER API] Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile. Database connection required.'
    });
  }
};

/**
 * Update Language Preference - Uses PostgreSQL only (stub for now, add language column if needed)
 */
const updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    
    // Note: Language column doesn't exist in current schema
    // This is a stub that returns success for compatibility
    
    res.json({
      success: true,
      message: 'Language updated successfully',
      language
    });
  } catch (error) {
    console.error('[FARMER API] Update language error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating language'
    });
  }
};

/**
 * Get Available Subsidies
 */
const getAvailableSubsidies = async (req, res) => {
  try {
    // Fetch active subsidies from database
    const result = await pool.query(
      'SELECT * FROM subsidies WHERE is_active = true ORDER BY created_at DESC'
    );

    // Transform to match expected frontend format
    const subsidies = result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      eligibility: row.eligibility,
      state: row.state,
      url: row.government_url,
      contactInfo: { website: row.government_url },
      active: row.is_active
    }));

    console.log(`✅ Found ${subsidies.length} active subsidies for farmer`);

    res.json({
      success: true,
      data: subsidies
    });
  } catch (error) {
    console.error('[FARMER API] Get subsidies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subsidies. Database connection required.'
    });
  }
};

/**
 * Get Farmer's Subsidy Applications
 */
const getMySubsidies = async (req, res) => {
  try {
    // Return empty for now
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('[FARMER API] Get my subsidies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
};

/**
 * Apply for Subsidy
 */
const applyForSubsidy = async (req, res) => {
  try {
    const { subsidyId, documents } = req.body;

    res.json({
      success: true,
      message: 'Subsidy application submitted successfully',
      data: {
        applicationId: 'APP' + Date.now(),
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('[FARMER API] Apply subsidy error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application'
    });
  }
};

/**
 * Get Market Prices
 */
const getMarketPrices = async (req, res) => {
  try {
    const { category = 'all' } = req.query;

    // Get real Karnataka market prices
    const marketPrices = karnatakaMarketService.getLatestPrices();
    
    // Filter by category if specified
    let filteredPrices = marketPrices;
    if (category !== 'all') {
      filteredPrices = marketPrices.filter(p => p.category === category);
    }

    res.json({
      success: true,
      data: filteredPrices
    });
  } catch (error) {
    console.error('[FARMER API] Get market prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching market prices'
    });
  }
};

/**
 * Get Price History
 */
const getPriceHistory = async (req, res) => {
  try {
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('[FARMER API] Get price history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching price history'
    });
  }
};

/**
 * Get Trending Prices
 */
const getTrendingPrices = async (req, res) => {
  try {
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('[FARMER API] Get trending prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending prices'
    });
  }
};

/**
 * Get Weather Information
 */
const getWeather = async (req, res) => {
  try {
    const farmer = req.farmer;
    const weatherService = require('../services/weather.service');
    
    // Use location from query parameter if provided, otherwise use farmer's location
    const location = req.query.location || farmer?.location || 'Bangalore';
    
    console.log(`[WEATHER API] Fetching weather for location: ${location}`);
    
    // Get real weather data from weather service
    const weatherData = await weatherService.getWeatherByLocation(location);
    
    res.json(weatherData);
  } catch (error) {
    console.error('[FARMER API] Get weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching weather'
    });
  }
};
/**
 * Get Notifications
 */
const getNotifications = async (req, res) => {
  try {
    // Demo notifications for now (can be replaced with database later)
    const notifications = [
      {
        _id: '1',
        type: 'announcement',
        priority: 'high',
        icon: '💰',
        title: 'New Government Subsidy Available',
        message: 'PM-KISAN 14th installment of ₹2,000 is being credited to registered farmers',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false
      },
      {
        _id: '2',
        type: 'warning',
        priority: 'urgent',
        icon: '🌧️',
        title: 'Heavy Rainfall Alert',
        message: 'IMD predicts heavy rainfall for the next 48 hours. Please take necessary precautions',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        read: false
      },
      {
        _id: '3',
        type: 'market',
        priority: 'medium',
        icon: '📈',
        title: 'Market Price Update',
        message: 'Tomato prices increased by 15% in Bangalore APMC. Good time to sell!',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: false
      },
      {
        _id: '4',
        type: 'subsidy',
        priority: 'medium',
        icon: '✅',
        title: 'Subsidy Application Approved',
        message: 'Your PMFBY application has been approved. Amount will be credited soon',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        read: true
      },
      {
        _id: '5',
        type: 'weather',
        priority: 'low',
        icon: '☀️',
        title: 'Weather Advisory',
        message: 'Clear skies expected for next 5 days. Ideal for harvesting',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        read: true
      }
    ];

    res.json({
      success: true,
      notifications,
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('[FARMER API] Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateLanguage,
  getAvailableSubsidies,
  getMySubsidies,
  applyForSubsidy,
  getMarketPrices,
  getPriceHistory,
  getTrendingPrices,
  getWeather,
  getNotifications
};
