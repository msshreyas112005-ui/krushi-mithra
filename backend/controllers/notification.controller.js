const notificationService = require('../services/notification.service');
const Farmer = require('../models/farmer.model');
const jsonStorage = require('../utils/jsonStorage');

// Store notifications in memory (in production, use database)
let notifications = [
  {
    _id: '1',
    title: 'Welcome to KRUSHI MITHRA',
    message: 'Thank you for joining our platform!',
    type: 'info',
    isRead: false,
    audience: 'farmer',
    createdAt: new Date()
  },
  {
    _id: '2',
    title: 'Market Alert',
    message: 'Rice prices increased by 10% in Mysore market',
    type: 'alert',
    isRead: false,
    audience: 'farmer',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    _id: '3',
    title: 'New Farmer Registration',
    message: 'A new farmer has registered and is awaiting approval',
    type: 'info',
    isRead: false,
    audience: 'admin',
    createdAt: new Date()
  }
];

/**
 * Get Farmer Notifications
 */
const getFarmerNotifications = async (req, res) => {
  try {
    // Filter notifications for farmers
    const farmerNotifications = notifications.filter(n => 
      n.audience === 'farmer' || n.audience === 'all'
    );

    res.json({
      success: true,
      data: farmerNotifications
    });
  } catch (error) {
    console.error('[NOTIFICATION] Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
};

/**
 * Mark Notification as Read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('[NOTIFICATION] Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification'
    });
  }
};

/**
 * Get Admin Notifications
 */
const getAdminNotifications = async (req, res) => {
  try {
    // Filter notifications for admins
    const adminNotifications = notifications.filter(n => 
      n.audience === 'admin' || n.audience === 'all'
    );

    res.json({
      success: true,
      data: adminNotifications
    });
  } catch (error) {
    console.error('[NOTIFICATION] Get admin notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
};

/**
 * Create and Broadcast Notification with Email Support
 */
const createNotification = async (req, res) => {
  try {
    const { 
      title, 
      message, 
      type, 
      priority, 
      targetAudience, 
      icon, 
      sendEmail,
      targetLocations,
      targetCrops,
      expiryDate 
    } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    console.log('📢 Creating notification:', { title, priority, targetAudience, sendEmail });

    // Create notification object
    const newNotification = {
      title,
      message,
      type: type || 'announcement',
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      icon: icon || '📢',
      targetLocations,
      targetCrops,
      expiryDate,
      createdAt: new Date().toISOString()
    };

    // Save notification to storage
    const savedNotification = await notificationService.saveNotification(newNotification);

    // Add to in-memory array for immediate API access
    notifications.unshift({
      _id: savedNotification.id,
      ...newNotification,
      audience: 'farmer',
      isRead: false
    });

    // Keep only last 100 in memory
    if (notifications.length > 100) {
      notifications = notifications.slice(0, 100);
    }

    // Send email notifications if requested
    let emailResult = { success: false, emailsSent: 0 };
    
    if (sendEmail) {
      try {
        // Get farmer emails
        let farmerEmails = [];
        
        // Check if using JSON storage mode
        if (process.env.USE_JSON_STORAGE === 'true' || !process.env.MONGODB_URI) {
          console.log('📧 Fetching farmer emails from JSON storage');
          const farmers = await jsonStorage.getAllFarmers();
          
          // Filter approved farmers
          const approvedFarmers = farmers.filter(f => f.status === 'approved');
          farmerEmails = approvedFarmers
            .filter(f => f.email && f.email.trim() !== '')
            .map(f => f.email);
          
        } else {
          // MongoDB mode
          console.log('📧 Fetching farmer emails from MongoDB');
          const farmers = await Farmer.find({ 
            status: 'approved',
            email: { $exists: true, $ne: '' }
          }).select('email');
          
          farmerEmails = farmers.map(f => f.email);
        }

        console.log(`📧 Found ${farmerEmails.length} farmer email(s) to notify`);

        if (farmerEmails.length > 0) {
          // Send emails
          emailResult = await notificationService.sendEmailNotification(
            newNotification,
            farmerEmails
          );
          
          console.log(`✅ Email result:`, emailResult);
        } else {
          console.log('⚠️ No farmer emails found');
          emailResult = {
            success: false,
            message: 'No farmer emails found',
            emailsSent: 0
          };
        }

      } catch (emailError) {
        console.error('❌ Email sending error:', emailError.message);
        emailResult = {
          success: false,
          message: `Email error: ${emailError.message}`,
          emailsSent: 0,
          error: emailError.message
        };
      }
    }

    console.log('✅ Notification created successfully');

    res.json({
      success: true,
      message: 'Notification created successfully',
      data: savedNotification,
      emailsSent: emailResult.emailsSent,
      emailSuccess: emailResult.success,
      emailMessage: emailResult.message
    });

  } catch (error) {
    console.error('❌ Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

module.exports = {
  getFarmerNotifications,
  markAsRead,
  getAdminNotifications,
  createNotification
};
