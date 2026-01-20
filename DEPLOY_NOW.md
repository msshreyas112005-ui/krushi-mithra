# 🚀 DEPLOY TO VERCEL - ONE PAGE GUIDE

## Prerequisites (5 minutes)
1. Create GitHub account: https://github.com/join
2. Create Vercel account: https://vercel.com/signup (use GitHub)
3. Have Git installed on your computer

---

## Step 1: Push to GitHub (3 minutes)

```bash
# Initialize Git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - KRISHI MITHRA"

# Create repo on GitHub.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/krishi-mithra.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel (2 minutes)

1. Visit: https://vercel.com/new
2. Click "Import Git Repository"
3. Select "krishi-mithra"
4. Click "Import"
5. Keep all settings default
6. Click "Deploy" (will take 2-3 min)

---

## Step 3: Add Environment Variables (5 minutes)

1. Go to: Settings → Environment Variables
2. Add these 11 variables (one by one):

For EACH variable below:
- Click "Add New"
- Copy Name → paste in left field
- Copy Value → paste in right field
- Check all three: Production, Preview, Development
- Click "Save"

```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_RZpaxCSsoD15@ep-super-breeze-a1bnvnew-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

Name: NODE_ENV
Value: production

Name: JWT_SECRET
Value: KRISHI_MITHRA_secret_key_2025_secure_token

Name: OPENWEATHER_API_KEY
Value: 2dc416bde8a045c05a52551eebc4d477

Name: WEATHER_API_KEY
Value: 2dc416bde8a045c05a52551eebc4d477

Name: ADMIN_EMAIL
Value: admin@krishimithra.com

Name: ADMIN_PASSWORD
Value: Admin@12345

Name: EMAIL_USER
Value: krishimithra2026@gmail.com

Name: EMAIL_APP_PASSWORD
Value: umbhpecgsispzpmw

Name: EMAIL_PASSWORD
Value: umbhpecgsispzpmw

Name: SUPPORT_EMAIL
Value: support@krishimithra.com
```

---

## Step 4: Redeploy (1 minute)

1. Go to: Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait 2-3 minutes

---

## Step 5: Test (2 minutes)

Your app is at: `https://your-project-name.vercel.app`

Test these URLs:

1. Health: `https://your-project-name.vercel.app/api/health`
   ✅ Should show: `{"status":"ok"}`

2. Homepage: `https://your-project-name.vercel.app/`
   ✅ Should load homepage

3. Admin: `https://your-project-name.vercel.app/frontend/html/admin-login.html`
   ✅ Login with: admin@krishimithra.com / Admin@12345

4. Farmer: `https://your-project-name.vercel.app/frontend/html/register.html`
   ✅ Try registering

---

## 🎉 Done! Your app is live!

**Your URLs:**
- Main: `https://your-project-name.vercel.app`
- Admin: `https://your-project-name.vercel.app/frontend/html/admin-login.html`
- Farmer: `https://your-project-name.vercel.app/frontend/html/register.html`

---

## 🔄 Future Updates

Just push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```
Vercel auto-deploys! 🚀

---

## 🆘 Problems?

**Database error?**
→ Check DATABASE_URL in Vercel environment variables

**API not working?**
→ Vercel Dashboard → Deployments → View Function Logs

**Need detailed help?**
→ Open `VERCEL_STEP_BY_STEP.md` in your project

---

**Total Time: ~15 minutes**
**Cost: $0 (Free tier)**
**Status: ✅ Production Ready**
