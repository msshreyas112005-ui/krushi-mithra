# ✅ Vercel Deployment Checklist

Use this checklist to ensure successful deployment of KRISHI MITHRA to Vercel.

---

## 📋 Pre-Deployment Checklist

### 1. Project Files
- [x] `vercel.json` configured
- [x] `.vercelignore` created
- [x] `.gitignore` present
- [x] `package.json` with correct scripts
- [x] `backend/package.json` with all dependencies

### 2. Environment Setup
- [ ] Neon database is active and accessible
- [ ] OpenWeatherMap API key is valid
- [ ] Gmail app password configured
- [ ] All credentials noted down

### 3. Git Repository
- [ ] Git initialized (`git init`)
- [ ] All files added (`git add .`)
- [ ] Initial commit created
- [ ] GitHub repository created
- [ ] Repository pushed to GitHub

---

## 🚀 Deployment Steps

### Step 1: Create GitHub Repository
```bash
# 1. Create repo on GitHub.com
# 2. In your project folder:
git init
git add .
git commit -m "Initial commit - KRISHI MITHRA"
git remote add origin https://github.com/YOUR_USERNAME/krishi-mithra.git
git branch -M main
git push -u origin main
```
- [ ] Repository created on GitHub
- [ ] Code pushed successfully

### Step 2: Connect to Vercel
- [ ] Visit https://vercel.com/new
- [ ] Sign in with GitHub
- [ ] Click "Import Project"
- [ ] Select your repository
- [ ] Click "Import"

### Step 3: Configure Project
- [ ] Framework Preset: **Other**
- [ ] Root Directory: `./`
- [ ] Build Command: (leave empty)
- [ ] Output Directory: (leave empty)
- [ ] Install Command: `npm install`

### Step 4: Add Environment Variables

Go to: **Settings → Environment Variables**

Copy each variable from `vercel-env-template.txt`:

#### Database (CRITICAL)
- [ ] `DATABASE_URL` = `postgresql://neondb_owner:npg_RZpaxCSsoD15@ep-super-breeze-a1bnvnew-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

#### Application
- [ ] `NODE_ENV` = `production`
- [ ] `JWT_SECRET` = `KRISHI_MITHRA_secret_key_2025_secure_token`

#### Weather API
- [ ] `OPENWEATHER_API_KEY` = `2dc416bde8a045c05a52551eebc4d477`
- [ ] `WEATHER_API_KEY` = `2dc416bde8a045c05a52551eebc4d477`

#### Admin
- [ ] `ADMIN_EMAIL` = `admin@krishimithra.com`
- [ ] `ADMIN_PASSWORD` = `Admin@12345`

#### Email
- [ ] `EMAIL_USER` = `krishimithra2026@gmail.com`
- [ ] `EMAIL_APP_PASSWORD` = `umbhpecgsispzpmw`
- [ ] `EMAIL_PASSWORD` = `umbhpecgsispzpmw`
- [ ] `SUPPORT_EMAIL` = `support@krishimithra.com`

**For each variable:**
- Select: Production, Preview, Development (all three)
- Click "Save"

### Step 5: Deploy
- [ ] Click "Deploy"
- [ ] Wait for deployment (2-3 minutes)
- [ ] Note your deployment URL

---

## ✅ Post-Deployment Verification

### Test URLs

Replace `your-project.vercel.app` with your actual Vercel URL:

#### 1. Health Check
- [ ] Visit: `https://your-project.vercel.app/api/health`
- [ ] Expected: `{"status":"ok","database":"connected"}`

#### 2. Frontend Pages
- [ ] Homepage: `https://your-project.vercel.app/`
- [ ] Farmer Registration: `https://your-project.vercel.app/frontend/html/register.html`
- [ ] Farmer Login: `https://your-project.vercel.app/frontend/html/farmer-login.html`
- [ ] Admin Login: `https://your-project.vercel.app/frontend/html/admin-login.html`

