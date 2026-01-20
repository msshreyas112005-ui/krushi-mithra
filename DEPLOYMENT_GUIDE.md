# 🚀 KRISHI MITHRA - Production Deployment Guide

This guide will help you deploy KRISHI MITHRA to the web so anyone can access it from their laptop or mobile device.

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment (Render/Railway)](#backend-deployment)
3. [Frontend Deployment (Vercel/Netlify)](#frontend-deployment)
4. [Environment Variables Setup](#environment-variables-setup)
5. [Post-Deployment Testing](#post-deployment-testing)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure you have:

- [x] GitHub account
- [x] Neon PostgreSQL database (already configured)
- [x] OpenWeatherMap API key (in .env)
- [x] Gmail App Password for email notifications (in .env)
- [ ] Backend hosting account (Render/Railway/Fly.io)
- [ ] Frontend hosting account (Vercel/Netlify/GitHub Pages)

---

## 🎯 STEP 1: Push to GitHub

### 1.1 Initialize Git Repository (if not already done)

```bash
# Navigate to project root
cd C:\Users\mahal\OneDrive\Desktop\KRISHI_MITHRA

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Prepare KRISHI MITHRA for production deployment"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `krishi-mithra`
3. Description: "Complete agriculture platform for Karnataka farmers"
4. Set as **Public** (for free hosting)
5. **DO NOT** initialize with README
6. Click "Create repository"

### 1.3 Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/krishi-mithra.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🔧 STEP 2: Deploy Backend to Render

**Why Render?** Free tier, auto-deploys from GitHub, supports Node.js + PostgreSQL

### 2.1 Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 2.2 Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your `krishi-mithra` repository
3. Configure:
   - **Name**: `krishi-mithra-backend`
   - **Region**: Choose nearest (e.g., Singapore/Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

### 2.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**. Add these:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://neondb_owner:npg_RZpaxCSsoD15@ep-super-breeze-a1bnvnew-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=KRISHI_MITHRA_secret_key_2025_secure_token
OPENWEATHER_API_KEY=2dc416bde8a045c05a52551eebc4d477
WEATHER_API_KEY=2dc416bde8a045c05a52551eebc4d477
ADMIN_EMAIL=admin@krishimithra.com
ADMIN_PASSWORD=Admin@12345
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
BASE_URL=https://krishi-mithra-backend.onrender.com
FRONTEND_URL=https://krishi-mithra.vercel.app
```

**Important Notes:**
- Replace `EMAIL_USER` and `EMAIL_PASSWORD` with your actual Gmail credentials
- Keep `DATABASE_URL` exactly as shown (your Neon database)
- `BASE_URL` will be your Render app URL (update after creation)
- `FRONTEND_URL` will be your Vercel URL (update after frontend deployment)

### 2.4 Deploy Backend

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Your backend URL: `https://krishi-mithra-backend.onrender.com`
4. Test health check: Visit `https://krishi-mithra-backend.onrender.com/api/health`

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-07T...",
  "environment": "production",
  "database": "connected"
}
```

### 2.5 Update Environment Variables

Now that you have the backend URL:

1. Go to Render dashboard → Your service → **Environment**
2. Update `BASE_URL` to your actual backend URL
3. Click **"Save Changes"** (auto-redeploys)

---

## 🌐 STEP 3: Deploy Frontend to Vercel

**Why Vercel?** Free tier, instant deployments, excellent for static sites + Next.js

### 3.1 Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel

### 3.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Import `krishi-mithra` repository
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: Leave as `.` (root)
   - **Build Command**: Leave empty
   - **Output Directory**: `frontend`

### 3.3 Update config.js with Backend URL

Before deploying, update the production API URL:

1. Open `frontend/js/config.js`
2. Update line 19:
   ```javascript
   PRODUCTION_API_URL: 'https://krishi-mithra-backend.onrender.com',
   ```
3. Commit and push:
   ```bash
   git add frontend/js/config.js
   git commit -m "Update production API URL"
   git push
   ```

### 3.4 Deploy Frontend

1. Click **"Deploy"**
2. Wait 1-2 minutes
3. Your frontend URL: `https://krishi-mithra.vercel.app` (or similar)

### 3.5 Update Backend CORS

Now update the backend to allow your frontend:

1. Go to Render dashboard → Backend service → **Environment**
2. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://krishi-mithra.vercel.app
   ```
3. Save changes (auto-redeploys)

---

## 🎨 ALTERNATIVE: Deploy Frontend to Netlify

If you prefer Netlify over Vercel:

### 3A.1 Create Netlify Account

1. Go to https://netlify.com
2. Sign up with GitHub

### 3A.2 Create New Site

1. Click **"Add new site"** → **"Import an existing project"**
2. Connect GitHub → Select `krishi-mithra`
3. Configure:
   - **Branch**: `main`
   - **Base directory**: Leave empty
   - **Build command**: Leave empty
   - **Publish directory**: `frontend`

### 3A.3 Deploy

1. Click **"Deploy site"**
2. Wait 1-2 minutes
3. Your URL: `https://krishi-mithra.netlify.app`

The `netlify.toml` file is already configured to:
- Serve frontend files
- Proxy API calls to your backend
- Handle redirects

---

## 🔐 STEP 4: Secure Your Deployment

### 4.1 Update .env in Backend

**DO NOT** commit `.env` file to GitHub. Render/Railway use their own environment variables.

### 4.2 Update CORS Settings

The backend is already configured to accept requests from:
- Your Vercel/Netlify frontend
- Localhost (for development)

### 4.3 Generate Secure JWT Secret

For production, generate a strong JWT secret:

```bash
# On PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Update `JWT_SECRET` in Render environment variables.

---

## 🧪 STEP 5: Test Your Deployment

### 5.1 Frontend Tests

Visit your frontend URL and test:

- [x] Homepage loads
- [x] Language switching works
- [x] Registration form works
- [x] Login redirects properly

### 5.2 Backend API Tests

Test API endpoints:

```bash
# Health check
curl https://krishi-mithra-backend.onrender.com/api/health

# Get market prices (should work without auth)
curl https://krishi-mithra-backend.onrender.com/api/market-prices

# Test farmer registration
curl -X POST https://krishi-mithra-backend.onrender.com/api/farmers/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Farmer","email":"test@example.com","password":"Test@123","phone":"9876543210","location":"Bangalore","primaryCrop":"rice"}'
```

### 5.3 End-to-End Tests

1. **Register as Farmer**
   - Go to `/html/register.html`
   - Fill form and submit
   - Check email for welcome message

2. **Login as Farmer**
   - Use registered credentials
   - Dashboard should load with:
     - Weather data
     - Market prices
     - Subsidies

3. **Admin Login**
   - Go to `/html/admin-login.html`
   - Login with admin credentials (from .env)
   - Test admin features:
     - View farmers
     - Send notifications
     - Update prices

### 5.4 Mobile Testing

Test on mobile devices:

1. Open your deployed URL on phone
2. Check responsive design
3. Test forms and navigation
4. Verify images load
5. Check PWA installation (Add to Home Screen)

---

## 📱 STEP 6: Enable Mobile App Features (PWA)

Your app is already PWA-ready with `manifest.json`. Users can:

### On Android:
1. Open site in Chrome
2. Tap menu (⋮)
3. Tap "Add to Home Screen"
4. App appears like native app

### On iOS:
1. Open site in Safari
2. Tap Share button
3. Tap "Add to Home Screen"

---

## 🔄 STEP 7: Set Up Auto-Deployment

Both Render and Vercel auto-deploy when you push to GitHub.

### Development Workflow:

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push

# Automatic deployment happens:
# 1. GitHub receives push
# 2. Render rebuilds backend
# 3. Vercel rebuilds frontend
# 4. Live in 2-5 minutes
```

---

## 🌍 STEP 8: Share Your App

Your app is now live! Share these URLs:

- **Main Website**: `https://krishi-mithra.vercel.app`
- **Farmer Registration**: `https://krishi-mithra.vercel.app/html/register.html`
- **Admin Portal**: `https://krishi-mithra.vercel.app/html/admin-login.html`

---

## 🐛 Troubleshooting

### Issue: Frontend can't connect to backend

**Solution:**
1. Check backend is running: Visit `/api/health`
2. Verify CORS settings in backend
3. Check `config.js` has correct production URL
4. Open browser console for errors

### Issue: Database connection fails

**Solution:**
1. Verify `DATABASE_URL` in Render environment
2. Check Neon database is active
3. Ensure `?sslmode=require` is in connection string

### Issue: Email notifications not working

**Solution:**
1. Verify Gmail App Password (not regular password)
2. Check `EMAIL_USER` and `EMAIL_PASSWORD` in Render
3. Ensure 2FA is enabled on Gmail account

### Issue: Render free tier sleeps after inactivity

**Solution:**
Free tier sleeps after 15 minutes of inactivity. Options:
1. Upgrade to paid plan ($7/month)
2. Use a service like UptimeRobot to ping every 5 minutes
3. Accept 30-second cold start on first request

### Issue: API calls fail with CORS error

**Solution:**
1. Check browser console for exact error
2. Verify `FRONTEND_URL` in backend environment
3. Ensure frontend URL matches exactly (with/without trailing slash)
4. Check `security.middleware.js` CORS configuration

---

## 📊 Monitoring Your Deployment

### Backend Monitoring (Render)

1. Go to Render dashboard
2. Click your service
3. View:
   - **Logs**: Real-time server logs
   - **Metrics**: CPU, Memory usage
   - **Events**: Deployment history

### Frontend Monitoring (Vercel)

1. Go to Vercel dashboard
2. Click your project
3. View:
   - **Analytics**: Page views, visitors
   - **Performance**: Load times
   - **Logs**: Deployment logs

---

## 🎯 Performance Optimization

### Backend Optimizations (Already Done)

- ✅ Gzip compression
- ✅ Rate limiting
- ✅ Security headers
- ✅ Database connection pooling
- ✅ Error handling

### Frontend Optimizations (Already Done)

- ✅ Responsive design
- ✅ Mobile-first CSS
- ✅ Fast page loads
- ✅ PWA manifest
- ✅ Lazy loading

---

## 🔮 Future Enhancements

Consider these upgrades:

1. **Custom Domain**: Buy domain (e.g., `krishimithra.com`)
2. **SSL Certificate**: Auto-included with Vercel/Render
3. **CDN**: Use Cloudflare for faster global access
4. **Analytics**: Add Google Analytics
5. **Monitoring**: Use Sentry for error tracking
6. **Caching**: Implement Redis for faster API responses

---

## 📞 Support

If you encounter issues:

1. Check deployment logs (Render/Vercel dashboard)
2. Review browser console errors
3. Test API endpoints with Postman
4. Verify all environment variables

---

## 🎉 You're Live!

Congratulations! Your KRISHI MITHRA platform is now accessible worldwide. Farmers can:

- Register and create accounts
- View real-time market prices
- Get weather forecasts
- Access government subsidies
- Receive notifications
- Use the app on mobile devices

**Share your app with Karnataka farmers and make agriculture smarter! 🌾**

---

## Quick Reference: Deployment URLs

Update these in your documentation:

```
Backend API: https://krishi-mithra-backend.onrender.com
Frontend: https://krishi-mithra.vercel.app
GitHub Repo: https://github.com/YOUR_USERNAME/krishi-mithra
```

**Last Updated**: January 7, 2026
