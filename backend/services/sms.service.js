/**
 * SMS Service (Mock Implementation)
 * Replace with real SMS service like Twilio, AWS SNS, or any Indian SMS provider
 * 
 * For production, use:
 * - Twilio: https://www.twilio.com/
 * - AWS SNS: https://aws.amazon.com/sns/
 * - MSG91: https://msg91.com/ (Indian provider)
 * - TextLocal: https://www.textlocal.in/ (Indian provider)
 */

/**
 * Send registration confirmation SMS
 */
async function sendRegistrationSMS(phone, name) {
    try {
        // Mock SMS implementation - logs to console
        const message = `Dear ${name}, Welcome to Krushi Mithra! Your registration is successful. Login now to access market prices, weather updates & subsidies. - Krushi Mithra`;
        
        console.log('📱 SMS SENT (MOCK):');
        console.log('   To:', phone);
        console.log('   Message:', message);
        console.log('   Timestamp:', new Date().toISOString());
        
        // In production, replace with actual SMS API call:
        /*
        const response = await axios.post('https://api.sms-provider.com/send', {
            apiKey: process.env.SMS_API_KEY,
            to: phone,
            message: message,
            senderId: 'KRUSHI'
        });
        */
        
        return { 
            success: true, 
            message: 'SMS sent successfully (mock)',
            phone: phone
        };
        
    } catch (error) {
        console.error('❌ Error sending SMS:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Send OTP via SMS
 */
async function sendOTPSMS(phone, name, otp) {
    try {
        // Mock SMS implementation - logs to console
        const message = `Dear ${name}, Your OTP for Krushi Mithra registration is: ${otp}. Valid for 5 minutes. Do not share with anyone. - Krushi Mithra`;
        
        console.log('📱 OTP SMS SENT (MOCK):');
        console.log('   To:', phone);
        console.log('   OTP:', otp);
        console.log('   Message:', message);
        console.log('   Timestamp:', new Date().toISOString());
        
        // In production, replace with actual SMS API call:
        /*
        const response = await axios.post('https://api.sms-provider.com/send', {
            apiKey: process.env.SMS_API_KEY,
            to: phone,
            message: message,
            senderId: 'KRUSHI'
        });
        */
        
        return { 
            success: true, 
            message: 'OTP SMS sent successfully (mock)',
            phone: phone
        };
        
    } catch (error) {
        console.error('❌ Error sending OTP SMS:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Verify phone number format (Indian format)
 */
function isValidIndianPhone(phone) {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid Indian mobile number
    // Must be 10 digits and start with 6, 7, 8, or 9
    return /^[6-9]\d{9}$/.test(cleaned);
}

module.exports = {
    sendRegistrationSMS,
    sendOTPSMS,
    isValidIndianPhone
};
