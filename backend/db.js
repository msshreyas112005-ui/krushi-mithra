const { Pool } = require('pg');

// In Vercel, dotenv is not needed as env vars are already loaded
// Only load dotenv in development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Log database configuration (without exposing full connection string)
const dbUrl = process.env.DATABASE_URL;
console.log('🔍 [DB.JS] Checking DATABASE_URL...');
console.log('   Environment:', process.env.NODE_ENV || 'not set');
console.log('   DATABASE_URL exists:', !!dbUrl);

if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.error('   Please check your Vercel environment variables.');
    throw new Error('DATABASE_URL is required but not set');
} else {
    const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^/]+)\//);
    if (urlParts) {
        console.log(`📊 Database host: ${urlParts[3].split(':')[0]}`);
    }
}

// Create PostgreSQL connection pool with explicit configuration
const poolConfig = {
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: false // Required for Neon and most cloud PostgreSQL providers
    },
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
};

console.log('🔧 [DB.JS] Creating connection pool...');
const pool = new Pool(poolConfig);

// Test connection on initialization
pool.on('connect', () => {
    console.log('✅ PostgreSQL database connected successfully (Neon)');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
});

// Helper function to execute queries with error handling
async function query(text, params) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log(`✅ Query executed in ${duration}ms`);
        return result;
    } catch (error) {
        console.error('❌ Database query error:', error.message);
        throw error;
    }
}

// Initialize database tables
async function initializeTables() {
    const client = await pool.connect();
    try {
        console.log('🔧 Initializing database tables...');
        
        // Create farmers table
        await client.query(`
            CREATE TABLE IF NOT EXISTS farmers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(20) NOT NULL,
                location VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                crop_type VARCHAR(255),
                crop_date DATE,
                crop_location VARCHAR(255),
                language VARCHAR(10) DEFAULT 'en',
                is_approved BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                last_login TIMESTAMP
            )
        `);
        console.log('✅ Farmers table ready');
        
        // Create market_prices table
        await client.query(`
            CREATE TABLE IF NOT EXISTS market_prices (
                id SERIAL PRIMARY KEY,
                crop_name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                market_name VARCHAR(255) NOT NULL,
                unit VARCHAR(50) DEFAULT 'per quintal',
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Market prices table ready');
        
        // Create subsidies table
        await client.query(`
            CREATE TABLE IF NOT EXISTS subsidies (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                government_url TEXT NOT NULL,
                category VARCHAR(100) DEFAULT 'other',
                state VARCHAR(100) DEFAULT 'All India',
                eligibility TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Subsidies table ready');
        
        // Create notifications table
        await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                priority VARCHAR(20) DEFAULT 'normal',
                icon VARCHAR(100),
                target_audience VARCHAR(100) DEFAULT 'all',
                target_location VARCHAR(255),
                target_crop VARCHAR(255),
                expiry_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                is_read BOOLEAN DEFAULT FALSE
            )
        `);
        console.log('✅ Notifications table ready');
        
        console.log('🎉 All database tables initialized successfully!');
    } catch (error) {
        console.error('❌ Error initializing tables:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

// Export pool and helper functions
module.exports = {
    pool,
    query,
    initializeTables
};
