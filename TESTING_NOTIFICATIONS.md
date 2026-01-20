# 🧪 Testing the Notification System

## Quick Test Steps

### 1. Verify Server is Running
- Backend server should be running on http://localhost:3000
- Check terminal for "✅ Email transporter initialized"

### 2. Test Admin Dashboard Notification

1. **Open Admin Dashboard:**
   - URL: http://localhost:3000/frontend/html/admin-dashboard.html
   - Login: admin@krishimithra.com / Admin@12345

2. **Send Test Notification:**
   - Scroll to "Send Notification" section
   - Fill in the form:
     - Title: `Test Notification`
     - Message: `This is a test notification to verify the system is working correctly.`
     - Type: `announcement`
     - Priority: `high`
     - Target Audience: `all`
     - Icon: `📢`
   - Click "Send Notification"
   - Should see: ✅ Success message with "Notification saved successfully (Demo Mode)"

3. **Expected Result:**
   - Button should show "📤 Sending..." during submission
   - Success alert should appear
   - Form should reset after successful send
   - notification should be saved to `backend/data/notifications.json`

### 3. Test Farmer Dashboard Display

1. **Open Farmer Dashboard:**
   - URL: http://localhost:3000/frontend/html/farmer-dashboard.html
   - Login with any of these farmers:
     - Email: sagarmysore@gmail.com / Password: (farmer's password)
     - Email: akularadhya@gmail.com / Password: (farmer's password)
     - Email: suryas@gmail.com / Password: (farmer's password)

2. **Check Notifications Section:**
   - Scroll to "Notifications" section
   - Should see the test notification you just sent
   - Should display:
     - 📢 Icon
     - "Test Notification" title
     - Full message text
     - "Just now" or "X minutes ago" time
     - Priority badge (HIGH)

3. **Verify Persistence:**
   - Refresh the page (F5)
   - Notifications should still be visible
   - Should persist across browser reloads

### 4. Check Backend Files

1. **Verify notifications.json:**
   ```bash
   # Open: backend/data/notifications.json
   # Should contain array with your test notification
   ```

2. **Check localStorage:**
   - Open Browser DevTools (F12)
   - Go to Application > Local Storage > http://localhost:3000
   - Look for key: `farmerNotifications`
   - Should contain array of notifications

### 5. Test Multiple Notifications

1. **Send 3-5 More Notifications:**
   - Send notifications with different priorities
   - Send notifications with different types
   - Send notifications with different icons

2. **Verify on Farmer Dashboard:**
   - Should display all notifications
   - Newest should appear at the top
   - Badge count should update

### 6. Test Email (Optional - Requires Configuration)

**Only if you've configured EMAIL_USER and EMAIL_PASSWORD in .env:**

1. **Send Notification with Email:**
   - Same steps as Test #2
   - Wait for success message
   - Should show: "📧 Emails sent to X farmers"

2. **Check Email Inbox:**
   - Check email inbox for farmers
   - Should receive professional HTML email
   - Email should have:
     - KRISHI MITHRA header
     - Priority badge
     - Icon
     - Formatted message
     - "View on Dashboard" button

## 🎯 Success Criteria

- ✅ Admin can send notification without errors
- ✅ Button disables and shows loading state
- ✅ Success message appears
- ✅ Notification appears on farmer dashboard
- ✅ Notifications persist after page reload
- ✅ Newest notifications appear first
- ✅ Time format displays correctly
- ✅ Icons and colors display properly
- ✅ No console errors in browser
- ✅ No performance lag

## 🐛 Common Issues

### Issue: "Cannot read property of undefined" Error
**Solution:** Clear browser cache and localStorage, then refresh

### Issue: Notifications not appearing
**Solution:** Check browser console (F12) for errors, verify server is running

### Issue: Button stuck in "Sending..." state
**Solution:** Check Network tab in DevTools, verify API endpoint is responding

### Issue: Email not configured warning
**Solution:** This is normal if you haven't set up EMAIL_USER/EMAIL_PASSWORD. System still works in demo mode.

## 📊 Test Results Template

```
Test Date: __________
Tester Name: __________

Test Case | Status | Notes
----------|--------|-------
Admin send notification | ☐ Pass ☐ Fail | 
Button loading state | ☐ Pass ☐ Fail | 
Success message | ☐ Pass ☐ Fail | 
Farmer dashboard display | ☐ Pass ☐ Fail | 
Persistence (reload) | ☐ Pass ☐ Fail | 
Newest first order | ☐ Pass ☐ Fail | 
Time format | ☐ Pass ☐ Fail | 
Icons/colors | ☐ Pass ☐ Fail | 
Multiple notifications | ☐ Pass ☐ Fail | 
No lag/errors | ☐ Pass ☐ Fail | 

Overall Status: ☐ Pass ☐ Fail
Comments: ____________________
```

## 🔍 Debugging Tips

1. **Check Server Logs:**
   ```bash
   # Look for these messages:
   # ✅ Email transporter initialized
   # 📢 Creating notification: ...
   # ✅ Notification saved to storage
   # 📧 Found X farmer email(s) to notify
   ```

2. **Check Browser Console:**
   ```javascript
   // Should see:
   // ✅ Loaded X notifications from storage
   // No red error messages
   ```

3. **Verify API Calls:**
   - Open DevTools > Network tab
   - Send notification
   - Look for POST to /api/admin/notifications
   - Status should be 200
   - Response should have success: true

4. **Check Files:**
   - backend/data/notifications.json should exist
   - Should contain array of notification objects
   - Each notification should have id, title, message, etc.

## 📋 Test Scenarios

### Scenario 1: Urgent Weather Alert
- Type: warning
- Priority: urgent
- Icon: 🌧️
- Message: "Heavy rainfall expected in next 24 hours"

### Scenario 2: New Subsidy Announcement
- Type: subsidy
- Priority: high
- Icon: 💰
- Message: "New PM-KISAN installment available"

### Scenario 3: Market Price Update
- Type: market
- Priority: medium
- Icon: 📈
- Message: "Rice prices increased by 10% in Bangalore market"

### Scenario 4: General Information
- Type: info
- Priority: low
- Icon: ℹ️
- Message: "Platform maintenance scheduled for Sunday"

---

**Happy Testing! 🎉**

If all tests pass, your notification system is working perfectly!
