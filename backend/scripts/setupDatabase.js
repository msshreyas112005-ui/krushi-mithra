const { pool, initializeTables } = require('../db');

async function setupDatabase() {
    try {
        console.log('🚀 Starting database setup...\n');
        
        // Test connection
        const client = await pool.connect();
        console.log('✅ Database connection successful!\n');
        client.release();
        
        // Initialize tables
        await initializeTables();
        
        console.log('\n🎉 Database setup completed successfully!');
        console.log('You can now start the server and use the API endpoints.\n');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Database setup failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

setupDatabase();
