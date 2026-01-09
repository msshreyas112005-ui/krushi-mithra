const nodemailer = require('nodemailer');

/**
 * Email Service using Nodemailer with Gmail
 * Configure your Gmail App Password in .env file
 */

// Create reusable transporter
let transporter = null;

// Initialize transporter
function initializeTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_APP_PASSWORD || 'your-app-password'
            }
        });
        
        console.log('📧 Email service initialized with:', process.env.EMAIL_USER || 'NOT_CONFIGURED');
    }
    return transporter;
}

/**
 * Send registration confirmation email
 */
async function sendRegistrationEmail(farmerData) {
    try {
        const transporter = initializeTransporter();
        
        const mailOptions = {
            from: `"Krushi Mithra" <${process.env.EMAIL_USER}>`,
            to: farmerData.email,
            subject: 'Registration Successful – Krushi Mithra',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; background: #2ecc71; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🌾 Welcome to Krushi Mithra!</h1>
                        </div>
                        <div class="content">
                            <h2>Registration Successful</h2>
                            <p>Dear ${farmerData.name},</p>
                            <p>Thank you for registering with Krushi Mithra - Your Agricultural Companion!</p>
                            
                            <h3>Your Registration Details:</h3>
                            <ul>
                                <li><strong>Name:</strong> ${farmerData.name}</li>
                                <li><strong>Email:</strong> ${farmerData.email}</li>
                                <li><strong>Phone:</strong> ${farmerData.phone}</li>
                                <li><strong>Location:</strong> ${farmerData.location}</li>
                                <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString('en-IN')}</li>
                            </ul>
                            
                            <p>You can now login to access:</p>
                            <ul>
                                <li>📊 Real-time Market Prices</li>
                                <li>🌦️ Weather Updates</li>
                                <li>💰 Government Subsidies</li>
                                <li>📢 Important Notifications</li>
                            </ul>
                            
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5500'}/frontend/html/farmer-login.html" class="button">Login to Dashboard</a>
                            
                            <p>If you have any questions, please contact us at ${process.env.SUPPORT_EMAIL || 'support@krushimithra.com'}</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} Krushi Mithra. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Registration email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error('❌ Error sending registration email:', error.message);
        // Don't throw error - just log it so registration can continue
        return { success: false, error: error.message };
    }
}

/**
 * Send OTP email
 */
async function sendOTPEmail(email, name, otp) {
    try {
        const transporter = initializeTransporter();
        
        const mailOptions = {
            from: `"Krushi Mithra" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your OTP for Registration – Krushi Mithra',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
                        .otp-box { background: white; border: 2px dashed #3498db; padding: 20px; margin: 20px 0; border-radius: 10px; }
                        .otp-code { font-size: 36px; font-weight: bold; color: #3498db; letter-spacing: 5px; }
                        .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; text-align: left; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 OTP Verification</h1>
                        </div>
                        <div class="content">
                            <p>Dear ${name},</p>
                            <p>Your One-Time Password (OTP) for Krushi Mithra registration is:</p>
                            
                            <div class="otp-box">
                                <div class="otp-code">${otp}</div>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Important:</strong>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>This OTP is valid for 5 minutes only</li>
                                    <li>Do not share this OTP with anyone</li>
                                    <li>Krushi Mithra will never ask for your OTP</li>
                                </ul>
                            </div>
                            
                            <p>If you didn't request this OTP, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} Krushi Mithra. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ OTP email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error('❌ Error sending OTP email:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendRegistrationEmail,
    sendOTPEmail
};
