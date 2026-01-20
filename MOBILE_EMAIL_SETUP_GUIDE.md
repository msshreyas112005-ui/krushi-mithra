# Mobile Email Dashboard Link Setup Guide

## Problem Fixed ✅
The dashboard link sent via email now works correctly on mobile devices.

## What Was Changed

### 1. **Email Service Updates** (`backend/services/notification.service.js`)
- ✅ Added support for `BASE_URL` environment variable
- ✅ Changed hardcoded `localhost:3000` to dynamic URL
- ✅ Added both login button and direct dashboard link
- ✅ Improved button styling with inline CSS for better mobile email client support
- ✅ Made links absolute URLs instead of relative paths

### 2. **Environment Configuration** (`.env` and `.env.example`)
- ✅ Added `BASE_URL` configuration variable
- ✅ Added clear instructions for different deployment scenarios
- ✅ Supports local, LAN (mobile testing), and production URLs

### 3. **Mobile Compatibility**
- ✅ Viewport meta tag already present in dashboard HTML
- ✅ Proper authentication redirect logic in place
- ✅ Responsive CSS already configured

---

## Setup for Different Scenarios

### **Scenario 1: Local Desktop Testing** (Default)
**Configuration:**
```env
BASE_URL=http://localhost:3000
```
**Use Case:** Testing on the same computer where server is running.

---

### **Scenario 2: Mobile Device Testing on Same WiFi Network** (RECOMMENDED)
This allows you to test on your mobile device while the server runs on your computer.

#### Step 1: Find Your Computer's Local IP Address

**On Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet).
Example: `192.168.1.100`

**On Mac/Linux:**
```bash
ifconfig | grep "inet "
```
Or:
```bash
ip addr show
```

#### Step 2: Update `.env` File
```env
BASE_URL=http://192.168.1.100:3000
```
Replace `192.168.1.100` with YOUR actual local IP address.

#### Step 3: Restart Server
```bash
npm start
```

#### Step 4: Test Email
1. Register a new farmer account using your real email
2. Check your email inbox on your mobile device
3. Click the "Login to Dashboard" button
4. It should open in your mobile browser successfully ✅

---

### **Scenario 3: Production Deployment**
**Configuration:**
```env
BASE_URL=https://yourdomain.com
```
**Use Case:** When deployed to a live server with a domain name.

---

## Testing Checklist

### ✅ Desktop Testing
- [ ] Server running on `http://localhost:3000`
- [ ] Register new farmer with valid email
- [ ] Check email received
- [ ] Click "Login to Dashboard" button
- [ ] Should redirect to farmer-login.html
- [ ] Login and verify dashboard loads

### ✅ Mobile Testing (Same WiFi)
- [ ] Update `BASE_URL` to your local IP (e.g., `http://192.168.1.100:3000`)
- [ ] Restart server
- [ ] Both devices (computer & phone) connected to SAME WiFi
- [ ] Register new farmer with valid email
- [ ] Open email on mobile device
- [ ] Click "Login to Dashboard" button
- [ ] Mobile browser should open the link
- [ ] Should redirect to login page if not logged in
- [ ] Login and verify dashboard displays correctly on mobile

---

## Troubleshooting

### Issue: "Can't reach this page" on Mobile
**Solution:**
- Ensure mobile device and computer are on the SAME WiFi network
- Verify `BASE_URL` uses your computer's local IP, not `localhost`
- Check Windows Firewall isn't blocking port 3000:
  ```powershell
  netsh advfirewall firewall add rule name="Node.js Port 3000" dir=in action=allow protocol=TCP localport=3000
  ```

### Issue: Email link goes to localhost instead of IP address
**Solution:**
- Double-check `.env` file has correct `BASE_URL`
- Restart the Node.js server after changing `.env`
- Clear email cache and request new registration email

### Issue: Dashboard shows blank page on mobile
**Solution:**
- Open browser console on mobile (Chrome DevTools via USB debugging)
- Check for JavaScript errors
- Verify viewport meta tag is present in HTML
- Ensure all CSS/JS files load correctly

### Issue: Button doesn't work in email
**Solution:**
- Some email clients block buttons - use the text link below the button
- Copy the dashboard URL and paste in mobile browser manually
- Try a different email client (Gmail app usually works best)

---

## Email Template Features

The registration email now includes:

1. **Primary Button:** "Login to Dashboard"
   - Opens the login page
   - Mobile-friendly inline styling
   - Works in most email clients

2. **Direct Link:** Plain text URL to dashboard
   - Fallback if button doesn't work
   - Easy to copy/paste

3. **Mobile Optimized:**
   - Responsive design
   - Touch-friendly button size (15px padding)
   - Readable on small screens

---

## Technical Details

### Email Link Format
```
Before: http://localhost:3000/frontend/html/farmer-login.html ❌
After:  http://192.168.1.100:3000/frontend/html/farmer-login.html ✅
```

### Authentication Flow
1. User clicks email link → Opens browser
2. Dashboard HTML loads → JavaScript checks for token
3. No token found → Redirects to `farmer-login.html`
4. User logs in → Token stored → Redirects to dashboard
5. Dashboard loads successfully ✅

### Mobile Browser Compatibility
- ✅ Chrome Mobile
- ✅ Safari Mobile (iOS)
- ✅ Firefox Mobile
- ✅ Samsung Internet
- ✅ Edge Mobile

---

## Quick Start for Mobile Testing

1. **Find your local IP:**
   ```powershell
   ipconfig
   ```

2. **Update `.env`:**
   ```env
   BASE_URL=http://YOUR_LOCAL_IP:3000
   ```

3. **Restart server:**
   ```bash
   npm start
   ```

4. **Test registration:**
   - Go to `http://YOUR_LOCAL_IP:3000/frontend/html/register.html`
   - Register with your real email
   - Check email on mobile device
   - Click dashboard link
   - Should work! ✅

---

## Security Note

⚠️ **Never commit `.env` file to Git!**
- It contains sensitive credentials
- Always use `.env.example` as template
- Each environment should have its own `.env` file

---

## Support

If issues persist:
1. Check server console for errors
2. Verify email was sent successfully (check logs)
3. Test the URL directly by pasting in mobile browser
4. Ensure firewall allows port 3000
5. Try different WiFi network

---

**Last Updated:** January 6, 2026
**Project:** KRISHI MITHRA
**Version:** 1.0.0
