# 🌾 KRUSHI MITHRA - Agriculture Platform for Karnataka

[![Live Demo](https://img.shields.io/badge/Live-Demo-success)](https://krushi-mithra.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-blue)](https://krushi-mithra-backend.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Mobile](https://img.shields.io/badge/Mobile-Responsive-brightgreen)](MOBILE_PRODUCTION_READY_GUIDE.md)

**Complete agriculture platform for Karnataka farmers with real-time market prices, weather updates, government subsidies, and farming resources.**

> 🌐 **Live App**: [krushi-mithra.vercel.app](https://krushi-mithra.vercel.app)  
> 📱 **100% Mobile Friendly** | **PWA Enabled** | **Multi-Language** (English, Hindi, Kannada)  
> ✅ **Production Ready** | **Touch-Optimized** | **Responsive Design**

---

## 🎉 NEW: MOBILE-RESPONSIVE & PRODUCTION-READY

**Latest Update (January 2026)**: KRUSHI MITHRA is now fully mobile-responsive and production-ready!

### ✅ What's New
- 📱 **Hamburger Menu** - Mobile navigation with smooth animations
- 👆 **Touch-Friendly** - All buttons optimized for mobile (44px minimum)
- 🎯 **Single-Section Navigation** - Farmer dashboard shows one section at a time
- 📊 **Responsive Layouts** - Optimized for desktop, tablet, and mobile
- 🚀 **Production-Ready Backend** - Uses PORT from environment
- 🌐 **Smart API Detection** - Auto-detects development vs production
- 📚 **Comprehensive Docs** - Complete mobile testing and deployment guides

**See**: [MOBILE_PRODUCTION_READY_GUIDE.md](MOBILE_PRODUCTION_READY_GUIDE.md) for details

---

## ✨ Features

### For Farmers 👨‍🌾
- 📊 **Real-time Market Prices** - Get latest prices for crops across Karnataka
- 🌤️ **Weather Forecasts** - 5-day weather predictions for your location
- 💰 **Government Subsidies** - Browse and apply for agricultural subsidies
- 🔔 **Notifications** - Receive important updates via email and dashboard
- 🌍 **Multi-language Support** - Available in English, Hindi, and Kannada
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🍔 **Hamburger Menu** - Easy mobile navigation
- ⚡ **Instant Registration** - No admin approval needed

### For Administrators 👨‍💼
- 👥 **Farmer Management** - View and manage registered farmers
- 📈 **Price Updates** - Update market prices for various crops
- 📢 **Send Notifications** - Broadcast important messages to farmers
- 📊 **Analytics Dashboard** - View platform statistics
- 🔐 **Secure Access** - Role-based authentication
- 📱 **Mobile Admin** - Manage from any device

---

## 🚀 Quick Start

### Live Deployment (Recommended)

**The app is already live! Just visit:**

- 🌐 **Homepage**: https://krushi-mithra.vercel.app
- 👨‍🌾 **Farmer Registration**: https://krushi-mithra.vercel.app/html/register.html
- 👨‍💼 **Admin Portal**: https://krushi-mithra.vercel.app/html/admin-login.html

**Default Admin Credentials:**
- Email: `admin@krushimithra.com`
- Password: `Admin@12345`

### Local Development

If you want to run locally:

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/krushi-mithra.git
cd krushi-mithra

# Install backend dependencies
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start backend
npm start

# Open in browser
# Visit: http://localhost:3000/frontend/html/index.html
```

---

## 🏗️ Tech Stack

### Frontend
- **HTML5, CSS3, JavaScript** (Vanilla JS)
- **Responsive Design** (Mobile-first)
- **PWA Support** (Progressive Web App)
- **Multi-language System** (Custom i18n)

### Backend
- **Node.js** + **Express.js**
- **PostgreSQL** (Neon Cloud Database)
- **JWT Authentication**
- **Email Notifications** (Nodemailer)
- **Rate Limiting** (Security)

### APIs & Services
- **OpenWeatherMap API** - Weather forecasts
- **Neon PostgreSQL** - Cloud database
- **Gmail SMTP** - Email notifications

### Deployment
- **Backend**: Render (Auto-scaling, Free tier)
- **Frontend**: Vercel (CDN, Global edge network)
- **Database**: Neon PostgreSQL (Serverless)

---

## 📋 Deployment Guide

Want to deploy your own instance? Follow these guides:

1. **Quick Deployment** (30 minutes)
   - See [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md)

2. **Detailed Guide** (Step-by-step)
   - See [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)

3. **Local Setup**
   - See [`QUICK_START_GUIDE.md`](QUICK_START_GUIDE.md)

---

## 🎯 Key Features Explained

### 1. Market Prices 📊
- Real-time prices for 15+ crops
- Updated 3 times daily (8 AM, 12 PM, 4 PM IST)
- Data for all major Karnataka markets
- Price trends and history

### 2. Weather Integration 🌤️
- Current weather conditions
- 5-day detailed forecasts
- Weather alerts
- Location-based predictions
- Temperature, humidity, wind speed

### 3. Subsidies & Schemes 💰
- Complete list of government schemes
- Eligibility criteria
- Application procedures
- Contact information
- Regular updates

### 4. Notifications 🔔
- Email notifications
- In-app dashboard alerts
- Admin broadcast messages
- Weather alerts
- Price change notifications

### 5. Multi-language Support 🌍
- English
- हिंदी (Hindi)
- ಕನ್ನಡ (Kannada)
- Seamless language switching
- Persistent language preference

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting (prevent abuse)
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Input validation & sanitization

---

## 📱 Progressive Web App (PWA)

Install KRUSHI MITHRA on your mobile device:

**Android:**
1. Open site in Chrome
2. Tap menu (⋮) → "Add to Home Screen"
3. App appears on home screen

**iOS:**
1. Open site in Safari
2. Tap Share → "Add to Home Screen"
3. App appears on home screen

**Benefits:**
- Works offline (cached data)
- Fast loading
- Native app feel
- Push notifications (future)

---

## 🗂️ Project Structure

```
krushi_mithra/
├── backend/
│   ├── server.js              # Express server
│   ├── config/
│   │   ├── database.js        # Database configuration
│   │   └── scheduler.js       # Cron jobs
│   ├── controllers/           # Business logic
│   ├── routes/                # API endpoints
│   ├── middleware/            # Auth, validation, security
│   ├── models/                # Database models
│   └── .env                   # Environment variables (not in git)
│
├── frontend/
│   ├── html/                  # HTML pages
│   │   ├── index.html         # Homepage
│   │   ├── register.html      # Farmer registration
│   │   ├── farmer-dashboard.html
│   │   └── admin-dashboard.html
│   ├── css/                   # Stylesheets
│   ├── js/                    # JavaScript
│   │   ├── config.js          # API configuration
│   │   ├── language-manager.js
│   │   └── *.js               # Page scripts
│   └── languages/             # i18n translations
│
├── DEPLOYMENT_GUIDE.md        # Detailed deployment steps
├── DEPLOYMENT_CHECKLIST.md    # Quick 30-min checklist
├── manifest.json              # PWA configuration
├── vercel.json                # Vercel config
├── render.yaml                # Render config
└── README.md                  # This file
```

---

## 🌐 API Endpoints

### Public Endpoints
```
GET  /api/health              # Health check
GET  /api/market-prices       # Get market prices
GET  /api/subsidies           # Get subsidies list
POST /api/farmers/register    # Register farmer
POST /api/farmers/login       # Login farmer
```

### Protected Endpoints (Require Auth)
```
GET  /api/farmers/profile     # Get farmer profile
GET  /api/farmers/dashboard   # Dashboard data
GET  /api/weather/:location   # Weather forecast
GET  /api/notifications       # Get notifications
```

### Admin Endpoints (Admin Only)
```
POST /api/admin/login         # Admin login
GET  /api/admin/farmers       # List all farmers
POST /api/admin/notifications # Send notification
PUT  /api/admin/prices        # Update prices
```

Full API documentation: [`backend/API_DOCUMENTATION.md`](backend/API_DOCUMENTATION.md)

---

## 🧪 Testing

### Manual Testing

1. **Farmer Flow**
   ```
   Register → Login → Dashboard → View Prices → Check Weather
   ```

2. **Admin Flow**
   ```
   Admin Login → View Farmers → Send Notification → Update Prices
   ```

### API Testing with cURL

```bash
# Health check
curl https://krushi-mithra-backend.onrender.com/api/health

# Get market prices
curl https://krushi-mithra-backend.onrender.com/api/market-prices

# Register farmer
curl -X POST https://krushi-mithra-backend.onrender.com/api/farmers/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Farmer","email":"test@example.com","password":"Test@123","phone":"9876543210"}'
```

---

## 🐛 Troubleshooting

### Issue: Can't connect to backend

**Solution:**
1. Check backend status: Visit `/api/health`
2. Verify `config.js` has correct URL
3. Check browser console for errors

### Issue: Email notifications not working

**Solution:**
1. Verify Gmail App Password is correct
2. Check email settings in backend `.env`
3. Ensure 2FA is enabled on Gmail

### Issue: Database connection fails

**Solution:**
1. Check Neon database status
2. Verify `DATABASE_URL` in environment variables
3. Ensure `?sslmode=require` is in connection string

More troubleshooting: [`DEPLOYMENT_GUIDE.md#troubleshooting`](DEPLOYMENT_GUIDE.md#troubleshooting)

---

## 📊 Performance

- ⚡ **Frontend**: ~200ms page load
- ⚡ **Backend API**: <100ms response time
- ⚡ **Database**: Connection pooling enabled
- ⚡ **CDN**: Vercel edge network (global)
- ⚡ **Caching**: Browser caching enabled

---

## 🔮 Roadmap

### Version 2.0 (Planned)
- [ ] SMS notifications (Twilio)
- [ ] Crop recommendation AI
- [ ] Soil health monitoring
- [ ] Marketplace for direct selling
- [ ] Video tutorials
- [ ] Community forum
- [ ] Mobile native apps (React Native)

### Version 1.5 (In Progress)
- [x] PWA support
- [x] Multi-language system
- [x] Email notifications
- [x] Weather integration
- [ ] Advanced analytics
- [ ] PDF reports

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Developed with ❤️ for Karnataka farmers

---

## 📞 Support

- 📧 Email: admin@krushimithra.com
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR_USERNAME/krushi-mithra/issues)
- 📖 Docs: See documentation files in repo

---

## 🙏 Acknowledgments

- Karnataka State Department of Agriculture
- OpenWeatherMap for weather API
- Neon for PostgreSQL hosting
- Render and Vercel for deployment platforms

---

## ⭐ Star This Project

If you find this project useful, please give it a star on GitHub!

---

**Made with 💚 for a better agricultural future**

🌾 **KRUSHI MITHRA** - Empowering farmers with technology
