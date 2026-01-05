const { pool } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Farmer Registration (PostgreSQL)
 */
const registerFarmer = async (req, res) => {
    try {
        const { name, email, phone, location, password } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !location || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if farmer already exists
        const existingFarmer = await pool.query(
            'SELECT * FROM farmers WHERE email = $1',
            [email]
        );

        if (existingFarmer.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Farmer with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new farmer
        const result = await pool.query(
            `INSERT INTO farmers (name, email, phone, location, password, is_approved, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             RETURNING id, name, email, phone, location, is_approved, created_at`,
            [name, email, phone, location, hashedPassword, true]
        );

        const farmer = result.rows[0];

        console.log('✅ Farmer registered:', farmer.email);

        res.status(201).json({
            success: true,
            message: 'Farmer registered successfully',
            farmer: {
                id: farmer.id,
                name: farmer.name,
                email: farmer.email,
                phone: farmer.phone,
                location: farmer.location,
                isApproved: farmer.is_approved
            }
        });
    } catch (error) {
        console.error('❌ Farmer registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering farmer',
            error: error.message
        });
    }
};

/**
 * Farmer Login (PostgreSQL)
 */
const loginFarmer = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('[FARMER LOGIN] 🔐 Login attempt for:', email);

        // Find farmer by email
        const result = await pool.query(
            'SELECT * FROM farmers WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            console.log('[FARMER LOGIN] ❌ Farmer not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const farmer = result.rows[0];

        // Check if farmer is approved
        if (!farmer.is_approved) {
            return res.status(403).json({
                success: false,
                message: 'Your account is pending approval'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, farmer.password);

        if (!isPasswordValid) {
            console.log('[FARMER LOGIN] ❌ Invalid password for:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        await pool.query(
            'UPDATE farmers SET last_login = NOW() WHERE id = $1',
            [farmer.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: farmer.id, email: farmer.email, role: 'farmer' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        console.log('[FARMER LOGIN] ✅ Login successful:', email);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            farmer: {
                id: farmer.id,
                name: farmer.name,
                email: farmer.email,
                phone: farmer.phone,
                location: farmer.location
            }
        });
    } catch (error) {
        console.error('[FARMER LOGIN] ❌ Error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

/**
 * Get All Farmers (Admin) (PostgreSQL)
 */
const getAllFarmers = async (req, res) => {
    try {
        const { status } = req.query;

        console.log('[ADMIN FARMERS] Fetching farmers, status:', status);

        let query = 'SELECT id, name, email, phone, location, is_approved, created_at, last_login FROM farmers';
        let params = [];

        if (status === 'approved') {
            query += ' WHERE is_approved = $1';
            params.push(true);
        } else if (status === 'pending') {
            query += ' WHERE is_approved = $1';
            params.push(false);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);

        console.log(`[ADMIN FARMERS] Found ${result.rows.length} farmers`);

        res.json({
            success: true,
            count: result.rows.length,
            farmers: result.rows
        });
    } catch (error) {
        console.error('[ADMIN FARMERS] ❌ Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching farmers',
            error: error.message
        });
    }
};

/**
 * Get Farmer Profile (PostgreSQL)
 */
const getFarmerProfile = async (req, res) => {
    try {
        const farmerId = req.user.id;

        const result = await pool.query(
            'SELECT id, name, email, phone, location, is_approved, created_at, last_login FROM farmers WHERE id = $1',
            [farmerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }

        res.json({
            success: true,
            farmer: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Get farmer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
};

/**
 * Update Farmer Profile (PostgreSQL)
 */
const updateFarmerProfile = async (req, res) => {
    try {
        const farmerId = req.user.id;
        const { name, phone, location } = req.body;

        const result = await pool.query(
            `UPDATE farmers 
             SET name = $1, phone = $2, location = $3
             WHERE id = $4
             RETURNING id, name, email, phone, location, is_approved`,
            [name, phone, location, farmerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            farmer: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Update farmer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

/**
 * Get Dashboard Stats (Admin)
 */
const getDashboardStats = async (req, res) => {
    try {
        // Get total farmers count
        const farmersResult = await pool.query(
            'SELECT COUNT(*) as total FROM farmers WHERE is_approved = true'
        );

        // Get market prices count
        const pricesResult = await pool.query(
            'SELECT COUNT(*) as total FROM market_prices'
        );

        // Get subsidies count
        const subsidiesResult = await pool.query(
            'SELECT COUNT(*) as total FROM subsidies WHERE is_active = true'
        );

        res.json({
            success: true,
            stats: {
                totalFarmers: parseInt(farmersResult.rows[0].total),
                totalMarketPrices: parseInt(pricesResult.rows[0].total),
                totalSubsidies: parseInt(subsidiesResult.rows[0].total),
                updateCount: parseInt(pricesResult.rows[0].total)
            }
        });
    } catch (error) {
        console.error('❌ Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats'
        });
    }
};

module.exports = {
    registerFarmer,
    loginFarmer,
    getAllFarmers,
    getFarmerProfile,
    updateFarmerProfile,
    getDashboardStats
};
