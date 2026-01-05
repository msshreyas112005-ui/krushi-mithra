const { pool } = require('../db');
const fs = require('fs');
const path = require('path');

/**
 * Migration Script: Transfer data from JSON files to PostgreSQL
 */

async function migrateData() {
    console.log('🚀 Starting data migration from JSON to PostgreSQL...\n');

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // ==================== MIGRATE FARMERS ====================
        console.log('👨‍🌾 Migrating farmers...');
        const farmersPath = path.join(__dirname, '../data/farmers.json');
        
        if (fs.existsSync(farmersPath)) {
            const farmersData = JSON.parse(fs.readFileSync(farmersPath, 'utf-8'));
            const farmers = farmersData.farmers || [];

            for (const farmer of farmers) {
                // Check if farmer already exists
                const existing = await client.query(
                    'SELECT id FROM farmers WHERE email = $1',
                    [farmer.email]
                );

                if (existing.rows.length === 0) {
                    await client.query(
                        `INSERT INTO farmers (name, email, phone, location, password, is_approved, created_at, last_login)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [
                            farmer.fullName || farmer.name,
                            farmer.email,
                            farmer.mobile || farmer.phone,
                            farmer.location,
                            farmer.password,
                            farmer.status === 'approved',
                            farmer.createdAt || new Date(),
                            farmer.lastLogin || null
                        ]
                    );
                    console.log(`  ✅ Migrated farmer: ${farmer.email}`);
                } else {
                    console.log(`  ⏭️  Skipped (exists): ${farmer.email}`);
                }
            }
            console.log(`✅ Farmers migration complete! (${farmers.length} records processed)\n`);
        } else {
            console.log('⚠️  farmers.json not found, skipping...\n');
        }

        // ==================== MIGRATE MARKET PRICES ====================
        console.log('💰 Migrating market prices...');
        const pricesPath = path.join(__dirname, '../data/prices.data.js');
        
        if (fs.existsSync(pricesPath)) {
            // Since it's a .js file, we'll need to require it
            const pricesModule = require('../data/prices.data.js');
            const prices = pricesModule.marketPrices || pricesModule.prices || [];

            for (const price of prices) {
                // Check if price already exists
                const existing = await client.query(
                    'SELECT id FROM market_prices WHERE crop_name = $1 AND market_name = $2',
                    [price.cropName || price.crop_name, price.marketName || price.market_name || 'General Market']
                );

                if (existing.rows.length === 0) {
                    await client.query(
                        `INSERT INTO market_prices (crop_name, price, market_name, unit, updated_at)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [
                            price.cropName || price.crop_name,
                            price.price || 0,
                            price.marketName || price.market_name || 'General Market',
                            price.unit || 'per quintal',
                            price.updatedAt || price.updated_at || new Date()
                        ]
                    );
                    console.log(`  ✅ Migrated price: ${price.cropName || price.crop_name}`);
                } else {
                    // Update existing price
                    await client.query(
                        `UPDATE market_prices 
                         SET price = $1, unit = $2, updated_at = $3
                         WHERE crop_name = $4 AND market_name = $5`,
                        [
                            price.price || 0,
                            price.unit || 'per quintal',
                            new Date(),
                            price.cropName || price.crop_name,
                            price.marketName || price.market_name || 'General Market'
                        ]
                    );
                    console.log(`  🔄 Updated price: ${price.cropName || price.crop_name}`);
                }
            }
            console.log(`✅ Market prices migration complete! (${prices.length} records processed)\n`);
        } else {
            console.log('⚠️  prices.data.js not found, skipping...\n');
        }

        // ==================== MIGRATE SUBSIDIES ====================
        console.log('📋 Migrating subsidies...');
        
        // Try to load from localStorage demo subsidies (common pattern)
        const defaultSubsidies = [
            {
                title: 'PM-KISAN Direct Benefit Transfer',
                description: 'Income support of ₹6,000 per year to all farmer families across the country',
                url: 'https://pmkisan.gov.in',
                category: 'insurance',
                state: 'All India',
                eligibility: 'All landholding farmer families'
            },
            {
                title: 'Karnataka Seed Subsidy Scheme',
                description: 'Get 50% subsidy on certified seeds for agricultural crops',
                url: 'https://raitamitra.karnataka.gov.in',
                category: 'seeds',
                state: 'Karnataka',
                eligibility: 'Registered farmers with valid land documents'
            },
            {
                title: 'Pradhan Mantri Fasal Bima Yojana',
                description: 'Comprehensive crop insurance scheme to protect farmers against crop loss',
                url: 'https://pmfby.gov.in',
                category: 'insurance',
                state: 'All India',
                eligibility: 'All farmers growing notified crops'
            },
            {
                title: 'Soil Health Card Scheme',
                description: 'Free soil testing and customized fertilizer recommendations',
                url: 'https://soilhealth.dac.gov.in',
                category: 'other',
                state: 'All India',
                eligibility: 'All farmers across India'
            }
        ];

        for (const subsidy of defaultSubsidies) {
            const existing = await client.query(
                'SELECT id FROM subsidies WHERE title = $1',
                [subsidy.title]
            );

            if (existing.rows.length === 0) {
                await client.query(
                    `INSERT INTO subsidies (title, description, government_url, category, state, eligibility, is_active, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6, true, NOW())`,
                    [
                        subsidy.title,
                        subsidy.description,
                        subsidy.url,
                        subsidy.category,
                        subsidy.state,
                        subsidy.eligibility
                    ]
                );
                console.log(`  ✅ Migrated subsidy: ${subsidy.title}`);
            } else {
                console.log(`  ⏭️  Skipped (exists): ${subsidy.title}`);
            }
        }
        console.log(`✅ Subsidies migration complete! (${defaultSubsidies.length} records processed)\n`);

        // ==================== MIGRATE NOTIFICATIONS ====================
        console.log('📢 Migrating notifications...');
        const notificationsPath = path.join(__dirname, '../data/notifications.json');
        
        if (fs.existsSync(notificationsPath)) {
            const notificationsData = JSON.parse(fs.readFileSync(notificationsPath, 'utf-8'));
            const notifications = Array.isArray(notificationsData) ? notificationsData : [];

            for (const notification of notifications) {
                await client.query(
                    `INSERT INTO notifications (title, message, type, target_audience, target_location, target_crop, icon, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        notification.title,
                        notification.message || notification.description,
                        notification.type || 'info',
                        notification.targetAudience || notification.target_audience || 'all',
                        notification.targetLocation || notification.target_location || null,
                        notification.targetCrop || notification.target_crop || null,
                        notification.icon || '📢',
                        notification.createdAt || notification.created_at || new Date()
                    ]
                );
                console.log(`  ✅ Migrated notification: ${notification.title}`);
            }
            console.log(`✅ Notifications migration complete! (${notifications.length} records processed)\n`);
        } else {
            console.log('⚠️  notifications.json not found, skipping...\n');
        }

        // Commit transaction
        await client.query('COMMIT');

        // ==================== SUMMARY ====================
        console.log('═'.repeat(60));
        console.log('📊 MIGRATION SUMMARY');
        console.log('═'.repeat(60));

        const farmerCount = await client.query('SELECT COUNT(*) as count FROM farmers');
        const priceCount = await client.query('SELECT COUNT(*) as count FROM market_prices');
        const subsidyCount = await client.query('SELECT COUNT(*) as count FROM subsidies');
        const notificationCount = await client.query('SELECT COUNT(*) as count FROM notifications');

        console.log(`👨‍🌾 Total Farmers:       ${farmerCount.rows[0].count}`);
        console.log(`💰 Total Market Prices: ${priceCount.rows[0].count}`);
        console.log(`📋 Total Subsidies:     ${subsidyCount.rows[0].count}`);
        console.log(`📢 Total Notifications: ${notificationCount.rows[0].count}`);
        console.log('═'.repeat(60));

        console.log('\n🎉 Data migration completed successfully!\n');
        console.log('✅ All data has been transferred to Neon PostgreSQL database');
        console.log('✅ You can now use the admin dashboard to view the data\n');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ Migration failed:', error.message);
        console.error('Stack trace:', error.stack);
        throw error;
    } finally {
        client.release();
        process.exit(0);
    }
}

// Run migration
migrateData().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
