# 📧 Email Notification System - KRISHI MITHRA

## Overview
Complete notification system with email functionality for sending alerts, announcements, and important updates to registered farmers.

## ✅ Features Implemented

### Admin Dashboard (Sender)
- ✅ Send notifications to farmers
- ✅ Email notifications via Gmail SMTP
- ✅ Priority levels (Urgent, High, Medium, Low)
- ✅ Notification types (Announcement, Alert, Warning, Info, etc.)
- ✅ Target audience selection (All farmers, Location-specific, Crop-specific)
- ✅ Custom icons and expiry dates
- ✅ Button disabled during send (prevents duplicate sends)
- ✅ Loading indicator while sending
- ✅ Success/error feedback messages

### Farmer Dashboard (Receiver)
- ✅ Notifications display newest first
- ✅ Persistent storage across page reloads
- ✅ Unread badge count
- ✅ Time ago format (e.g., "2 hours ago")
- ✅ Notification icon and priority colors
- ✅ Auto-refresh from localStorage

### Backend
- ✅ Nodemailer integration for Gmail
- ✅ HTML email templates with branding
- ✅ File-based notification storage (notifications.json)
- ✅ Email sending to all approved farmers
- ✅ Support for JSON storage mode (no MongoDB required)
- ✅ Duplicate prevention and rate limiting
- ✅ Error handling and fallbacks

## 📋 How to Use

### 1. Configure Email (Gmail SMTP)

#### Option A: For Production (Real Email Sending)

1. **Get Gmail App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Sign in with your Gmail account
   - Create an "App Password" (select "Mail" and "Windows Computer")
   - Copy the 16-character password (example: `abcd efgh ijkl mnop`)

2. **Update .env file:**
   ```bash
   # Open backend/.env file and update these lines:
   EMAIL_USER=your-actual-email@gmail.com
   EMAIL_PASSWORD=abcdekgijklmnop  # Remove spaces from app password
   ```

3. **Restart Server:**
   ```bash
   cd backend
   node server.js
   ```

#### Option B: For Demo/Testing (No Email Sending)

- Leave the .env file as-is with placeholder values
- System will work in demo mode (notifications saved but no emails sent)
- Perfect for development and testing

### 2. Send Notification from Admin Dashboard

1. **Login to Admin Dashboard:**
   - URL: http://localhost:3000/frontend/html/admin-dashboard.html
   - Email: admin@krishimithra.com
   - Password: Admin@12345

2. **Navigate to Notification Section:**
   - Scroll down to "Send Notification" section
   - Fill in the form:
     - **Title**: Brief notification title (e.g., "Heavy Rainfall Alert")
     - **Message**: Detailed message content
     - **Type**: Select type (announcement, alert, warning, info, success, subsidy, weather, market)
     - **Priority**: Select priority (urgent, high, medium, low)
     - **Target Audience**: All farmers, specific location, or specific crop
     - **Icon** (optional): Emoji icon (e.g., 🌧️, 💰, 📢)
     - **Expiry Date** (optional): When notification should expire

3. **Send Notification:**
   - Click "Send Notification" button
   - Button will disable and show "📤 Sending..."
   - Wait for success message
   - Notification will be saved and emails sent (if configured)

### 3. View Notifications on Farmer Dashboard

1. **Login to Farmer Dashboard:**
   - URL: http://localhost:3000/frontend/html/farmer-dashboard.html
   - Use any registered farmer credentials

2. **View Notifications:**
   - Notifications section displays all notifications
   - Newest notifications appear at the top
   - Unread badge shows notification count
   - Each notification shows:
     - Icon and priority color
     - Title and message
     - Time ago (e.g., "2 hours ago")
     - Priority badge

## 📊 API Endpoints

### Admin Endpoints

#### Send Notification (POST)
```
POST http://localhost:3000/api/admin/notifications
Authorization: Bearer <admin-token>
Content-Type: application/json

Body:
{
  "title": "Heavy Rainfall Alert",
  "message": "IMD predicts heavy rainfall for the next 48 hours. Take necessary precautions.",
  "type": "warning",
  "priority": "urgent",
  "targetAudience": "all",
  "icon": "🌧️",
  "sendEmail": true
}

Response:
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "id": "notif-1234567890-abc123",
    "title": "Heavy Rainfall Alert",
    ...
  },
  "emailsSent": 5,
  "emailSuccess": true,
  "emailMessage": "Email notifications sent successfully"
}
```

### Farmer Endpoints

#### Get Notifications (GET)
```
GET http://localhost:3000/api/farmers/notifications
Authorization: Bearer <farmer-token>

Response:
{
  "success": true,
  "count": 3,
  "notifications": [
    {
      "id": "notif-123",
      "title": "Heavy Rainfall Alert",
      "message": "IMD predicts heavy rainfall...",
      "type": "warning",
      "priority": "urgent",
      "icon": "🌧️",
      "createdAt": "2025-01-18T10:30:00.000Z",
      "read": false
    },
    ...
  ]
}
```

## 🗂️ File Structure

