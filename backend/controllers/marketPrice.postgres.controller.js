const { pool } = require('../db');

/**
 * Get All Market Prices (PostgreSQL)
 */
const getAllMarketPrices = async (req, res) => {
    try {
        const { crop, market } = req.query;

        let query = 'SELECT * FROM market_prices';
        const params = [];
        let paramIndex = 1;
        const conditions = [];

        if (crop) {
            conditions.push(`crop_name ILIKE $${paramIndex}`);
            params.push(`%${crop}%`);
            paramIndex++;
        }

        if (market) {
            conditions.push(`market_name ILIKE $${paramIndex}`);
            params.push(`%${market}%`);
            paramIndex++;
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY updated_at DESC LIMIT 50';

        const result = await pool.query(query, params);

        console.log(`✅ Found ${result.rows.length} market prices`);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows.map(row => ({
                id: row.id,
                commodity: row.crop_name,
                cropName: row.crop_name,
                price: parseFloat(row.price),
                modalPrice: parseFloat(row.price),
                minPrice: parseFloat(row.price) * 0.9, // Estimate 10% lower
                maxPrice: parseFloat(row.price) * 1.1, // Estimate 10% higher
                market: row.market_name,
                marketName: row.market_name,
                unit: row.unit || 'per quintal',
                arrivalDate: row.updated_at,
                updatedAt: row.updated_at
            }))
        });
    } catch (error) {
        console.error('❌ Get market prices error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching market prices',
            error: error.message
        });
    }
};

/**
 * Add/Update Market Price (Admin) (PostgreSQL)
 */
const addMarketPrice = async (req, res) => {
    try {
        const { cropName, price, marketName, unit } = req.body;

        // Validate required fields
        if (!cropName || !price || !marketName) {
            return res.status(400).json({
                success: false,
                message: 'Crop name, price, and market name are required'
            });
        }

        // Check if price already exists for this crop and market
        const existingPrice = await pool.query(
            'SELECT id FROM market_prices WHERE crop_name = $1 AND market_name = $2',
            [cropName, marketName]
        );

        let result;
        if (existingPrice.rows.length > 0) {
            // Update existing price
            result = await pool.query(
                `UPDATE market_prices 
                 SET price = $1, unit = $2, updated_at = NOW()
                 WHERE crop_name = $3 AND market_name = $4
                 RETURNING *`,
                [price, unit || 'per quintal', cropName, marketName]
            );
        } else {
            // Insert new price
            result = await pool.query(
                `INSERT INTO market_prices (crop_name, price, market_name, unit, updated_at)
                 VALUES ($1, $2, $3, $4, NOW())
                 RETURNING *`,
                [cropName, price, marketName, unit || 'per quintal']
            );
        }

        const marketPrice = result.rows[0];

        console.log('✅ Market price saved:', marketPrice.crop_name);

        res.json({
            success: true,
            message: 'Market price saved successfully',
            price: {
                id: marketPrice.id,
                cropName: marketPrice.crop_name,
                price: parseFloat(marketPrice.price),
                marketName: marketPrice.market_name,
                unit: marketPrice.unit,
                updatedAt: marketPrice.updated_at
            }
        });
    } catch (error) {
        console.error('❌ Add market price error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving market price',
            error: error.message
        });
    }
};

/**
 * Bulk Add Market Prices (Admin) (PostgreSQL)
 */
const bulkAddMarketPrices = async (req, res) => {
    try {
        const { prices } = req.body;

        if (!prices || !Array.isArray(prices) || prices.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Prices array is required'
            });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let addedCount = 0;
            let updatedCount = 0;

            for (const priceData of prices) {
                const { cropName, price, marketName, unit } = priceData;

                // Check if exists
                const existing = await client.query(
                    'SELECT id FROM market_prices WHERE crop_name = $1 AND market_name = $2',
                    [cropName, marketName]
                );

                if (existing.rows.length > 0) {
                    // Update
                    await client.query(
                        'UPDATE market_prices SET price = $1, unit = $2, updated_at = NOW() WHERE crop_name = $3 AND market_name = $4',
                        [price, unit || 'per quintal', cropName, marketName]
                    );
                    updatedCount++;
                } else {
                    // Insert
                    await client.query(
                        'INSERT INTO market_prices (crop_name, price, market_name, unit, updated_at) VALUES ($1, $2, $3, $4, NOW())',
                        [cropName, price, marketName, unit || 'per quintal']
                    );
                    addedCount++;
                }
            }

            await client.query('COMMIT');

            console.log(`✅ Bulk market prices: ${addedCount} added, ${updatedCount} updated`);

            res.json({
                success: true,
                message: `Market prices updated: ${addedCount} added, ${updatedCount} updated`,
                addedCount,
                updatedCount
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('❌ Bulk add market prices error:', error);
        res.status(500).json({
            success: false,
            message: 'Error bulk adding market prices',
            error: error.message
        });
    }
};

/**
 * Delete Market Price (Admin) (PostgreSQL)
 */
const deleteMarketPrice = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM market_prices WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Market price not found'
            });
        }

        console.log('✅ Market price deleted');

        res.json({
            success: true,
            message: 'Market price deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete market price error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting market price',
            error: error.message
        });
    }
};

module.exports = {
    getAllMarketPrices,
    addMarketPrice,
    bulkAddMarketPrices,
    deleteMarketPrice
};
