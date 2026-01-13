# 🎯 Vercel Deployment - Step by Step Commands

This file contains the exact commands to run in order.

---

## 📍 Step 1: Prepare Git Repository

### Check Git Status
```bash
git status
```

### Initialize Git (if needed)
```bash
git init
```

### Add All Files
```bash
git add .
```

### Commit
```bash
git commit -m "Ready for Vercel deployment"
```

**✅ Expected output:** Files committed successfully

---

## 📍 Step 2: Connect to GitHub

### Option A: If you DON'T have a GitHub repo yet

1. **Create repository on GitHub:**
   - Go to: https://github.com/new
   - Repository name: `krushi-mithra`
   - Keep it Private or Public
   - Don't initialize with README
   - Click "Create repository"

2. **Connect local repo to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/krushi-mithra.git
   git branch -M main
   git push -u origin main
   ```

3. **Enter credentials when prompted**

### Option B: If you ALREADY have a GitHub repo

```bash
git push origin main
```

**✅ Expected output:** Code pushed to GitHub

---

## 📍 Step 3: Deploy to Vercel (Dashboard Method)

### 3.1 Sign Up / Sign In
1. Go to: https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel

### 3.2 Import Project
1. Click "Add New" → "Project"
2. Click "Import Git Repository"
3. Find "krushi-mithra" repository
4. Click "Import"

### 3.3 Configure Project
**Keep these settings:**
- Framework Preset: `Other`
- Root Directory: `./`
- Build Command: (leave empty)
- Output Directory: (leave empty)
- Install Command: `npm install`

**Click "Deploy"** (DON'T add environment variables yet)

### 3.4 Wait for Initial Deployment
- This will fail or show warnings
- That's OK! We'll add environment variables next
- Note your project URL (e.g., `krushi-mithra-abc123.vercel.app`)

---

## 📍 Step 4: Add Environment Variables

1. **Go to Project Settings:**
   - Click your project name
   - Click "Settings" tab
   - Click "Environment Variables"

2. **Add Each Variable:**

For each variable below:
- Click "Add New"
- Paste Name (left field)
- Paste Value (right field)
- Check: ✅ Production, ✅ Preview, ✅ Development
- Click "Save"

### Copy These Exactly:

**Variable 1:**
```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_RZpaxCSsoD15@ep-super-breeze-a1bnvnew-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

**Variable 2:**
```
Name: NODE_ENV
Value: production
```

**Variable 3:**
```
Name: JWT_SECRET
Value: krushi_mithra_secret_key_2025_secure_token
```

**Variable 4:**
```
Name: OPENWEATHER_API_KEY
Value: 2dc416bde8a045c05a52551eebc4d477
```

**Variable 5:**
```
Name: WEATHER_API_KEY
Value: 2dc416bde8a045c05a52551eebc4d477
```

**Variable 6:**
```
Name: ADMIN_EMAIL
Value: admin@krushimithra.com
```

**Variable 7:**
```
Name: ADMIN_PASSWORD
Value: Admin@12345
```

**Variable 8:**
```
Name: EMAIL_USER
Value: krishimithra2026@gmail.com
```

**Variable 9:**
```
Name: EMAIL_APP_PASSWORD
Value: umbhpecgsispzpmw
```

**Variable 10:**
```
Name: EMAIL_PASSWORD
Value: umbhpecgsispzpmw
```

**Variable 11:**
```
Name: SUPPORT_EMAIL
Value: support@krushimithra.com
```

**✅ Total: 11 environment variables added**

---

## 📍 Step 5: Redeploy with Environment Variables

1. Go to "Deployments" tab
2. Click "..." (three dots) on the latest deployment
3. Click "Redeploy"
4. Confirm "Redeploy"
5. Wait 2-3 minutes

**✅ Expected:** Deployment successful with green checkmark

---

## 📍 Step 6: Test Your Deployment

### 6.1 Get Your URL
Your app is now at: `https://your-project-name.vercel.app`

### 6.2 Test Health Endpoint
Open in browser:
```
https://your-project-name.vercel.app/api/health
```

**✅ Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T...",
  "environment": "production",
  "database": "connected"
}
```

### 6.3 Test Homepage
```
https://your-project-name.vercel.app/
```

**✅ Expected:** Homepage loads with Krushi Mithra branding

### 6.4 Test Admin Login
```
https://your-project-name.vercel.app/frontend/html/admin-login.html
```

**✅ Try logging in:**
- Email: `admin@krushimithra.com`
- Password: `Admin@12345`

### 6.5 Test Farmer Registration
```
https://your-project-name.vercel.app/frontend/html/register.html
```

**✅ Try registering a test farmer**

---

## 📍 Step 7: Share Your Application

### Your Live URLs:

**Replace `your-project-name` with your actual Vercel project name**

```
🏠 Homepage:
https://your-project-name.vercel.app/

👨‍🌾 Farmer Registration:
https://your-project-name.vercel.app/frontend/html/register.html

👨‍🌾 Farmer Login:
https://your-project-name.vercel.app/frontend/html/farmer-login.html

👨‍💼 Admin Login:
https://your-project-name.vercel.app/frontend/html/admin-login.html

🔌 API Health:
https://your-project-name.vercel.app/api/health
```

---

## 🔄 Future Updates

### When you make changes to your code:

```bash
# 1. Commit changes
git add .
git commit -m "Description of changes"

# 2. Push to GitHub
git push origin main

# 3. Vercel automatically redeploys!
```

**✅ That's it! Automatic deployment enabled**

---

## 🆘 Troubleshooting Commands

### View Deployment Logs
```bash
# Install Vercel CLI (one time)
npm install -g vercel

# Login
vercel login

# View logs
vercel logs --follow
```

### Check Deployment Status
```bash
vercel ls
```

### Force Redeploy
```bash
vercel --prod --force
```

### Check Environment Variables
```bash
vercel env ls
```

---

## ✅ Deployment Checklist

After completing all steps:

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] 11 environment variables added
- [ ] Redeployed with env vars
- [ ] Health endpoint returns OK
- [ ] Homepage loads
- [ ] Admin can login
- [ ] Farmer can register
- [ ] Database connected
- [ ] All URLs working

---

## 🎉 Congratulations!

Your Krushi Mithra application is now:
✅ Live on Vercel
✅ Connected to Neon database
✅ Accessible from anywhere
✅ Automatically deploys on git push
✅ Production ready

**Next Steps:**
1. Test all features thoroughly
2. Share URLs with farmers
3. Monitor via Vercel dashboard
4. Configure custom domain (optional)

---

## 📞 Need Help?

**Vercel Dashboard:**
https://vercel.com/dashboard

**View Logs:**
Dashboard → Your Project → Deployments → View Function Logs

**Redeploy:**
Dashboard → Deployments → ... → Redeploy

**Environment Variables:**
Dashboard → Settings → Environment Variables

---

**Deployment Date:** January 13, 2026
**Platform:** Vercel + Neon PostgreSQL
**Status:** ✅ Ready for Production
