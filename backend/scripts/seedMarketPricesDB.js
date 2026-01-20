const { pool } = require('../db');

/**
 * Seed Market Prices - Add sample Karnataka market prices
 */

const defaultMarketPrices = [
    // Cereals
    { cropName: 'Rice (Paddy)', price: 2100, marketName: 'Bangalore APMC', unit: 'per quintal' },
    { cropName: 'Wheat', price: 2250, marketName: 'Bangalore APMC', unit: 'per quintal' },
    { cropName: 'Maize', price: 1850, marketName: 'Mandya Market', unit: 'per quintal' },
    { cropName: 'Ragi (Finger Millet)', price: 3200, marketName: 'Mysore Market', unit: 'per quintal' },
    { cropName: 'Jowar (Sorghum)', price: 2800, marketName: 'Hubli Market', unit: 'per quintal' },
    
    // Pulses
    { cropName: 'Tur Dal (Pigeon Pea)', price: 6500, marketName: 'Bangalore APMC', unit: 'per quintal' },
    { cropName: 'Moong Dal', price: 7200, marketName: 'Bangalore APMC', unit: 'per quintal' },
    { cropName: 'Urad Dal', price: 6800, marketName: 'Mysore Market', unit: 'per quintal' },
    { cropName: 'Chana Dal', price: 5200, marketName: 'Tumkur Market', unit: 'per quintal' },
    
    // Vegetables
    { cropName: 'Tomato', price: 25, marketName: 'KR Market Bangalore', unit: 'per kg' },
    { cropName: 'Onion', price: 35, marketName: 'KR Market Bangalore', unit: 'per kg' },
    { cropName: 'Potato', price: 28, marketName: 'KR Market Bangalore', unit: 'per kg' },
    { cropName: 'Cabbage', price: 18, marketName: 'Mysore Market', unit: 'per kg' },
    { cropName: 'Cauliflower', price: 32, marketName: 'Mysore Market', unit: 'per kg' },
    { cropName: 'Brinjal', price: 22, marketName: 'Hassan Market', unit: 'per kg' },
    { cropName: 'Carrot', price: 40, marketName: 'Bangalore APMC', unit: 'per kg' },
    { cropName: 'Beans', price: 45, marketName: 'Bangalore APMC', unit: 'per kg' },
    
    // Fruits
    { cropName: 'Banana', price: 35, marketName: 'Tumkur Market', unit: 'per dozen' },
    { cropName: 'Mango', price: 60, marketName: 'Bangalore APMC', unit: 'per kg' },
    { cropName: 'Papaya', price: 25, marketName: 'Mysore Market', unit: 'per kg' },
    { cropName: 'Grapes', price: 80, marketName: 'Bangalore APMC', unit: 'per kg' },
    { cropName: 'Pomegranate', price: 120, marketName: 'Bangalore APMC', unit: 'per kg' },
    
    // Commercial Crops
    { cropName: 'Cotton', price: 6800, marketName: 'Raichur Market', unit: 'per quintal' },
    { cropName: 'Sugarcane', price: 3100, marketName: 'Mandya Market', unit: 'per ton' },
    { cropName: 'Groundnut', price: 5500, marketName: 'Tumkur Market', unit: 'per quintal' },
    { cropName: 'Sunflower', price: 6200, marketName: 'Chitradurga Market', unit: 'per quintal' },
    
    // Spices
    { cropName: 'Turmeric', price: 7500, marketName: 'Hassan Market', unit: 'per quintal' },
    { cropName: 'Chilli (Red)', price: 12000, marketName: 'Hubli Market', unit: 'per quintal' },
    { cropName: 'Coriander', price: 8500, marketName: 'Bangalore APMC', unit: 'per quintal' },
    { cropName: 'Ginger', price: 8000, marketName: 'Chikmagalur Market', unit: 'per quintal' }
];

async function seedMarketPrices() {
    console.log('🚀 Starting market prices seeding...\n');

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        let addedCount = 0;
        let updatedCount = 0;

        for (const price of defaultMarketPrices) {
            // Check if price already exists
            const existing = await client.query(
                'SELECT id FROM market_prices WHERE crop_name = $1 AND market_name = $2',
                [price.cropName, price.marketName]
            );

            if (existing.rows.length === 0) {
                await client.query(
                    `INSERT INTO market_prices (crop_name, price, market_name, unit, updated_at)
                     VALUES ($1, $2, $3, $4, NOW())`,
                    [price.cropName, price.price, price.marketName, price.unit]
                );
                console.log(`  ✅ Added: ${price.cropName} - ₹${price.price}/${price.unit}`);
                addedCount++;
            } else {
                await client.query(
                    `UPDATE market_prices 
                     SET price = $1, unit = $2, updated_at = NOW()
                     WHERE crop_name = $3 AND market_name = $4`,
                    [price.price, price.unit, price.cropName, price.marketName]
                );
                console.log(`  🔄 Updated: ${price.cropName} - ₹${price.price}/${price.unit}`);
                updatedCount++;
            }
        }

        await client.query('COMMIT');

        console.log('\n═'.repeat(60));
        console.log('📊 MARKET PRICES SEEDING SUMMARY');
        console.log('═'.repeat(60));
        console.log(`✅ Added:   ${addedCount} new prices`);
        console.log(`🔄 Updated: ${updatedCount} existing prices`);
        console.log(`📈 Total:   ${addedCount + updatedCount} prices processed`);
        console.log('═'.repeat(60));

        // Get final count
        const totalCount = await client.query('SELECT COUNT(*) as count FROM market_prices');
        console.log(`\n💰 Total market prices in database: ${totalCount.rows[0].count}\n`);

        console.log('🎉 Market prices seeding completed successfully!\n');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ Seeding failed:', error.message);
        console.error('Stack trace:', error.stack);
        throw error;
    } finally {
        client.release();
        process.exit(0);
    }
}

// Run seeding
seedMarketPrices().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
