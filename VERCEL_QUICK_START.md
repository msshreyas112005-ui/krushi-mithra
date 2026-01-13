# 🚀 VERCEL DEPLOYMENT - QUICK START

## ⚡ 3-Minute Deploy

### 1️⃣ Push to GitHub (1 min)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/krushi-mithra.git
git branch -M main
git push -u origin main
```

### 2️⃣ Import to Vercel (1 min)
1. Visit: https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repo → Click "Import"
4. Keep all defaults → Click "Deploy"

### 3️⃣ Add Environment Variables (1 min)
Go to: Settings → Environment Variables

**Copy-paste these (all on Production + Preview + Development):**

```
DATABASE_URL=postgresql://neondb_owner:npg_RZpaxCSsoD15@ep-super-breeze-a1bnvnew-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
NODE_ENV=production
JWT_SECRET=krushi_mithra_secret_key_2025_secure_token
OPENWEATHER_API_KEY=2dc416bde8a045c05a52551eebc4d477
WEATHER_API_KEY=2dc416bde8a045c05a52551eebc4d477
ADMIN_EMAIL=admin@krushimithra.com
ADMIN_PASSWORD=Admin@12345
EMAIL_USER=krishimithra2026@gmail.com
EMAIL_APP_PASSWORD=umbhpecgsispzpmw
EMAIL_PASSWORD=umbhpecgsispzpmw
SUPPORT_EMAIL=support@krushimithra.com
```

Then: Deployments → Redeploy

---

## ✅ Test Your Deployment

**Health Check:**
`https://your-project.vercel.app/api/health`

**Login:**
- Admin: https://your-project.vercel.app/frontend/html/admin-login.html
  - Email: admin@krushimithra.com
  - Password: Admin@12345

- Farmer: https://your-project.vercel.app/frontend/html/register.html
  - Register new account

---

## 🛠️ Quick Commands

```bash
# Redeploy
vercel --prod

# View logs
vercel logs --follow

# Check status
vercel ls
```

---

## 📱 Share With Users

**Homepage:**
`https://your-project.vercel.app`

**Farmer Registration:**
`https://your-project.vercel.app/frontend/html/register.html`

---

## 🆘 Quick Fixes

**Database error?**
→ Check DATABASE_URL in Vercel env vars

**API not working?**
→ Check function logs: Dashboard → Deployments → Logs

**Need to redeploy?**
→ Deployments → ... → Redeploy

---

## 📖 Full Documentation

- Complete Guide: `VERCEL_DEPLOYMENT_GUIDE.md`
- Checklist: `VERCEL_DEPLOYMENT_CHECKLIST.md`
- Env Template: `vercel-env-template.txt`

---

**🎉 Done! Your app is live on Vercel + Neon!**
