# 🚀 KRUSHI MITHRA - Deployment Quick Reference Card

**Print this or keep it handy during deployment!**

---

## 📍 Essential URLs

```
GitHub: https://github.com
Render (Backend): https://render.com/dashboard
Vercel (Frontend): https://vercel.com/dashboard
Neon (Database): https://console.neon.tech
OpenWeatherMap: https://openweathermap.org/api
```

---

## 🔑 Environment Variables (Copy-Paste)

**For Render Backend:**

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://neondb_owner:npg_RZpaxCSsoD15@ep-super-breeze-a1bnvnew-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=krushi_mithra_secret_key_2025_secure_token
OPENWEATHER_API_KEY=2dc416bde8a045c05a52551eebc4d477
WEATHER_API_KEY=2dc416bde8a045c05a52551eebc4d477
ADMIN_EMAIL=admin@krushimithra.com
ADMIN_PASSWORD=Admin@12345
EMAIL_USER=YOUR_EMAIL@gmail.com
EMAIL_PASSWORD=YOUR_GMAIL_APP_PASSWORD
BASE_URL=https://YOUR-BACKEND.onrender.com
FRONTEND_URL=https://YOUR-FRONTEND.vercel.app
```

**❗ Remember to update:**
- `EMAIL_USER` - Your Gmail
- `EMAIL_PASSWORD` - Your Gmail App Password
- `BASE_URL` - Your backend URL (after creation)
- `FRONTEND_URL` - Your frontend URL (after creation)

---

## 📋 Deployment Steps (30 min)

### ⏱️ 0-5 min: GitHub Setup
```powershell
cd C:\Users\mahal\OneDrive\Desktop\krushi_mithra
git init
git add .
git commit -m "Production ready"
git remote add origin https://github.com/YOUR_USERNAME/krushi-mithra.git
git push -u origin main
```

### ⏱️ 5-15 min: Backend (Render)
1. Go to render.com → New Web Service
2. Connect GitHub repo
3. Settings:
   - Name: `krushi-mithra-backend`
   - Root: `backend`
   - Build: `npm install`
   - Start: `npm start`
4. Add environment variables (see above)
5. Deploy → Wait 3-5 min
6. **Copy your backend URL!**

### ⏱️ 15-20 min: Update Config
```javascript
// Edit: frontend/js/config.js (line 19)
PRODUCTION_API_URL: 'https://YOUR-BACKEND.onrender.com',
```

```powershell
git add frontend/js/config.js
git commit -m "Update API URL"
git push
```

### ⏱️ 20-25 min: Frontend (Vercel)
1. Go to vercel.com → New Project
2. Import `krushi-mithra` repo
3. Settings:
   - Framework: Other
   - Output: `frontend`
4. Deploy → Wait 1-2 min
5. **Copy your frontend URL!**

### ⏱️ 25-28 min: Update Backend CORS
1. Render dashboard → Your service → Environment
2. Update `FRONTEND_URL` with actual Vercel URL
3. Save (auto-redeploys)

### ⏱️ 28-30 min: Test
- Visit your Vercel URL
- Test registration
- Test login
- Test on mobile

---

## ✅ Testing Checklist

After deployment, verify:

- [ ] `https://your-backend.onrender.com/api/health` → `{"status":"ok"}`
- [ ] `https://your-frontend.vercel.app` → Homepage loads
- [ ] Register test farmer → Success
- [ ] Login with test account → Dashboard loads
- [ ] Weather data displays
- [ ] Market prices display
- [ ] Admin login works
- [ ] Mobile responsive works
- [ ] Can install as PWA (Add to Home Screen)

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check Render logs, verify env vars |
| Frontend can't connect | Check config.js has correct URL |
| CORS error | Verify FRONTEND_URL in Render |
| Database error | Verify DATABASE_URL, check Neon status |
| Email not working | Check Gmail App Password, not regular password |
| 404 errors | Check file paths use `/frontend/` prefix |

---

## 🔧 Render Configuration

**Web Service Settings:**
- Name: `krushi-mithra-backend`
- Region: Oregon or Singapore
- Branch: `main`
- Root Directory: `backend`
- Environment: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Plan: **Free**
- Auto-Deploy: **Yes**

