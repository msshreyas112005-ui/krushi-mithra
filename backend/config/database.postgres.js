const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Required for Neon and most cloud PostgreSQL
  } : false,
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection on startup
pool.on('connect', (client) => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on PostgreSQL client', err);
});

/**
 * Execute a SQL query
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('📊 Query executed', { 
        text: text.substring(0, 100), 
        duration: `${duration}ms`, 
        rows: res.rowCount 
      });
    }
    
    return res;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  }
}

/**
 * Get a client from the pool (for transactions)
 * @returns {Promise<Object>} Database client
 */
async function getClient() {
  const client = await pool.connect();
  return client;
}

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Database connection test successful');
    console.log('   PostgreSQL version:', result.rows[0].pg_version.split(',')[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
}

/**
 * Check if database is configured
 * @returns {boolean} Configuration status
 */
function isConfigured() {
  return !!process.env.DATABASE_URL;
}

/**
 * Initialize database schema
 * @returns {Promise<void>}
 */
async function initializeSchema() {
  try {
    console.log('🔄 Checking database schema...');
    
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create farmers table
    await query(`
      CREATE TABLE IF NOT EXISTS farmers (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        mobile VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        district VARCHAR(100),
        taluk VARCHAR(100),
        village VARCHAR(100),
        land_size DECIMAL(10, 2),
        primary_crop VARCHAR(100),
        language VARCHAR(10) DEFAULT 'en',
        status VARCHAR(50) DEFAULT 'pending',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        approved_by INTEGER REFERENCES users(id)
      )
    `);
    
    // Create indexes for farmers
    await query(`
      CREATE INDEX IF NOT EXISTS idx_farmers_status ON farmers(status);
      CREATE INDEX IF NOT EXISTS idx_farmers_email ON farmers(email);
      CREATE INDEX IF NOT EXISTS idx_farmers_mobile ON farmers(mobile);
    `);
    
    // Create market_prices table
    await query(`
      CREATE TABLE IF NOT EXISTS market_prices (
        id SERIAL PRIMARY KEY,
        commodity_name VARCHAR(255) NOT NULL,
        commodity_type VARCHAR(50) NOT NULL,
        market_name VARCHAR(255) NOT NULL,
        state VARCHAR(100) DEFAULT 'Karnataka',
        district VARCHAR(100),
        min_price DECIMAL(10, 2),
        max_price DECIMAL(10, 2),
        modal_price DECIMAL(10, 2),
        unit VARCHAR(50) DEFAULT 'Quintal',
        price_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for market_prices
    await query(`
      CREATE INDEX IF NOT EXISTS idx_market_prices_date ON market_prices(price_date DESC);
      CREATE INDEX IF NOT EXISTS idx_market_prices_commodity ON market_prices(commodity_name);
      CREATE INDEX IF NOT EXISTS idx_market_prices_district ON market_prices(district);
    `);
    
    // Create subsidies table
    await query(`
      CREATE TABLE IF NOT EXISTS subsidies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        state VARCHAR(100),
        amount DECIMAL(12, 2),
        eligibility TEXT,
        application_deadline DATE,
        is_active BOOLEAN DEFAULT true,
        website_url VARCHAR(500),
        contact_phone VARCHAR(20),
        contact_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id)
      )
    `);
    
    // Create indexes for subsidies
    await query(`
      CREATE INDEX IF NOT EXISTS idx_subsidies_active ON subsidies(is_active);
      CREATE INDEX IF NOT EXISTS idx_subsidies_category ON subsidies(category);
      CREATE INDEX IF NOT EXISTS idx_subsidies_state ON subsidies(state);
    `);
    
    // Create notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        priority VARCHAR(50) DEFAULT 'medium',
        icon VARCHAR(10),
        target_audience VARCHAR(50) DEFAULT 'all',
        target_locations TEXT[],
        target_crops TEXT[],
        expiry_date DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id)
      )
    `);
    
    // Create indexes for notifications
    await query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_active ON notifications(is_active);
      CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
    `);
    
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Schema initialization failed:', error.message);
    throw error;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Closing PostgreSQL pool...');
  await pool.end();
  console.log('✅ PostgreSQL pool closed');
});

module.exports = {
  query,
  pool,
  getClient,
  testConnection,
  isConfigured,
  initializeSchema,
};