#### 3. Test Registration
- [ ] Go to registration page
- [ ] Fill in test farmer details
- [ ] Submit form
- [ ] Check for success message
- [ ] Verify in Neon database

#### 4. Test Login
- [ ] Use registered farmer credentials
- [ ] Login successfully
- [ ] Dashboard loads correctly
- [ ] All menu items work

#### 5. Test Admin
- [ ] Login with admin credentials
- [ ] Admin@12345 (password)
- [ ] admin@krishimithra.com (email)
- [ ] Dashboard loads
- [ ] Can view farmers

#### 6. Test Features
- [ ] Weather data displays
- [ ] Market prices load
- [ ] Crop management works
- [ ] Language switching works
- [ ] Notifications can be sent

---

## 🔧 Troubleshooting Checklist

### If deployment fails:

#### Check Build Logs
- [ ] Go to Vercel Dashboard → Deployments
- [ ] Click on failed deployment
- [ ] Read error messages
- [ ] Look for missing dependencies

#### Common Issues:

**Database Connection Failed**
- [ ] Verify `DATABASE_URL` is correct
- [ ] Check Neon database is active
- [ ] Verify SSL mode is included: `?sslmode=require`

**Module Not Found**
- [ ] Check all dependencies in `backend/package.json`
- [ ] Redeploy with: `vercel --prod --force`

**API Routes Not Working**
- [ ] Verify `vercel.json` configuration
- [ ] Check function logs in Vercel dashboard
- [ ] Verify API paths start with `/api/`

**Frontend Not Loading**
- [ ] Check file paths are correct
- [ ] Verify static files in `frontend/` directory
- [ ] Check browser console for errors

**Environment Variables Not Working**
- [ ] Verify all variables are added
- [ ] Check variable names match exactly
- [ ] Redeploy after adding variables

---

## 📱 Mobile Testing Checklist

- [ ] Open site on mobile browser
- [ ] Test responsive design
- [ ] Register as farmer
- [ ] Login works
- [ ] Dashboard is mobile-friendly
- [ ] All features accessible
- [ ] Touch interactions work

---

## 🔒 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] No credentials in source code
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Environment variables secure
- [ ] Database uses SSL connection
- [ ] CORS configured properly
- [ ] Rate limiting active

---

## 📊 Performance Checklist

- [ ] Health endpoint responds quickly (< 1s)
- [ ] Pages load fast (< 3s)
- [ ] API responses quick (< 2s)
- [ ] Images optimized
- [ ] No console errors

---

## 🎯 Production Readiness

### Before Going Live:

- [ ] All features tested thoroughly
- [ ] Admin can login and manage
- [ ] Farmers can register and login
- [ ] Weather data accurate
- [ ] Market prices updating
- [ ] Email notifications working
- [ ] Mobile experience verified
- [ ] Error handling tested
- [ ] Database backups configured (in Neon)
- [ ] Monitoring set up

### Documentation:

- [ ] Save Vercel deployment URL
- [ ] Document admin credentials (secure location)
- [ ] Note database connection details
- [ ] Save API keys (secure location)
- [ ] Create user guide for farmers

---

## 📞 Support Resources

### Vercel
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Status: https://www.vercel-status.com/

### Neon
- Console: https://console.neon.tech
- Docs: https://neon.tech/docs
- Status: https://neonstatus.com/

### Project Logs
- Vercel Function Logs: Dashboard → Deployments → Function Logs
- Real-time: `vercel logs --follow`

---

## 🎉 Deployment Complete!

Once all items are checked:

✅ Your application is live!
✅ Farmers can access from anywhere
✅ Data is secure in Neon database
✅ Everything is production-ready

**Your Live URLs:**
- Main Site: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api`
- Admin: `https://your-project.vercel.app/frontend/html/admin-login.html`

---

**Deployment Date:** _____________
**Vercel URL:** _____________
**Status:** _____________
**Notes:** _____________
