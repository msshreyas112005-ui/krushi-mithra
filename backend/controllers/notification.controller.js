const notificationService = require('../services/notification.service');
const { pool } = require('../db');

/**
 * Get Farmer Notifications from Database
 */
const getFarmerNotifications = async (req, res) => {
  try {
    console.log('[NOTIFICATION] Fetching notifications from PostgreSQL');
    
    // Fetch notifications from database
    const result = await pool.query(
      `SELECT id, title, message, type, icon, target_audience, created_at 
       FROM notifications 
       ORDER BY created_at DESC 
       LIMIT 50`
    );

    const notifications = result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      title: row.title,
      message: row.message,
      type: row.type || 'info',
      priority: 'medium',
      icon: row.icon || '📢',
      audience: row.target_audience || 'all',
      createdAt: row.created_at,
      isRead: false
    }));

    console.log(`[NOTIFICATION] ✅ Found ${notifications.length} notifications`);

    res.json({
      success: true,
      notifications: notifications,
      data: notifications
    });
  } catch (error) {
    console.error('[NOTIFICATION] Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      notifications: []
    });
  }
};

/**
 * Mark Notification as Read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[NOTIFICATION] Marking notification ${id} as read`);

    // Note: In this simplified version, we just return success
    // In production, you might add a read_status table
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
 * Delete Notification from Database
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[NOTIFICATION] Deleting notification ${id} from PostgreSQL`);

    // Delete from database
    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    console.log(`[NOTIFICATION] ✅ Notification ${id} deleted successfully`);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('[NOTIFICATION] Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification'
    });
  }
};

/**
 * Get Admin Notifications
 */
const getAdminNotifications = async (req, res) => {
  try {
    console.log('[NOTIFICATION] Fetching admin notifications from PostgreSQL');
    
    // Fetch all notifications from database
    const result = await pool.query(
      `SELECT id, title, message, type, priority, icon, target_audience, created_at 
       FROM notifications 
       ORDER BY created_at DESC 
       LIMIT 100`
    );

    const notifications = result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      title: row.title,
      message: row.message,
      type: row.type || 'info',
      priority: row.priority || 'medium',
      icon: row.icon || '📢',
      audience: row.target_audience || 'all',
      createdAt: row.created_at
    }));

    res.json({
      success: true,
      data: notifications
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

    // Save notification to PostgreSQL database
    console.log('[NOTIFICATION] Saving to PostgreSQL database');
    const result = await pool.query(
      `INSERT INTO notifications 
       (title, message, type, priority, icon, target_audience, expiry_date, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING id, title, message, created_at`,
      [
        title,
        message,
        type || 'announcement',
        priority || 'medium',
        icon || '📢',
        targetAudience || 'all',
        expiryDate || null
      ]
    );

    const savedNotification = result.rows[0];
    console.log('[NOTIFICATION] ✅ Notification saved to database with ID:', savedNotification.id);

    // Send email notifications if requested
    let emailResult = { success: false, emailsSent: 0 };
    
    if (sendEmail) {
      try {
        // Get farmer emails from PostgreSQL
        let farmerEmails = [];
        
        console.log('📧 Fetching farmer emails from PostgreSQL (Neon)');
        
        const farmersQuery = await pool.query(
          'SELECT email FROM farmers WHERE is_approved = true AND email IS NOT NULL'
        );
        
        farmerEmails = farmersQuery.rows
          .filter(f => f.email && f.email.trim() !== '')
          .map(f => f.email);

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
  createNotification,
  deleteNotification
};
