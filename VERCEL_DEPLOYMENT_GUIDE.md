# 🚀 Vercel Deployment Guide - KRISHI MITHRA

Complete guide to deploy your KRISHI MITHRA application to Vercel with Neon PostgreSQL database.

## 📋 Prerequisites

✅ Vercel account (free): https://vercel.com/signup
✅ Neon database already set up
✅ GitHub/GitLab/Bitbucket account (recommended)
✅ OpenWeatherMap API key

---

## 🎯 Step 1: Prepare Your Project

### 1.1 Create .gitignore (if not exists)

Create a `.gitignore` file in your project root:

```
node_modules/
.env
.env.local
backend/.env
backend/node_modules/
*.log
.DS_Store
```

### 1.2 Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit - KRISHI MITHRA"
```

### 1.3 Push to GitHub

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/krishi-mithra.git
git branch -M main
git push -u origin main
```

---

## 🚀 Step 2: Deploy to Vercel

### Method 1: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click "Add New" → "Project"

2. **Import Your Repository**
   - Select "Import Git Repository"
   - Choose your GitHub repository
   - Click "Import"

3. **Configure Project Settings**
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: (leave empty)
   Output Directory: (leave empty)
   Install Command: npm install
   ```

4. **Add Environment Variables**
   Click "Environment Variables" and add ALL these variables:

   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_RZpaxCSsoD15@ep-super-breeze-a1bnvnew-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   
   NODE_ENV=production
   
   JWT_SECRET=KRISHI_MITHRA_secret_key_2025_secure_token
   
   OPENWEATHER_API_KEY=2dc416bde8a045c05a52551eebc4d477
   WEATHER_API_KEY=2dc416bde8a045c05a52551eebc4d477
   
   ADMIN_EMAIL=admin@krishimithra.com
   ADMIN_PASSWORD=Admin@12345
   
   EMAIL_USER=krishimithra2026@gmail.com
   EMAIL_APP_PASSWORD=umbhpecgsispzpmw
   EMAIL_PASSWORD=umbhpecgsispzpmw
   
   SUPPORT_EMAIL=support@krishimithra.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for deployment
   - You'll get a URL like: `https://your-project.vercel.app`

### Method 2: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? Yes
   - Which scope? (Select your account)
   - Link to existing project? No
   - What's your project's name? krishi-mithra
   - In which directory is your code located? ./
   - Want to override settings? No

4. **Add Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   # Enter your Neon database URL when prompted
   
   vercel env add NODE_ENV
   # Enter: production
   
   vercel env add JWT_SECRET
   # Enter: KRISHI_MITHRA_secret_key_2025_secure_token
   
   vercel env add OPENWEATHER_API_KEY
   # Enter your API key
   
   # Continue for all environment variables...
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## 🌐 Step 3: Update BASE_URL

After deployment, you'll get a URL like: `https://krishi-mithra.vercel.app`

### Update Environment Variable

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add or update:
   ```
   BASE_URL=https://your-project.vercel.app
   FRONTEND_URL=https://your-project.vercel.app
   ```

3. Redeploy:
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## ✅ Step 4: Verify Deployment

### 4.1 Check Health Endpoint

Visit: `https://your-project.vercel.app/api/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T...",
  "environment": "production",
  "database": "connected"
}
```

### 4.2 Test Frontend

1. **Homepage**: `https://your-project.vercel.app/`
2. **Farmer Registration**: `https://your-project.vercel.app/frontend/html/register.html`
3. **Farmer Login**: `https://your-project.vercel.app/frontend/html/farmer-login.html`
4. **Admin Login**: `https://your-project.vercel.app/frontend/html/admin-login.html`

### 4.3 Test Backend APIs

```bash
# Test registration
curl -X POST https://your-project.vercel.app/api/farmers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Farmer",
    "email": "test@example.com",
    "password": "Test@123",
    "phone": "1234567890",
    "language": "en"
  }'

# Test login
curl -X POST https://your-project.vercel.app/api/farmers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

---

## 🔧 Step 5: Configure Custom Domain (Optional)

1. **Go to Vercel Dashboard**
   - Your Project → Settings → Domains

2. **Add Domain**
   - Enter your domain: `krishimithra.com`
   - Click "Add"

3. **Configure DNS**
   - Add these records to your domain registrar:
   ```
   Type: A
   Name: @
   Value: 76.76.19.19
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Update Environment Variables**
   ```
   BASE_URL=https://krishimithra.com
   FRONTEND_URL=https://krishimithra.com
   ```

---

## 📊 Step 6: Monitor Your Application

