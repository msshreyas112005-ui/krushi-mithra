const { pool } = require('../db');

/**
 * Get All Notifications (PostgreSQL)
 */
const getAllNotifications = async (req, res) => {
    try {
        const { type, limit } = req.query;

        let query = 'SELECT * FROM notifications';
        const params = [];

        if (type) {
            query += ' WHERE type = $1';
            params.push(type);
        }

        query += ' ORDER BY created_at DESC';

        if (limit) {
            query += ` LIMIT ${parseInt(limit)}`;
        } else {
            query += ' LIMIT 50';
        }

        const result = await pool.query(query, params);

        console.log(`✅ Found ${result.rows.length} notifications`);

        res.json({
            success: true,
            count: result.rows.length,
            notifications: result.rows
        });
    } catch (error) {
        console.error('❌ Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
};

/**
 * Create New Notification (Admin) (PostgreSQL)
 */
const createNotification = async (req, res) => {
    try {
        const {
            title,
            message,
            type,
            targetAudience,
            targetLocation,
            targetCrop,
            icon
        } = req.body;

        // Validate required fields
        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Title and message are required'
            });
        }

        const result = await pool.query(
            `INSERT INTO notifications (title, message, type, target_audience, target_location, target_crop, icon, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
             RETURNING *`,
            [
                title,
                message,
                type || 'info',
                targetAudience || 'all',
                targetLocation || null,
                targetCrop || null,
                icon || '📢'
            ]
        );

        const notification = result.rows[0];

        console.log('✅ Notification created:', notification.title);

        res.status(201).json({
            success: true,
            message: 'Notification sent successfully',
            notification: notification
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

/**
 * Get Notification by ID (PostgreSQL)
 */
const getNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM notifications WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            notification: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Get notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notification',
            error: error.message
        });
    }
};

/**
 * Delete Notification (Admin) (PostgreSQL)
 */
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM notifications WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        console.log('✅ Notification deleted');

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting notification',
            error: error.message
        });
    }
};

module.exports = {
    getAllNotifications,
    createNotification,
    getNotification,
    deleteNotification
};