```
backend/
├── services/
│   └── notification.service.js     # Email service with nodemailer
├── controllers/
│   └── notification.controller.js  # Notification business logic
├── routes/
│   ├── admin.routes.js             # POST /admin/notifications
│   └── farmer.routes.js            # GET /farmers/notifications
├── data/
│   └── notifications.json          # Notification storage
├── .env                            # Email configuration
└── package.json                    # Dependencies (includes nodemailer)

frontend/
├── js/
│   ├── admin-dashboard.js          # Send notification function
│   └── farmer-dashboard.js         # Display notifications
└── html/
    ├── admin-dashboard.html        # Notification form
    └── farmer-dashboard.html       # Notifications section
```

## 🔧 Technical Details

### Email Service (notification.service.js)
- **Gmail SMTP**: Uses nodemailer with Gmail service
- **HTML Templates**: Professional email design with branding
- **Error Handling**: Graceful fallback if email fails
- **File Storage**: Saves to notifications.json for persistence
- **Audience Filtering**: Supports all/location/crop targeting

### Frontend Implementation
- **Admin**: sendNotification function with loading states
- **Farmer**: loadNotifications with localStorage caching
- **Performance**: Optimized with cached DOM elements
- **No Lag**: Async/await with proper error handling

### Storage
- **Primary**: File-based (notifications.json)
- **Fallback**: In-memory array
- **Limit**: 100 notifications max
- **Format**: JSON with metadata

## 🎨 Email Template

The email notification includes:
- **Header**: KRISHI MITHRA branding with green gradient
- **Priority Badge**: Color-coded priority indicator
- **Icon**: Large emoji icon for visual recognition
- **Title**: Bold notification title
- **Message**: Formatted message with left border
- **Date/Time**: Formatted in Indian locale
- **CTA Button**: "View on Dashboard" link
- **Footer**: Department info and links

## ⚡ Performance Optimizations

1. **Single Initialization**: Prevents duplicate event listeners
2. **Cached DOM Elements**: Reduces DOM queries
3. **Event Delegation**: Efficient event handling
4. **Async/Await**: Non-blocking operations
5. **Loading Indicators**: Visual feedback during API calls
6. **LocalStorage Caching**: Fast retrieval without API calls
7. **Limit Results**: Maximum 50 notifications per request

## 🔒 Security

- **JWT Authentication**: All endpoints require valid tokens
- **Admin Authorization**: Only admins can send notifications
- **Email Validation**: Validates farmer emails before sending
- **App Passwords**: Uses Gmail App Passwords (not regular passwords)
- **Input Sanitization**: Validates all notification fields
- **Rate Limiting**: Prevents spam (can be configured)

## 🐛 Troubleshooting

### Emails Not Sending?

1. **Check .env file:**
   - EMAIL_USER is your Gmail address
   - EMAIL_PASSWORD is the App Password (not regular password)
   - No spaces in the App Password

2. **Gmail App Password:**
   - Must enable 2-factor authentication first
   - Generate App Password from https://myaccount.google.com/apppasswords
   - Use the 16-character password (remove spaces)

3. **Check Server Logs:**
   - Look for "✅ Email transporter initialized"
   - Check for email sending errors
   - Verify "✅ Email notification sent to X farmers"

4. **Network Issues:**
   - Ensure internet connection is active
   - Check firewall settings (port 587 for SMTP)
   - Verify Gmail SMTP is not blocked

### Notifications Not Appearing on Farmer Dashboard?

1. **Check localStorage:**
   - Open browser DevTools (F12)
   - Go to Application > Local Storage
   - Look for "farmerNotifications" key

2. **Clear Cache:**
   - Clear browser cache and localStorage
   - Refresh the page
   - Send a new notification from admin

3. **Check Browser Console:**
   - Look for JavaScript errors
   - Verify "✅ Loaded X notifications from storage"

4. **Verify File:**
   - Check backend/data/notifications.json exists
   - Should contain array of notification objects

### Button Stuck in "Sending..." State?

1. **Check Network:**
   - Open DevTools > Network tab
   - Look for failed API requests
   - Check response status and error messages

2. **Refresh Page:**
   - Hard refresh (Ctrl+Shift+R)
   - Clear cache if needed

3. **Check Backend:**
   - Verify server is running
   - Check backend logs for errors

## 📈 Future Enhancements

- [ ] Mark notifications as read
- [ ] Delete notifications
- [ ] Notification categories/filters
- [ ] Push notifications (browser notifications)
- [ ] SMS integration (Twilio)
- [ ] WhatsApp integration
- [ ] Notification scheduling
- [ ] Analytics dashboard
- [ ] Email templates management
- [ ] Multilingual email support

## 🎯 Testing Checklist

- [x] Admin can send notification
- [x] Button disables during send
- [x] Loading indicator appears
- [x] Success message shows email count
- [x] Notification saves to storage
- [x] Farmer dashboard loads notifications
- [x] Notifications display newest first
- [x] Time ago format works
- [x] Icons and colors display correctly
- [x] Persistence across page reloads
- [x] Works without MongoDB
- [x] Email configuration is optional
- [x] Demo mode works without email setup
- [x] No performance lag
- [x] No duplicate notifications

## 📞 Support

For questions or issues:
1. Check server logs: `backend/server.log`
2. Check browser console (F12)
3. Review API responses in Network tab
4. Verify .env configuration
5. Test with demo mode first (no email setup required)

---

**Note**: Email functionality requires Gmail App Password. For demo/testing, you can use the system without email configuration - notifications will still be saved and displayed on farmer dashboard.

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
