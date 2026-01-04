# 🚀 Neon PostgreSQL Database Setup Guide

## Overview
This guide will help you set up Neon PostgreSQL database for KRUSHI MITHRA application, replacing the current MongoDB/JSON storage with a scalable, serverless PostgreSQL database.

---

## Step 1: Create Neon Account

1. **Visit Neon Console**
   - Go to: https://neon.tech
   - Click "Sign Up" (Free tier available)
   - Sign up with GitHub, Google, or Email

2. **Verify Email**
   - Check your email for verification link
   - Click to verify your account

---

## Step 2: Create New Project

1. **Create Project**
   - Click "New Project"
   - Project Name: `krushi-mitra`
   - Region: Choose closest to Karnataka, India (Singapore or Mumbai if available)
   - PostgreSQL Version: 15 (recommended)
   - Click "Create Project"

2. **Get Connection String**
   - After project creation, you'll see connection details
   - Copy the connection string (it looks like):
     ```
     postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database_name?sslmode=require
     ```

---

## Step 3: Configure Environment Variables

1. **Create `.env` file** (if not exists)
   ```bash
   # In backend folder
   cd backend
   cp .env.example .env
   ```

2. **Update `.env` with Neon credentials**
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://your-neon-connection-string-here
   
   # Use DATABASE_URL instead of MONGODB_URI
   # MONGODB_URI=mongodb://localhost:27017/krushi-mithra  # DEPRECATED
   
   # JWT and other configs remain same
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   PORT=3000
   NODE_ENV=development
   
   # APIs
   OPENWEATHER_API_KEY=your_api_key
   WEATHER_API_KEY=your_api_key
   ```

---

## Step 4: Install PostgreSQL Dependencies

```bash
cd backend
npm install pg
npm install --save-dev @types/pg
```

**Packages installed:**
- `pg`: PostgreSQL client for Node.js
- `@types/pg`: TypeScript definitions (if needed)

---

## Step 5: Database Schema

### Tables to Create:

#### 1. **Users Table** (Admins)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **Farmers Table**
```sql
CREATE TABLE farmers (
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
);

CREATE INDEX idx_farmers_status ON farmers(status);
CREATE INDEX idx_farmers_email ON farmers(email);
CREATE INDEX idx_farmers_mobile ON farmers(mobile);
```

#### 3. **Market Prices Table**
```sql
CREATE TABLE market_prices (
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
);

CREATE INDEX idx_market_prices_date ON market_prices(price_date DESC);
CREATE INDEX idx_market_prices_commodity ON market_prices(commodity_name);
CREATE INDEX idx_market_prices_district ON market_prices(district);
```

#### 4. **Subsidies Table**
```sql
CREATE TABLE subsidies (
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
);

CREATE INDEX idx_subsidies_active ON subsidies(is_active);
CREATE INDEX idx_subsidies_category ON subsidies(category);
CREATE INDEX idx_subsidies_state ON subsidies(state);
```

#### 5. **Notifications Table**
```sql
CREATE TABLE notifications (
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
);

CREATE INDEX idx_notifications_active ON notifications(is_active);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

#### 6. **Weather Cache Table** (Optional - for caching)
```sql
CREATE TABLE weather_cache (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    weather_data JSONB NOT NULL,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_weather_location ON weather_cache(location);
CREATE INDEX idx_weather_expires ON weather_cache(expires_at);
```

---

## Step 6: Run Database Migration

You can run these SQL commands in Neon Console:

1. Go to your Neon project dashboard
2. Click "SQL Editor"
3. Copy and paste the CREATE TABLE statements
4. Click "Run" for each statement

OR use a migration file:

Create `backend/migrations/001_initial_schema.sql` and run it via Node.js script.

---

## Step 7: Create Database Connection File

**File:** `backend/config/database.postgres.js`

```javascript
const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  },
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on PostgreSQL client', err);
  process.exit(-1);
});

// Helper function to execute queries
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

// Helper function to get a client from pool
async function getClient() {
  const client = await pool.connect();
  return client;
}

module.exports = {
  query,
  pool,
  getClient,
};
```

---

## Step 8: Update Server.js

Replace MongoDB connection with PostgreSQL:

```javascript
// backend/server.js
const db = require('./config/database.postgres');

// Test database connection
db.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
  });
```

---

## Step 9: Seed Initial Data

Create `backend/scripts/seedPostgres.js`:

```javascript
const db = require('../config/database.postgres');
const bcrypt = require('bcrypt');

async function seedDatabase() {
  try {
    // Create default admin
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    await db.query(`
      INSERT INTO users (email, password, full_name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@krushimithra.com', hashedPassword, 'Main Administrator', 'admin']);
    
    console.log('✅ Admin user created');
    
    // Add sample market prices
    await db.query(`
      INSERT INTO market_prices 
      (commodity_name, commodity_type, market_name, district, modal_price, price_date)
      VALUES 
      ($1, $2, $3, $4, $5, CURRENT_DATE),
      ($6, $7, $8, $9, $10, CURRENT_DATE)
      ON CONFLICT DO NOTHING
    `, [
      'Tomato', 'Vegetable', 'Bangalore APMC', 'Bangalore', 30,
      'Rice', 'Grain', 'Mysore Market', 'Mysore', 2500
    ]);
    
    console.log('✅ Sample data seeded');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedDatabase();
```

Run: `node backend/scripts/seedPostgres.js`

---

## Step 10: Benefits of Neon PostgreSQL

### ✅ **Advantages:**
1. **Serverless** - Auto-scaling, pay only for usage
2. **Free Tier** - 0.5 GB storage, 300 hours compute/month
3. **Branching** - Create database branches like Git
4. **Fast** - Built on AWS/GCP with low latency
5. **Automatic Backups** - Point-in-time recovery
6. **No Maintenance** - Fully managed
7. **SQL Power** - Complex queries, joins, transactions
8. **Real-time Analytics** - Better than MongoDB for reporting

### 📊 **Comparison:**

| Feature | MongoDB | Neon PostgreSQL |
|---------|---------|-----------------|
| Type | NoSQL | SQL (Relational) |
| Scaling | Manual | Automatic |
| Cost | Self-hosted or Atlas | Serverless (cheaper) |
| Queries | Limited joins | Full SQL support |
| Transactions | Limited | ACID compliant |
| Analytics | Slow | Fast with indexes |

---

## Step 11: Migration Checklist

- [ ] Create Neon account
- [ ] Create project and get connection string
- [ ] Update `.env` with DATABASE_URL
- [ ] Install `pg` package
- [ ] Create database schema (all tables)
- [ ] Create `database.postgres.js` connection file
- [ ] Update `server.js` to use PostgreSQL
- [ ] Seed initial admin user
- [ ] Update all controllers to use PostgreSQL queries
- [ ] Test all API endpoints
- [ ] Remove MongoDB dependencies

---

## Troubleshooting

### Connection Timeout
```env
# Add connection timeout
DATABASE_URL=postgresql://...?connect_timeout=10
```

### SSL Errors
```javascript
ssl: {
  rejectUnauthorized: false
}
```

### Query Debugging
```javascript
// Enable query logging
pool.on('acquire', () => console.log('Client acquired'));
```

---

## Next Steps

After setup:
1. Update all controllers to use PostgreSQL queries
2. Test farmer registration
3. Test admin dashboard stats
4. Implement market price real-time updates
5. Deploy to production

---

## Support

- **Neon Docs:** https://neon.tech/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Node-postgres:** https://node-postgres.com/

---

**Setup Complete!** 🎉

Your KRUSHI MITHRA app is now powered by Neon PostgreSQL - a modern, scalable, serverless database solution.
