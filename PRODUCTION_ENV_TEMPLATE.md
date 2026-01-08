# Production Environment Variables Template
# Copy this to your deployment platform's environment variables section

# ==============================================
# SERVER CONFIGURATION
# ==============================================
NODE_ENV=production
PORT=10000

# ==============================================
# DATABASE (Neon PostgreSQL)
# ==============================================
# Your Neon database connection string
# Format: postgresql://username:password@host/database?sslmode=require
DATABASE_URL=postgresql://neondb_owner:npg_RZpaxCSsoD15@ep-super-breeze-a1bnvnew-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# ==============================================
# JWT AUTHENTICATION
# ==============================================
# Generate a secure random string for production
# PowerShell: -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
JWT_SECRET=krushi_mithra_secret_key_2025_secure_token

# ==============================================
# APPLICATION URLS
# ==============================================
# Update these after deployment
# Backend URL (e.g., https://krushi-mithra-backend.onrender.com)
BASE_URL=https://your-backend-url.onrender.com

# Frontend URL (e.g., https://krushi-mithra.vercel.app)
FRONTEND_URL=https://your-frontend-url.vercel.app

# ==============================================
# WEATHER API (OpenWeatherMap)
# ==============================================
# Get free API key from: https://openweathermap.org/api
OPENWEATHER_API_KEY=2dc416bde8a045c05a52551eebc4d477
WEATHER_API_KEY=2dc416bde8a045c05a52551eebc4d477

# ==============================================
# EMAIL CONFIGURATION (Gmail)
# ==============================================
# IMPORTANT: Use Gmail App Password, NOT your regular password
# Steps to get App Password:
# 1. Enable 2FA on Gmail
# 2. Go to: https://myaccount.google.com/apppasswords
# 3. Generate password for "Mail"
# 4. Use that password here

EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
EMAIL_FROM=KRUSHI MITHRA <your.email@gmail.com>
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# ==============================================
# ADMIN CREDENTIALS
# ==============================================
# Default admin account (auto-created on first startup)
ADMIN_EMAIL=admin@krushimithra.com
ADMIN_PASSWORD=Admin@12345

# ==============================================
# DEPLOYMENT PLATFORM NOTES
# ==============================================

# RENDER:
# - Add these variables in: Dashboard → Service → Environment
# - PORT is automatically set by Render (use 10000 as fallback)
# - Auto-redeploys when you save changes

# VERCEL:
# - Frontend doesn't need environment variables
# - Uses frontend/js/config.js for API URL

# RAILWAY:
# - Add these in: Dashboard → Variables
# - Similar to Render setup

# ==============================================
# SECURITY CHECKLIST
# ==============================================
# ✅ Never commit .env file to Git
# ✅ Use strong JWT_SECRET (64+ random characters)
# ✅ Use Gmail App Password, not regular password
# ✅ Enable 2FA on Gmail
# ✅ Keep DATABASE_URL private
# ✅ Regularly rotate credentials
# ✅ Monitor deployment logs for issues

# ==============================================
# TESTING AFTER DEPLOYMENT
# ==============================================
# 1. Test health endpoint: https://your-backend.com/api/health
# 2. Test market prices: https://your-backend.com/api/market-prices
# 3. Test frontend loads: https://your-frontend.com
# 4. Test farmer registration
# 5. Test email notifications
# 6. Test admin login
# 7. Test on mobile device

# ==============================================
# SUPPORT
# ==============================================
# If you have issues:
# 1. Check deployment logs
# 2. Verify all environment variables are set
# 3. Test API endpoints with cURL
# 4. Check browser console for frontend errors
# 5. Review DEPLOYMENT_GUIDE.md for troubleshooting
