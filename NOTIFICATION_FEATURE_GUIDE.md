# 📢 Admin Notification Feature - Complete Guide

## Overview
The admin panel now includes a complete notification system that allows administrators to send notifications to farmers both in the application **and via email**.

---

## ✅ Features Implemented

### 1. **Admin Dashboard Navigation**
- Added "📢 Notifications" tab in the admin navigation menu
- Click on "Notifications" to access the notification sending interface

### 2. **Notification Form Fields**

#### Required Fields:
- **Title**: Subject of the notification (e.g., "Heavy Rainfall Alert")
- **Type**: Category of notification
  - Info 📘
  - Warning ⚠️
  - Success ✅
  - Alert 🚨
  - Announcement 📢

- **Message**: The main content of the notification
- **Priority**: Urgency level (Low, Medium, High, Urgent)
- **Target Audience**: Who receives the notification
  - All Farmers 👥 (Default)
  - By Location 📍 (Specify location)
  - By Crop Type 🌾 (Specify crop type)

#### Optional Fields:
- **Icon**: Emoji icon for the notification (e.g., 🌧️, 💰, 📈)
- **Expiry Date**: When the notification should expire
- **Send Email**: Checkbox to send email notifications (checked by default)

### 3. **Email Integration**
- Notifications are automatically sent to farmers' email addresses
- Email includes:
  - Notification title
  - Full message content
  - Priority level
  - Professional formatting
  - KRUSHI MITHRA branding

### 4. **In-App Notification**
- Notifications appear in farmers' dashboard notification tab
- Real-time notification counter
- Unread notification indicator
- Persistent storage in database

---

## 🚀 How to Use

### Step 1: Access Admin Dashboard
1. Login to admin panel: `http://localhost:3000/frontend/html/admin-login.html`
2. Navigate to "📢 Notifications" tab

### Step 2: Fill Notification Form

#### Example 1: Weather Alert
```
Title: Heavy Rainfall Expected This Week
Type: Warning ⚠️
Message: Heavy rainfall predicted for the next 3 days. Please take necessary precautions for your crops and ensure proper drainage.
Priority: High
Target Audience: All Farmers
Icon: 🌧️
Send Email: ✅ Checked
```

#### Example 2: Market Price Update
```
Title: Rice Prices Increased by 15%
Type: Info 📘
Message: The market price for rice has increased by 15% in Bangalore and Mysore markets. Good time to sell your produce!
Priority: Medium
Target Audience: All Farmers
Icon: 💰
Send Email: ✅ Checked
```

#### Example 3: Location-Specific Alert
```
Title: Fertilizer Subsidy Available
Type: Success ✅
Message: New fertilizer subsidy scheme launched by Karnataka government. Eligible farmers can apply online.
Priority: High
Target Audience: By Location
Target Location: Karnataka
Icon: 🌾
Send Email: ✅ Checked
```

### Step 3: Send Notification
1. Click "📤 Send Notification & Email" button
2. System will:
   - Save notification to database
   - Send notification to farmers' dashboard
   - Send email to all registered farmer email addresses
3. Success confirmation will appear with email count

---

## 🔧 Backend API Details

### Endpoint: `POST /api/admin/notifications`

**Request Body:**
```json
{
  "title": "Notification Title",
  "message": "Notification message content",
  "type": "info|warning|success|alert|announcement",
  "priority": "low|medium|high|urgent",
  "targetAudience": "all|location|crop",
  "icon": "🌧️",
  "sendEmail": true,
  "targetLocations": ["Karnataka", "Mysore"],
  "targetCrops": ["Rice", "Wheat"],
  "expiryDate": "2026-01-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification created and broadcasted successfully",
  "emailsSent": 25,
  "notificationId": "notif_1234567890",
  "data": {
    "id": "notif_1234567890",
    "title": "...",
    "message": "...",
    "createdAt": "2026-01-06T12:00:00.000Z"
  }
}
```

---

## 📧 Email Configuration

### Email Service Details
- **Service**: Gmail
- **Configuration**: Located in `backend/services/notification.service.js`
- **Email Template**: Professional HTML format with:
  - KRUSHI MITHRA logo
  - Formatted message content
  - Priority badge
  - Contact information

