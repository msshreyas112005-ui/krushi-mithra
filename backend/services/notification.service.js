const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Email Notification Service for KRUSHI MITHRA
 * Sends notifications to farmers via email
 */

class NotificationService {
    constructor() {
        // Gmail SMTP configuration
        this.transporter = null;
        this.initializeTransporter();
        
        // Storage file path
        this.notificationsFile = path.join(__dirname, '../data/notifications.json');
    }
    
    /**
     * Initialize email transporter
     */
    initializeTransporter() {
        try {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER || 'your-email@gmail.com',
                    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
                }
            });
            
            console.log('✅ Email transporter initialized');
        } catch (error) {
            console.error('❌ Failed to initialize email transporter:', error.message);
        }
    }
    
    /**
     * Send email notification to farmers
     * @param {Object} notification - Notification data
     * @param {Array} farmerEmails - Array of farmer email addresses
     * @returns {Promise<Object>} Result with success status
     */
    async sendEmailNotification(notification, farmerEmails) {
        if (!this.transporter) {
            console.warn('⚠️ Email transporter not configured. Skipping email send.');
            return {
                success: false,
                message: 'Email service not configured',
                emailsSent: 0
            };
        }
        
        try {
            const { title, message, type, priority } = notification;
            
            // Create HTML email template
            const htmlContent = this.generateEmailTemplate(notification);
            
            // Email options
            const mailOptions = {
                from: `"KRUSHI MITHRA" <${process.env.EMAIL_USER}>`,
                to: farmerEmails.join(','), // Send to multiple recipients
                subject: `${this.getPriorityEmoji(priority)} ${title}`,
                html: htmlContent,
                text: message // Plain text fallback
            };
            
            // Send email
            const info = await this.transporter.sendMail(mailOptions);
            
            console.log(`✅ Email notification sent to ${farmerEmails.length} farmers`);
            console.log('Message ID:', info.messageId);
            
            return {
                success: true,
                message: 'Email notifications sent successfully',
                emailsSent: farmerEmails.length,
                messageId: info.messageId
            };
            
        } catch (error) {
            console.error('❌ Error sending email notification:', error.message);
            return {
                success: false,
                message: `Email send failed: ${error.message}`,
                emailsSent: 0,
                error: error.message
            };
        }
    }
    
    /**
     * Generate HTML email template
     * @param {Object} notification - Notification data
     * @returns {String} HTML email content
     */
    generateEmailTemplate(notification) {
        const { title, message, type, priority, icon } = notification;
        
        const priorityColors = {
            urgent: '#dc3545',
            high: '#fd7e14',
            medium: '#0dcaf0',
            low: '#6c757d'
        };
        
        const color = priorityColors[priority] || '#0dcaf0';
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .email-header {
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .email-header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .notification-badge {
            display: inline-block;
            background: ${color};
            color: #ffffff;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 10px;
        }
        .email-body {
            padding: 30px 20px;
        }
        .notification-icon {
            font-size: 48px;
            text-align: center;
            margin-bottom: 20px;
        }
        .notification-title {
            font-size: 22px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
            text-align: center;
        }
        .notification-message {
            font-size: 16px;
            color: #555;
            line-height: 1.8;
            padding: 20px;
            background: #f8f9fa;
            border-left: 4px solid ${color};
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .notification-footer {
            text-align: center;
            padding: 10px 20px;
            color: #666;
            font-size: 14px;
        }
        .email-footer {
            background: #2c3e50;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            font-size: 13px;
        }
        .email-footer a {
            color: #2ecc71;
            text-decoration: none;
        }
        .button {
            display: inline-block;
            background: #2ecc71;
            color: #ffffff;
            padding: 12px 30px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 10px;
        }
        .button:hover {
            background: #27ae60;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>🌾 KRUSHI MITHRA</h1>
            <p>Karnataka Farmer Information System</p>
            <span class="notification-badge">${priority} Priority</span>
        </div>
        
        <div class="email-body">
            <div class="notification-icon">${icon || '📢'}</div>
            <div class="notification-title">${title}</div>
            <div class="notification-message">
                ${message}
            </div>
            
            <div class="notification-footer">
                <p><strong>📅 Notification Date:</strong> ${new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</p>
                <a href="http://localhost:3000/frontend/html/farmer-dashboard.html" class="button">
                    View on Dashboard
                </a>
            </div>
        </div>
        
        <div class="email-footer">
            <p><strong>KRUSHI MITHRA</strong> - Empowering Karnataka Farmers</p>
            <p>Government of Karnataka | Department of Agriculture</p>
            <p>
                <a href="#">Privacy Policy</a> | 
                <a href="#">Terms of Service</a> | 
                <a href="#">Help Center</a>
            </p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                You are receiving this email because you are a registered farmer on KRUSHI MITHRA platform.
            </p>
        </div>
    </div>
</body>
</html>
        `;
    }
    
    /**
     * Get emoji for priority level
     * @param {String} priority - Priority level
     * @returns {String} Priority emoji
     */
    getPriorityEmoji(priority) {
        const emojis = {
            urgent: '🚨',
            high: '⚠️',
            medium: 'ℹ️',
            low: '📌'
        };
        return emojis[priority] || 'ℹ️';
    }
    
    /**
     * Save notification to storage
     * @param {Object} notification - Notification data
     * @returns {Promise<Object>} Saved notification with ID
     */
    async saveNotification(notification) {
        try {
            // Read existing notifications
            let notifications = [];
            try {
                const data = await fs.readFile(this.notificationsFile, 'utf8');
                notifications = JSON.parse(data);
            } catch (error) {
                // File doesn't exist or is empty, start fresh
                notifications = [];
            }
            
            // Add new notification
            const newNotification = {
                id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ...notification,
                createdAt: new Date().toISOString(),
                read: false
            };
            
            notifications.unshift(newNotification);
            
            // Keep only last 100 notifications
            if (notifications.length > 100) {
                notifications = notifications.slice(0, 100);
            }
            
            // Save to file
            await fs.writeFile(
                this.notificationsFile,
                JSON.stringify(notifications, null, 2),
                'utf8'
            );
            
            console.log('✅ Notification saved to storage');
            return newNotification;
            
        } catch (error) {
            console.error('❌ Error saving notification:', error.message);
            throw error;
        }
    }
    
    /**
     * Get all notifications
     * @returns {Promise<Array>} Array of notifications
     */
    async getAllNotifications() {
        try {
            const data = await fs.readFile(this.notificationsFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.log('No notifications found or error reading file');
            return [];
        }
    }
    
    /**
     * Get notifications for specific target audience
     * @param {String} targetAudience - Target audience type
     * @param {String} location - Location filter (optional)
     * @param {String} crop - Crop filter (optional)
     * @returns {Promise<Array>} Filtered notifications
     */
    async getNotificationsForAudience(targetAudience, location = null, crop = null) {
        try {
            const allNotifications = await this.getAllNotifications();
            
            return allNotifications.filter(notif => {
                // All audience notifications
                if (notif.targetAudience === 'all') return true;
                
                // Location specific
                if (notif.targetAudience === 'location' && location) {
                    return notif.targetLocations && notif.targetLocations.includes(location);
                }
                
                // Crop specific
                if (notif.targetAudience === 'crop' && crop) {
                    return notif.targetCrops && notif.targetCrops.includes(crop);
                }
                
                return false;
            });
            
        } catch (error) {
            console.error('Error filtering notifications:', error.message);
            return [];
        }
    }
}

// Export singleton instance
module.exports = new NotificationService();
