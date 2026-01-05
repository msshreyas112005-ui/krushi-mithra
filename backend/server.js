const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import Security Middleware
const {
  securityHeaders,
  generalLimiter,
  sanitizeMongoQueries,
  corsOptions,
  requestLogger,
  preventParameterPollution,
  bodySizeLimiter,
  trustProxy,
  preventSqlInjection
} = require('./middleware/security.middleware');

const {
  errorHandler,
  notFoundHandler,
  handleUnhandledRejection,
  handleUncaughtException
} = require('./middleware/error.middleware');

const app = express();

// Handle uncaught exceptions and unhandled rejections
handleUncaughtException();
handleUnhandledRejection();

// Trust proxy (for rate limiting behind reverse proxy)
trustProxy(app);

// Security Headers
app.use(securityHeaders);

// CORS with specific configuration
app.use(cors(corsOptions));

// Request Logger (for monitoring)
if (process.env.NODE_ENV !== 'production') {
  app.use(requestLogger);
}

// Body Parser with size limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Query Sanitization
app.use(sanitizeMongoQueries);

// Prevent Parameter Pollution
app.use(preventParameterPollution);

// SQL Injection Prevention
app.use(preventSqlInjection);

// Body Size Limiter
app.use(bodySizeLimiter('10mb'));

// General Rate Limiting
app.use('/api/', generalLimiter);

// Static Files - Serve frontend folder
const path = require('path');
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend'))); // Also serve from root for backward compatibility

// Database Connection (PostgreSQL with Neon) - REQUIRED
const { pool, initializeTables } = require('./db');

// Initialize PostgreSQL connection and tables - EXIT IF FAILS
(async () => {
  try {
    // Test connection
    const client = await pool.connect();
    client.release();
    console.log('✅ PostgreSQL database connected successfully (Neon)');
    
    // Initialize tables
    await initializeTables();
    console.log('✅ All database tables initialized successfully!\n');
    
    console.log('💡 Running with PostgreSQL Database (Neon Cloud)');
    console.log('   All data is persisted in the database');
    console.log('   Real-time data storage and retrieval active\n');
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR: PostgreSQL connection failed!');
    console.error('   Error:', error.message);
    console.error('   Database connection is REQUIRED for this application.');
    console.error('   Please check your DATABASE_URL in .env file.\n');
    console.error('   Exiting server...\n');
    process.exit(1); // Exit with error code
  }
})();

// Routes
app.get('/', (req, res) => {
  res.redirect('/frontend/html/index.html');
});

// Import routes
const farmerRoutes = require('./routes/farmer.routes');
const farmerApiRoutes = require('./routes/farmer.api.routes');
const adminRoutes = require('./routes/admin.routes');
const postgresRoutes = require('./routes/postgres.routes'); // PostgreSQL routes

app.use('/api/farmers', farmerRoutes);
app.use('/api/farmer', farmerApiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', postgresRoutes); // Add PostgreSQL routes

// 404 Handler - Must be after all routes
app.use(notFoundHandler);

// Global Error Handler - Must be last
app.use(errorHandler);

// Initialize scheduled jobs
const { initializeScheduledJobs, triggerManualUpdate } = require('./config/scheduler');

// Start server immediately
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🌾 KRUSHI MITHRA Server Started`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`🌐 Frontend:   http://localhost:${PORT}/frontend/html/index.html`);
  console.log(`👨‍🌾 Farmer:     http://localhost:${PORT}/frontend/html/register.html`);
  console.log(`👨‍💼 Admin:      http://localhost:${PORT}/frontend/html/admin-login.html`);
  console.log(`${'='.repeat(60)}\n`);
});

// Initialize scheduled jobs
try {
  const { initializeScheduledJobs } = require('./config/scheduler');
  initializeScheduledJobs();
} catch (error) {
  console.warn('⚠️  Scheduler initialization skipped:', error.message);
}

module.exports = server;