### Email Sending Flow:
1. Admin submits notification with "Send Email" checked
2. Backend fetches all farmer email addresses from database
3. Email service sends notification to each farmer
4. Response includes count of emails sent

### Email Environment Variables:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 🎯 Farmer Side - How They Receive Notifications

### 1. **Dashboard Notification Tab**
- Farmers see notification icon with unread count
- Click on notification tab to view all notifications
- Notifications display:
  - Icon and title
  - Message content
  - Priority level
  - Date and time

### 2. **Email Notification**
- Farmers receive professional email at their registered email address
- Email subject: Notification title
- Email body: Full message with formatting
- Includes link to KRUSHI MITHRA platform

---

## 🔍 Testing the Feature

### Test Scenario 1: Send to All Farmers
1. Login as admin
2. Go to Notifications section
3. Fill form with test data
4. Check "Send Email" checkbox
5. Click send
6. Verify:
   - ✅ Success message appears
   - ✅ Email count shown
   - ✅ Check farmer dashboard for notification
   - ✅ Check farmer email inbox

### Test Scenario 2: Location-Based Notification
1. Select "By Location" in Target Audience
2. Enter location (e.g., "Mysore")
3. Send notification
4. Verify only farmers in that location receive it

### Test Scenario 3: High Priority Alert
1. Set priority to "Urgent"
2. Use alert type with warning icon
3. Send notification
4. Verify notification appears with high priority styling

---

## 📊 Database Storage

### Notifications Table
Notifications are stored in PostgreSQL database with:
- `id`: Unique identifier
- `title`: Notification title
- `message`: Message content
- `type`: Notification type
- `priority`: Priority level
- `target_audience`: Audience type
- `target_locations`: Array of locations
- `target_crops`: Array of crops
- `icon`: Emoji icon
- `expiry_date`: Expiration date
- `created_at`: Creation timestamp
- `emails_sent`: Count of emails sent

---

## 🛠️ Troubleshooting

### Issue: Emails Not Sending
**Solution:**
1. Check email configuration in `.env` file
2. Verify Gmail app password is correct
3. Check email service initialization in server logs
4. Look for email errors in console: `❌ Failed to send emails`

### Issue: Notification Not Appearing on Farmer Dashboard
**Solution:**
1. Check if notification was saved to database
2. Verify farmer is logged in
3. Refresh farmer dashboard
4. Check browser console for errors

### Issue: "No farmer emails found"
**Solution:**
1. Verify farmers have email addresses in database
2. Check farmers are approved (`is_approved = true`)
3. Run SQL query: `SELECT email FROM farmers WHERE is_approved = true`

---

## 📈 Future Enhancements

### Planned Features:
- [ ] Scheduled notifications (send at specific date/time)
- [ ] Notification templates for common alerts
- [ ] SMS integration alongside email
- [ ] Push notifications for mobile app
- [ ] Notification analytics (delivery rate, open rate)
- [ ] Bulk upload of farmer phone numbers for SMS
- [ ] WhatsApp integration for instant messaging

---

## 🔐 Security Notes

1. **Admin Authentication Required**: Only authenticated admins can send notifications
2. **Input Validation**: All fields are validated on backend
3. **SQL Injection Prevention**: Parameterized queries used
4. **XSS Protection**: HTML content sanitized
5. **Rate Limiting**: Prevents notification spam

---

## 📞 Support

For issues or questions:
1. Check server logs: `backend/server.js` console output
2. Check browser console for frontend errors
3. Verify database connection
4. Test email configuration with test endpoint

---

## ✅ Summary

**What Works:**
- ✅ Admin can send notifications from dashboard
- ✅ Notifications appear in farmer dashboard notification tab
- ✅ Emails are sent to all registered farmers
- ✅ Different notification types (info, warning, alert, etc.)
- ✅ Priority levels (low, medium, high, urgent)
- ✅ Target audience filtering (all, location, crop)
- ✅ Professional email templates
- ✅ Database persistence
- ✅ Real-time updates

**The notification system is fully functional and ready for production use!** 🎉
