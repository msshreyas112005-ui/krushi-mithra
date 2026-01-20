const { pool } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendRegistrationEmail } = require('../services/email.service');
const { sendRegistrationSMS } = require('../services/sms.service');
const { generateOTP, storeOTP, verifyOTP } = require('../services/otp.service');

/**
 * Farmer Registration (PostgreSQL)
 */
const registerFarmer = async (req, res) => {
    console.log('\n' + '='.repeat(70));
    console.log('[FARMER REGISTRATION] 📝 New registration attempt');
    console.log('[FARMER REGISTRATION] Request method:', req.method);
    console.log('[FARMER REGISTRATION] Request URL:', req.url);
    console.log('[FARMER REGISTRATION] Request path:', req.path);
    console.log('[FARMER REGISTRATION] Base URL:', req.baseUrl);
    console.log('[FARMER REGISTRATION] Full URL:', req.baseUrl + req.path);
    console.log('='.repeat(70));
    console.log('[FARMER REGISTRATION] Request body:', JSON.stringify({
        ...req.body,
        password: req.body.password ? '***HIDDEN***' : undefined
    }, null, 2));
    console.log('='.repeat(70));

    try {
        // Map frontend field names to backend field names
        const { fullName, name, email, mobile, phone, location, password, cropType, language } = req.body;
        
        // Use fullName if name is not provided, mobile if phone is not provided
        const farmerName = (name || fullName || '').trim();
        const farmerPhone = (phone || mobile || '').trim();
        const farmerEmail = email ? email.toLowerCase().trim() : '';
        const farmerLocation = (location || '').trim();

        console.log('[FARMER REGISTRATION] Mapped fields:', {
            name: farmerName,
            email: farmerEmail,
            phone: farmerPhone,
            location: farmerLocation,
            password: password ? '***PROVIDED***' : '***MISSING***',
            cropType,
            language
        });

        // Validate required fields - check for both undefined and empty strings
        const missingFields = [];
        if (!farmerName) missingFields.push('name');
        if (!farmerEmail) missingFields.push('email');
        if (!farmerPhone) missingFields.push('phone');
        if (!farmerLocation) missingFields.push('location');
        if (!password) missingFields.push('password');

        if (missingFields.length > 0) {
            console.log('[FARMER REGISTRATION] ❌ Validation failed - missing fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`,
                missingFields
            });
        }

        console.log('[FARMER REGISTRATION] ✓ Validation passed');
        console.log('[FARMER REGISTRATION] Checking for existing user...');

        // Check if farmer already exists (case-insensitive email check)
        const existingFarmer = await pool.query(
            'SELECT * FROM farmers WHERE LOWER(email) = LOWER($1)',
            [farmerEmail]
        );

        if (existingFarmer.rows.length > 0) {
            console.log('[FARMER REGISTRATION] ❌ Email already exists:', farmerEmail);
            return res.status(400).json({
                success: false,
                message: 'Farmer with this email already exists'
            });
        }

        console.log('[FARMER REGISTRATION] ✓ Email is unique');
        console.log('[FARMER REGISTRATION] Hashing password...');
        console.log('[FARMER REGISTRATION] Password length:', password?.length, 'characters');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('[FARMER REGISTRATION] ✓ Password hashed successfully');
        console.log('[FARMER REGISTRATION] Hash starts with:', hashedPassword.substring(0, 10) + '...');
        console.log('[FARMER REGISTRATION] Hash length:', hashedPassword.length, 'characters');

        console.log('[FARMER REGISTRATION] Inserting into database...');
        console.log('[FARMER REGISTRATION] SQL Query:', `INSERT INTO farmers (name, email, phone, location, password, is_approved, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())`);
        console.log('[FARMER REGISTRATION] Query params:', [farmerName, farmerEmail, farmerPhone, farmerLocation, '***HIDDEN***', true]);

        // Insert new farmer
        const result = await pool.query(
            `INSERT INTO farmers (name, email, phone, location, password, is_approved, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             RETURNING id, name, email, phone, location, is_approved, created_at`,
            [farmerName, farmerEmail, farmerPhone, farmerLocation, hashedPassword, true]
        );

        const farmer = result.rows[0];

        console.log('[FARMER REGISTRATION] ✅ SUCCESS! Farmer inserted into database');
        console.log('[FARMER REGISTRATION] Farmer ID:', farmer.id);
        console.log('[FARMER REGISTRATION] Farmer Email:', farmer.email);
        
        // Send registration confirmation email and SMS (non-blocking - don't fail registration if they fail)
        console.log('[FARMER REGISTRATION] Sending registration confirmation email and SMS...');
        
        // Send email (async, don't wait)
        sendRegistrationEmail({
            name: farmer.name,
            email: farmer.email,
            phone: farmer.phone,
            location: farmer.location
        }).then(emailResult => {
            if (emailResult.success) {
                console.log('[FARMER REGISTRATION] ✅ Email sent successfully:', emailResult.messageId);
            } else {
                console.log('[FARMER REGISTRATION] ⚠️ Email failed (non-blocking):', emailResult.error);
            }
        }).catch(err => {
            console.log('[FARMER REGISTRATION] ⚠️ Email error (non-blocking):', err.message);
        });
        
        // Send SMS (async, don't wait)
        sendRegistrationSMS(farmer.phone, farmer.name).then(smsResult => {
            if (smsResult.success) {
                console.log('[FARMER REGISTRATION] ✅ SMS sent successfully');
            } else {
                console.log('[FARMER REGISTRATION] ⚠️ SMS failed (non-blocking):', smsResult.error);
            }
        }).catch(err => {
            console.log('[FARMER REGISTRATION] ⚠️ SMS error (non-blocking):', err.message);
        });
        
        console.log('[FARMER REGISTRATION] Sending success response...\n');

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
        console.error('[FARMER REGISTRATION] ❌ CRITICAL ERROR during registration');
        console.error('[FARMER REGISTRATION] Error name:', error.name);
        console.error('[FARMER REGISTRATION] Error message:', error.message);
        console.error('[FARMER REGISTRATION] Error stack:', error.stack);
        console.error('[FARMER REGISTRATION] Full error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error registering farmer: ' + error.message,
            error: error.message
        });
    }
};