---

## 🎨 Vercel Configuration

**Project Settings:**
- Framework Preset: `Other`
- Root Directory: `.` (leave empty)
- Build Command: (leave empty)
- Output Directory: `frontend`
- Install Command: (leave empty)
- Branch: `main`
- Auto-Deploy: **Yes**

---

## 📱 Share These URLs

After deployment:

**For Farmers:**
```
🌐 KRUSHI MITHRA
Visit: https://YOUR-APP.vercel.app
Register: https://YOUR-APP.vercel.app/html/register.html

✨ Features:
- Real-time market prices
- Weather forecasts
- Government subsidies
- Available in Kannada, Hindi, English
```

**For Admin:**
```
🔐 Admin Portal
Login: https://YOUR-APP.vercel.app/html/admin-login.html
Email: admin@krushimithra.com
Password: Admin@12345
```

---

## 📞 Important Links

| Resource | URL |
|----------|-----|
| Deployment Guide | `DEPLOYMENT_GUIDE.md` |
| Quick Checklist | `DEPLOYMENT_CHECKLIST.md` |
| Environment Template | `PRODUCTION_ENV_TEMPLATE.md` |
| Production Summary | `PRODUCTION_READY_SUMMARY.md` |
| API Docs | `backend/API_DOCUMENTATION.md` |

---

## 🔐 Security Reminders

- ✅ Never commit `.env` to GitHub
- ✅ Use Gmail App Password (not regular password)
- ✅ Keep database URL private
- ✅ Change default admin password after first login
- ✅ Enable 2FA on Gmail
- ✅ Regularly check deployment logs
- ✅ Monitor for suspicious activity

---

## 💡 Pro Tips

1. **Bookmark URLs**: Save Render and Vercel dashboards
2. **Monitor Logs**: Check regularly for errors
3. **Test on Mobile**: Use real devices, not just desktop
4. **Backup Data**: Export database regularly
5. **Update Regularly**: Keep dependencies updated
6. **Use Git**: Commit often, deploy automatically

---

## ⚡ Emergency Commands

**Restart Backend:**
```
Render Dashboard → Service → Manual Deploy → Deploy latest commit
```

**Rollback Frontend:**
```
Vercel Dashboard → Project → Deployments → Previous deploy → Promote
```

**Check Backend Status:**
```bash
curl https://your-backend.onrender.com/api/health
```

**View Logs:**
```
Render: Dashboard → Service → Logs
Vercel: Dashboard → Project → Deployments → View logs
```

---

## 📊 Expected Performance

| Metric | Value |
|--------|-------|
| Backend Response | <100ms |
| Frontend Load | <2s |
| Database Query | <50ms |
| API Uptime | 99.9% |
| Cold Start (Render Free) | ~30s |

---

## 🎯 Post-Deployment Tasks

**Week 1:**
- [ ] Monitor error logs daily
- [ ] Test all features thoroughly
- [ ] Gather user feedback
- [ ] Fix any issues found

**Week 2:**
- [ ] Set up monitoring (UptimeRobot)
- [ ] Add Google Analytics
- [ ] Implement user feedback
- [ ] Plan enhancements

**Month 1:**
- [ ] Review performance metrics
- [ ] Optimize slow queries
- [ ] Consider paid tier if needed
- [ ] Update documentation

---

## 🌟 Success Criteria

Your deployment is successful when:

✅ Users can access from anywhere  
✅ Registration works  
✅ Login works  
✅ All features functional  
✅ Mobile responsive  
✅ No console errors  
✅ Email notifications work  
✅ Admin portal accessible  
✅ Weather data displays  
✅ Market prices update  

---

## 📅 Maintenance Schedule

**Daily:**
- Check error logs

**Weekly:**
- Review analytics
- Test critical features
- Check database size

**Monthly:**
- Update dependencies
- Backup database
- Review security
- Plan improvements

---

**💪 You've got this! Follow the checklist and you'll be live in 30 minutes!**

---

*Quick Reference Card v1.0 - January 2026*
