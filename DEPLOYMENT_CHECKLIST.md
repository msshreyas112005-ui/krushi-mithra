# ⚡ KRISHI MITHRA - Quick Deployment Checklist

Use this checklist to deploy KRISHI MITHRA in 30 minutes.

## 📋 Pre-Deployment (5 minutes)

- [ ] Create GitHub account (if needed)
- [ ] Create Render account:  (sign up with GitHub)
- [ ] Create Vercel account: https://vercel.com (sign up with GitHub)
- [ ] Have your Gmail App Password ready (from .env file)

---

## 🔧 Step 1: Push to GitHub (5 minutes)

```powershell
# In project root
cd C:\Users\mahal\OneDrive\Desktop\KRISHI_MITHRA

git init
git add .
git commit -m "Production deployment ready"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/krishi-mithra.git
git push -u origin main
```

**Checkpoint**: Verify your code is on GitHub

---

## 🚀 Step 2: Deploy Backend to Render (10 minutes)

1. **Create Web Service**
   - Go to https://render.com/dashboard
   - Click "New +" → "Web Service"
   - Connect your `krishi-mithra` repository

2. **Configure Service**
   - Name: `krishi-mithra-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**

3. **Add Environment Variables** (click "Advanced")

   Copy-paste these (update EMAIL values):

   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=postgresql://neondb_owner:npg_RZpaxCSsoD15@ep-super-breeze-a1bnvnew-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=KRISHI_MITHRA_secret_key_2025_secure_token
   OPENWEATHER_API_KEY=2dc416bde8a045c05a52551eebc4d477
   WEATHER_API_KEY=2dc416bde8a045c05a52551eebc4d477
   ADMIN_EMAIL=admin@krishimithra.com
   ADMIN_PASSWORD=Admin@12345
   EMAIL_USER=YOUR_EMAIL@gmail.com
   EMAIL_PASSWORD=YOUR_GMAIL_APP_PASSWORD
   BASE_URL=https://krishi-mithra-backend.onrender.com
   FRONTEND_URL=https://krishi-mithra.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait 3-5 minutes
   - Copy your backend URL

5. **Test Backend**
   - Visit: `https://YOUR-BACKEND-URL.onrender.com/api/health`
   - Should see: `{"status":"ok",...}`

**Checkpoint**: Backend is live and responding

---

## 🌐 Step 3: Update Frontend Config (2 minutes)

1. **Update config.js**
   
   Open: `frontend/js/config.js`
   
   Line 19: Update with your actual backend URL:
   ```javascript
   PRODUCTION_API_URL: 'https://YOUR-BACKEND-URL.onrender.com',
   ```

2. **Commit and Push**
   ```powershell
   git add frontend/js/config.js
   git commit -m "Update production API URL"
   git push
   ```

**Checkpoint**: Config updated with real backend URL

---

## 🎨 Step 4: Deploy Frontend to Vercel (5 minutes)

1. **Import Project**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import your `krishi-mithra` repository

2. **Configure**
   - Framework: **Other**
   - Root Directory: Leave empty
   - Build Command: Leave empty
   - Output Directory: `frontend`

3. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes
   - Copy your frontend URL

**Checkpoint**: Frontend is live

---

## 🔗 Step 5: Connect Frontend ↔ Backend (3 minutes)

1. **Update Backend Environment**
   
   Go to Render dashboard → Your service → Environment
   
   Update this variable:
   ```
   FRONTEND_URL=https://YOUR-FRONTEND-URL.vercel.app
   ```
   
   Click "Save Changes"

2. **Wait for Redeploy**
   - Render auto-redeploys (1-2 minutes)

**Checkpoint**: Frontend and backend connected

---

## ✅ Step 6: Test Everything (5 minutes)

### Test 1: Homepage
- [ ] Visit your Vercel URL
- [ ] Homepage loads correctly
- [ ] Language switcher works

### Test 2: Farmer Registration
- [ ] Go to `/html/register.html`
- [ ] Fill form with test data
- [ ] Submit successfully
- [ ] Check for welcome email

### Test 3: Farmer Login
- [ ] Login with registered account
- [ ] Dashboard loads
- [ ] Weather shows
- [ ] Market prices show
- [ ] Subsidies show

### Test 4: Admin Login
- [ ] Go to `/html/admin-login.html`
- [ ] Login with admin credentials
- [ ] Admin dashboard loads
- [ ] Can view farmers list

### Test 5: Mobile
- [ ] Open on phone
- [ ] Responsive design works
- [ ] Forms work
- [ ] Navigation works

---

## 🎉 You're Live!

Your URLs:
```
Frontend: https://YOUR-APP.vercel.app
Backend: https://YOUR-APP.onrender.com
Admin: https://YOUR-APP.vercel.app/html/admin-login.html
```

---

## 📱 Share With Users

**For Farmers:**
"Visit https://YOUR-APP.vercel.app and register to access:
- Real-time market prices
- Weather forecasts
- Government subsidies
- Available in Kannada, Hindi, and English"

**For Admin:**
"Admin portal: https://YOUR-APP.vercel.app/html/admin-login.html"

---

## 🔧 If Something Breaks

### Frontend not loading?
- Check Vercel deployment logs
- Verify `frontend` directory exists

### Backend not responding?
- Check Render logs
- Verify environment variables
- Test `/api/health` endpoint

### Can't connect frontend to backend?
- Check CORS settings
- Verify URLs in config.js
- Check browser console for errors

### Database errors?
- Verify DATABASE_URL in Render
- Check Neon database is active

---

## 🚀 Auto-Deployment

Every time you push to GitHub:
1. Render rebuilds backend (3-5 min)
2. Vercel rebuilds frontend (1-2 min)
3. Changes go live automatically

```powershell
# Make changes, then:
git add .
git commit -m "Your changes"
git push
# Wait 5 minutes, changes are live!
```

---

## 📊 Monitor Your App

**Render (Backend)**
- Dashboard → Your Service → Logs
- View real-time server activity

**Vercel (Frontend)**
- Dashboard → Your Project → Analytics
- View page views and performance

---

## ⚠️ Important Notes

1. **Free Tier Limits**
   - Render: Sleeps after 15 min inactivity (30s cold start)
   - Vercel: 100GB bandwidth/month

2. **Keep Secrets Safe**
   - Never commit `.env` to GitHub
   - Use Render/Vercel environment variables

3. **Database**
   - Neon PostgreSQL (already configured)
   - Free tier: 0.5GB storage

---

**Total Deployment Time: ~30 minutes**

**Ready for production? ✅**

See `DEPLOYMENT_GUIDE.md` for detailed instructions.