/**
 * Farmer Login (PostgreSQL)
 */
const loginFarmer = async (req, res) => {
    console.log('\n[FARMER LOGIN] 🔐 Login attempt');
    console.log('[FARMER LOGIN] Request body:', JSON.stringify({
        email: req.body.email,
        password: req.body.password ? '***PROVIDED***' : '***MISSING***'
    }));

    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            console.log('[FARMER LOGIN] ❌ Missing email or password');
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        const normalizedEmail = email ? email.toLowerCase().trim() : email;

        console.log('[FARMER LOGIN] Normalized email:', normalizedEmail);
        console.log('[FARMER LOGIN] Querying database...');

        // Find farmer by email (case-insensitive)
        const result = await pool.query(
            'SELECT * FROM farmers WHERE LOWER(email) = LOWER($1)',
            [normalizedEmail]
        );

        console.log('[FARMER LOGIN] Query result count:', result.rows.length);

        if (result.rows.length === 0) {
            console.log('[FARMER LOGIN] ❌ Farmer not found with email:', normalizedEmail);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const farmer = result.rows[0];
        console.log('[FARMER LOGIN] ✓ Farmer found:', farmer.email, '(ID:', farmer.id + ')');

        // Check if farmer is approved
        if (!farmer.is_approved) {
            console.log('[FARMER LOGIN] ❌ Account not approved');
            return res.status(403).json({
                success: false,
                message: 'Your account is pending approval'
            });
        }

        console.log('[FARMER LOGIN] ✓ Account is approved');
        console.log('[FARMER LOGIN] Verifying password...');
        console.log('[FARMER LOGIN] Password provided:', password ? 'YES' : 'NO');
        console.log('[FARMER LOGIN] Password length:', password?.length, 'characters');
        console.log('[FARMER LOGIN] Stored hash starts with:', farmer.password?.substring(0, 10) + '...');
        console.log('[FARMER LOGIN] Stored hash length:', farmer.password?.length, 'characters');

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, farmer.password);
        console.log('[FARMER LOGIN] Password comparison result:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('[FARMER LOGIN] ❌ Invalid password for:', normalizedEmail);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        console.log('[FARMER LOGIN] ✓ Password verified');
        console.log('[FARMER LOGIN] Updating last login...');

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

        console.log('[FARMER LOGIN] ✅ Login successful for:', normalizedEmail);
        console.log('[FARMER LOGIN] Sending success response\n');

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
        console.error('[FARMER LOGIN] ❌ CRITICAL ERROR:', error.message);
        console.error('[FARMER LOGIN] Error stack:', error.stack);
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

/**
 * Send OTP for registration (OPTIONAL FEATURE - First Time Only)
 * This endpoint is optional and can be used for OTP-based registration flow
 */
const sendOTP = async (req, res) => {
    try {
        const { email, phone, name } = req.body;
        
        console.log('[SEND OTP] 📧 OTP request for:', email, phone);
        
        // Validate required fields
        if (!email || !phone || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email, phone, and name are required'
            });
        }
        
        // Check if user already exists
        const existingFarmer = await pool.query(
            'SELECT * FROM farmers WHERE LOWER(email) = LOWER($1) OR phone = $2',
            [email.toLowerCase().trim(), phone.trim()]
        );
        
        if (existingFarmer.rows.length > 0) {
            console.log('[SEND OTP] ❌ User already exists');
            return res.status(400).json({
                success: false,
                message: 'A farmer with this email or phone number already exists'
            });
        }
        
        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP (using email as identifier)
        storeOTP(email.toLowerCase(), otp);
        
        // Send OTP via email and SMS (import these services)
        const emailService = require('../services/email.service');
        const smsService = require('../services/sms.service');
        
        const [emailResult, smsResult] = await Promise.allSettled([
            emailService.sendOTPEmail(email, name, otp),
            smsService.sendOTPSMS(phone, name, otp)
        ]);
        
        console.log('[SEND OTP] ✅ OTP sent successfully');
        
        res.json({
            success: true,
            message: 'OTP sent to your email and phone number',
            expiresIn: 300, // 5 minutes
            emailSent: emailResult.status === 'fulfilled' && emailResult.value.success,
            smsSent: smsResult.status === 'fulfilled' && smsResult.value.success
        });
        
    } catch (error) {
        console.error('[SEND OTP] ❌ Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending OTP',
            error: error.message
        });
    }
};

/**
 * Verify OTP (OPTIONAL FEATURE)
 * This endpoint is optional and can be used for OTP-based registration flow
 */
const verifyOTPEndpoint = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        console.log('[VERIFY OTP] 🔐 Verification request for:', email);
        
        // Validate required fields
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }
        
        // Verify OTP
        const result = verifyOTP(email.toLowerCase(), otp.toString());
        
        if (result.success) {
            console.log('[VERIFY OTP] ✅ OTP verified');
            res.json({
                success: true,
                message: 'OTP verified successfully. You can now complete registration.',
                verified: true
            });
        } else {
            console.log('[VERIFY OTP] ❌ OTP verification failed');
            res.status(400).json({
                success: false,
                message: result.message,
                verified: false
            });
        }
        
    } catch (error) {
        console.error('[VERIFY OTP] ❌ Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP',
            error: error.message
        });
    }
};

module.exports = {
    registerFarmer,
    loginFarmer,
    getAllFarmers,
    getFarmerProfile,
    updateFarmerProfile,
    getDashboardStats,
    sendOTP,
    verifyOTPEndpoint
};