### Vercel Dashboard Features

1. **Analytics**
   - Visit: Project → Analytics
   - Monitor page views, performance

2. **Logs**
   - Visit: Project → Deployments → View Function Logs
   - Check for errors

3. **Performance**
   - Visit: Project → Speed Insights
   - Monitor loading times

### Database Monitoring

1. **Neon Dashboard**
   - Visit: https://console.neon.tech
   - Monitor queries, connections

---

## 🔄 Continuous Deployment

### Automatic Deployments

Every time you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Build your application
3. Deploy to production
4. Send you a notification

### Manual Deployments

Using Vercel CLI:
```bash
vercel --prod
```

Using Dashboard:
- Go to Deployments → Redeploy

---

## 🐛 Troubleshooting

### Issue 1: "Database connection failed"

**Solution:**
1. Verify `DATABASE_URL` in Vercel environment variables
2. Check Neon database is active
3. Check connection string format:
   ```
   postgresql://user:password@host/database?sslmode=require
   ```

### Issue 2: "Module not found"

**Solution:**
1. Check `package.json` has all dependencies
2. Redeploy:
   ```bash
   vercel --prod --force
   ```

### Issue 3: "API routes not working"

**Solution:**
1. Verify `vercel.json` configuration
2. Check API endpoints use `/api/` prefix
3. View function logs in Vercel dashboard

### Issue 4: "Frontend not loading"

**Solution:**
1. Check file paths are correct
2. Verify static files are in `frontend/` directory
3. Check browser console for errors

### Issue 5: "CORS errors"

**Solution:**
- Already configured in `vercel.json`
- If still having issues, check `backend/middleware/security.middleware.js`

---

## 📱 Testing on Mobile

1. **Get your Vercel URL**
   ```
   https://your-project.vercel.app
   ```

2. **Open on mobile browser**
   - Works on any device with internet
   - No need for local network configuration

3. **Share with users**
   - Send the URL to farmers
   - They can register and use immediately

---

## 🎉 Your Application URLs

After deployment, your app will be available at:

```
🌐 Homepage:
https://your-project.vercel.app/

👨‍🌾 Farmer Portal:
https://your-project.vercel.app/frontend/html/register.html
https://your-project.vercel.app/frontend/html/farmer-login.html

👨‍💼 Admin Portal:
https://your-project.vercel.app/frontend/html/admin-login.html

🔌 API Base:
https://your-project.vercel.app/api/

💓 Health Check:
https://your-project.vercel.app/api/health
```

---

## 📊 Performance Optimization

### Recommended Settings

1. **Edge Functions** (already configured in vercel.json)
   - Fast API responses
   - Global CDN distribution

2. **Caching**
   - Static files cached automatically
   - API responses use appropriate headers

3. **Compression**
   - Gzip/Brotli enabled by default

### Monitor Performance

```bash
# Test API response time
curl -w "@-" -o /dev/null -s https://your-project.vercel.app/api/health <<'EOF'
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
EOF
```

---

## 🔐 Security Checklist

✅ Environment variables set in Vercel (not in code)
✅ `.env` file in `.gitignore`
✅ HTTPS enabled (automatic with Vercel)
✅ CORS configured properly
✅ Rate limiting active
✅ SQL injection prevention enabled
✅ XSS protection enabled
✅ Database uses SSL connection

---

## 🚀 Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Check environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME

# Remove deployment
vercel remove deployment-url

# Open project in browser
vercel open
```

---

## 📞 Support

### Vercel Support
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Status: https://www.vercel-status.com/

### Neon Support
- Docs: https://neon.tech/docs
- Discord: https://discord.gg/92vNTzKDGp
- Status: https://neonstatus.com/

---

## 🎊 Congratulations!

Your KRISHI MITHRA application is now live on Vercel! 🎉

**Next Steps:**
1. Test all features thoroughly
2. Share URL with farmers
3. Monitor logs and analytics
4. Set up custom domain (optional)
5. Configure email notifications

---

## 📝 Post-Deployment Checklist

- [ ] Health endpoint responds correctly
- [ ] Farmer registration works
- [ ] Farmer login works
- [ ] Admin login works
- [ ] Crop management functional
- [ ] Market prices loading
- [ ] Weather data displaying
- [ ] Notifications working
- [ ] Mobile responsive
- [ ] All languages working
- [ ] Database queries successful
- [ ] Email notifications sending

---

**Deployment Date:** January 13, 2026
**Platform:** Vercel
**Database:** Neon PostgreSQL
**Status:** ✅ Production Ready
