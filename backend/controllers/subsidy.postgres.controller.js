const { pool } = require('../db');

/**
 * Get All Subsidies (PostgreSQL)
 */
const getAllSubsidies = async (req, res) => {
    try {
        const { category, state } = req.query;

        let query = 'SELECT * FROM subsidies WHERE is_active = true';
        const params = [];
        let paramIndex = 1;

        if (category) {
            query += ` AND category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (state) {
            query += ` AND state = $${paramIndex}`;
            params.push(state);
            paramIndex++;
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);

        console.log(`✅ Found ${result.rows.length} subsidies`);

        res.json({
            success: true,
            count: result.rows.length,
            subsidies: result.rows.map(row => ({
                _id: row.id,
                id: row.id,
                title: row.title,
                description: row.description,
                url: row.government_url,
                category: row.category,
                state: row.state,
                eligibility: row.eligibility,
                isActive: row.is_active,
                createdAt: row.created_at
            }))
        });
    } catch (error) {
        console.error('❌ Get subsidies error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subsidies',
            error: error.message
        });
    }
};

/**
 * Create New Subsidy (Admin) (PostgreSQL)
 */
const createSubsidy = async (req, res) => {
    try {
        const { title, description, url, category, state, eligibility } = req.body;

        // Validate required fields
        if (!title || !description || !url) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, and URL are required'
            });
        }

        const result = await pool.query(
            `INSERT INTO subsidies (title, description, government_url, category, state, eligibility, is_active, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
             RETURNING *`,
            [
                title,
                description,
                url,
                category || 'other',
                state || 'All India',
                eligibility || ''
            ]
        );

        const subsidy = result.rows[0];

        console.log('✅ Subsidy created:', subsidy.title);

        res.status(201).json({
            success: true,
            message: 'Subsidy created successfully',
            subsidy: {
                _id: subsidy.id,
                id: subsidy.id,
                title: subsidy.title,
                description: subsidy.description,
                url: subsidy.government_url,
                category: subsidy.category,
                state: subsidy.state,
                eligibility: subsidy.eligibility,
                isActive: subsidy.is_active
            }
        });
    } catch (error) {
        console.error('❌ Create subsidy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating subsidy',
            error: error.message
        });
    }
};

/**
 * Get Single Subsidy (PostgreSQL)
 */
const getSubsidy = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM subsidies WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subsidy not found'
            });
        }

        const subsidy = result.rows[0];

        res.json({
            success: true,
            subsidy: {
                _id: subsidy.id,
                id: subsidy.id,
                title: subsidy.title,
                description: subsidy.description,
                url: subsidy.government_url,
                category: subsidy.category,
                state: subsidy.state,
                eligibility: subsidy.eligibility,
                isActive: subsidy.is_active
            }
        });
    } catch (error) {
        console.error('❌ Get subsidy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subsidy',
            error: error.message
        });
    }
};

/**
 * Update Subsidy (Admin) (PostgreSQL)
 */
const updateSubsidy = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, url, category, state, eligibility } = req.body;

        const result = await pool.query(
            `UPDATE subsidies 
             SET title = $1, description = $2, government_url = $3, 
                 category = $4, state = $5, eligibility = $6
             WHERE id = $7
             RETURNING *`,
            [title, description, url, category, state, eligibility, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subsidy not found'
            });
        }

        const subsidy = result.rows[0];

        console.log('✅ Subsidy updated:', subsidy.title);

        res.json({
            success: true,
            message: 'Subsidy updated successfully',
            subsidy: {
                _id: subsidy.id,
                id: subsidy.id,
                title: subsidy.title,
                description: subsidy.description,
                url: subsidy.government_url,
                category: subsidy.category,
                state: subsidy.state,
                eligibility: subsidy.eligibility,
                isActive: subsidy.is_active
            }
        });
    } catch (error) {
        console.error('❌ Update subsidy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating subsidy',
            error: error.message
        });
    }
};

/**
 * Delete Subsidy (Admin) (PostgreSQL)
 */
const deleteSubsidy = async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete - set is_active to false
        const result = await pool.query(
            'UPDATE subsidies SET is_active = false WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subsidy not found'
            });
        }

        console.log('✅ Subsidy deleted:', result.rows[0].title);

        res.json({
            success: true,
            message: 'Subsidy deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete subsidy error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting subsidy',
            error: error.message
        });
    }
};

module.exports = {
    getAllSubsidies,
    createSubsidy,
    getSubsidy,
    updateSubsidy,
    deleteSubsidy
};
