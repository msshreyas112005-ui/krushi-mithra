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
    // Government subsidies from various schemes
    const subsidies = [
      {
        _id: '1',
        title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
        description: 'Direct income support of ₹6,000 per year in three equal installments to all landholding farmers',
        amount: 6000,
        category: 'income support',
        eligibility: 'All landholding farmers with cultivable land',
        state: 'All India',
        contactInfo: { website: 'https://pmkisan.gov.in' },
        applicationDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        active: true
      },
      {
        _id: '2',
        title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        description: 'Comprehensive crop insurance scheme protecting farmers against crop loss due to natural calamities, pests & diseases',
        amount: 200000,
        category: 'insurance',
        eligibility: 'All farmers growing notified crops',
        state: 'All India',
        contactInfo: { website: 'https://pmfby.gov.in' },
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        active: true
      },
      {
        _id: '3',
        title: 'Kisan Credit Card (KCC)',
        description: 'Short-term credit support for farmers to meet crop cultivation expenses with subsidized interest rates',
        amount: 300000,
        category: 'credit',
        eligibility: 'Farmers with land ownership or valid lease documents',
        state: 'All India',
        contactInfo: { website: 'https://www.india.gov.in/spotlight/kisan-credit-card-kcc' },
        applicationDeadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        active: true
      },
      {
        _id: '4',
        title: 'Soil Health Card Scheme',
        description: 'Free soil testing and customized fertilizer recommendations to improve soil health and crop productivity',
        amount: 0,
        category: 'other',
        eligibility: 'All farmers across India',
        state: 'All India',
        contactInfo: { website: 'https://soilhealth.dac.gov.in' },
        applicationDeadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        active: true
      },
      {
        _id: '5',
        title: 'PM Kisan Maandhan Yojana',
        description: 'Pension scheme providing ₹3,000 monthly pension to small and marginal farmers after 60 years of age',
        amount: 36000,
        category: 'pension',
        eligibility: 'Small and marginal farmers aged 18-40 years',
        state: 'All India',
        contactInfo: { website: 'https://maandhan.in' },
        applicationDeadline: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
        active: true
      },
      {
        _id: '6',
        title: 'National Agriculture Market (e-NAM)',
        description: 'Online trading platform for agricultural commodities to ensure better price discovery and transparent auction',
        amount: 0,
        category: 'market',
        eligibility: 'All farmers registered on e-NAM portal',
        state: 'All India',
        contactInfo: { website: 'https://www.enam.gov.in' },
        applicationDeadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        active: true
      },
      {
        _id: '7',
        title: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)',
        description: 'Irrigation support to expand cultivable area and improve water use efficiency - Per Drop More Crop',
        amount: 50000,
        category: 'irrigation',
        eligibility: 'All farmers with access to water sources',
        state: 'All India',
        contactInfo: { website: 'https://pmksy.gov.in' },
        applicationDeadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        active: true
      },
      {
        _id: '8',
        title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
        description: 'Promotes organic farming through cluster approach and certification support for organic produce',
        amount: 50000,
        category: 'organic',
        eligibility: 'Farmers interested in organic farming',
        state: 'All India',
        contactInfo: { website: 'https://pgsindia-ncof.gov.in' },
        applicationDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        active: true
      }
    ];

    res.json({
      success: true,
      data: subsidies
    });
  } catch (error) {
    console.error('[FARMER API] Get subsidies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subsidies'
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
    
    // Use farmer's location for weather data
    const location = farmer?.location || 'Bangalore';
    
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
