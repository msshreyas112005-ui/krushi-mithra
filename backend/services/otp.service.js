/**
 * OTP Service
 * Generates and manages OTPs for farmer registration
 * Stores OTPs temporarily in memory with expiry
 */

// In-memory OTP storage (for production, use Redis or database)
const otpStore = new Map();

// OTP expiry time (5 minutes)
const OTP_EXPIRY_MS = 5 * 60 * 1000;

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP with expiry
 */
function storeOTP(identifier, otp) {
    const expiryTime = Date.now() + OTP_EXPIRY_MS;
    
    otpStore.set(identifier, {
        otp: otp,
        expiryTime: expiryTime,
        attempts: 0,
        createdAt: Date.now()
    });
    
    console.log(`🔐 OTP stored for ${identifier}:`, otp, `(expires in 5 minutes)`);
    
    // Auto-cleanup after expiry
    setTimeout(() => {
        if (otpStore.has(identifier)) {
            otpStore.delete(identifier);
            console.log(`🗑️ OTP expired and removed for ${identifier}`);
        }
    }, OTP_EXPIRY_MS);
}

/**
 * Verify OTP
 */
function verifyOTP(identifier, submittedOTP) {
    const otpData = otpStore.get(identifier);
    
    if (!otpData) {
        return {
            success: false,
            message: 'OTP not found or expired. Please request a new OTP.'
        };
    }
    
    // Check if expired
    if (Date.now() > otpData.expiryTime) {
        otpStore.delete(identifier);
        return {
            success: false,
            message: 'OTP has expired. Please request a new OTP.'
        };
    }
    
    // Increment attempts
    otpData.attempts++;
    
    // Check max attempts (3 attempts allowed)
    if (otpData.attempts > 3) {
        otpStore.delete(identifier);
        return {
            success: false,
            message: 'Maximum OTP attempts exceeded. Please request a new OTP.'
        };
    }
    
    // Verify OTP
    if (otpData.otp === submittedOTP) {
        otpStore.delete(identifier); // Remove OTP after successful verification
        console.log(`✅ OTP verified successfully for ${identifier}`);
        return {
            success: true,
            message: 'OTP verified successfully'
        };
    } else {
        return {
            success: false,
            message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.`
        };
    }
}

/**
 * Check if OTP exists and is valid
 */
function hasValidOTP(identifier) {
    const otpData = otpStore.get(identifier);
    
    if (!otpData) {
        return false;
    }
    
    // Check if expired
    if (Date.now() > otpData.expiryTime) {
        otpStore.delete(identifier);
        return false;
    }
    
    return true;
}

/**
 * Clear OTP (for cleanup or manual removal)
 */
function clearOTP(identifier) {
    otpStore.delete(identifier);
    console.log(`🗑️ OTP cleared for ${identifier}`);
}

/**
 * Get OTP stats (for debugging)
 */
function getOTPStats() {
    const stats = {
        totalStored: otpStore.size,
        otps: []
    };
    
    otpStore.forEach((value, key) => {
        stats.otps.push({
            identifier: key,
            attempts: value.attempts,
            expiresIn: Math.max(0, Math.ceil((value.expiryTime - Date.now()) / 1000)),
            createdAt: new Date(value.createdAt).toISOString()
        });
    });
    
    return stats;
}

module.exports = {
    generateOTP,
    storeOTP,
    verifyOTP,
    hasValidOTP,
    clearOTP,
    getOTPStats
};
