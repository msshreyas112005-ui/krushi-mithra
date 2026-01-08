# 🏗️ KRUSHI MITHRA - Production Architecture

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS / FARMERS                         │
│              (Laptops, Mobile Phones, Tablets)                  │
└────────────┬──────────────────────────────────┬─────────────────┘
             │                                  │
             │ HTTPS                            │ HTTPS
             │                                  │
             ▼                                  ▼
┌────────────────────────┐         ┌───────────────────────────┐
│   FRONTEND (Vercel)    │         │   FRONTEND (Netlify)      │
│  ┌──────────────────┐  │         │  ┌─────────────────────┐  │
│  │   HTML Pages     │  │         │  │    HTML Pages       │  │
│  │   - index.html   │  │         │  │    - index.html     │  │
│  │   - register     │  │         │  │    - register       │  │
│  │   - dashboard    │  │         │  │    - dashboard      │  │
│  └──────────────────┘  │         │  └─────────────────────┘  │
│  ┌──────────────────┐  │         │  ┌─────────────────────┐  │
│  │   JavaScript     │  │         │  │    JavaScript       │  │
│  │   - config.js ◄──┼──┼─────────┼──┤    - config.js      │  │
│  │   - API calls    │  │         │  │    - API calls      │  │
│  └──────────────────┘  │         │  └─────────────────────┘  │
│  ┌──────────────────┐  │         │  ┌─────────────────────┐  │
│  │   CSS Styles     │  │         │  │    CSS Styles       │  │
│  │   - Responsive   │  │         │  │    - Responsive     │  │
│  └──────────────────┘  │         │  └─────────────────────┘  │
│                        │         │                           │
│  🌐 Global CDN        │         │  🌐 Global CDN           │
│  ⚡ Fast Loading      │         │  ⚡ Fast Loading         │
│  📱 PWA Enabled       │         │  📱 PWA Enabled          │
└────────────┬───────────┘         └──────────┬────────────────┘
             │                                │
             │ API Calls                      │ API Calls
             │ (CORS Protected)               │ (CORS Protected)
             │                                │
             └────────────┬───────────────────┘
                          │
                          ▼
             ┌────────────────────────┐
             │   BACKEND (Render)     │
             │  ┌──────────────────┐  │
             │  │  Node.js Server  │  │
             │  │  ┌────────────┐  │  │
             │  │  │ Express.js │  │  │
             │  │  └────────────┘  │  │
             │  │                  │  │
             │  │  🔐 JWT Auth     │  │
             │  │  🛡️  Security    │  │
             │  │  ⚡ Rate Limit   │  │
             │  └──────────────────┘  │
             │                        │
             │  ┌──────────────────┐  │
             │  │   API Routes     │  │
             │  │  - /api/farmers  │  │
             │  │  - /api/admin    │  │
             │  │  - /api/prices   │  │
             │  │  - /api/weather  │  │
             │  │  - /api/health   │  │
             │  └──────────────────┘  │
             │                        │
             │  ┌──────────────────┐  │
             │  │   Middleware     │  │
             │  │  - Auth          │  │
             │  │  - Validation    │  │
             │  │  - Error Handle  │  │
             │  └──────────────────┘  │
             │                        │
             │  🔄 Auto-Deploy       │
             │  📊 Health Checks     │
             │  📝 Logging           │
             └───┬──────────┬─────┬──┘
                 │          │     │
                 │          │     │
       ┌─────────┘          │     └──────────┐
       │                    │                │
       ▼                    ▼                ▼
┌────────────┐    ┌──────────────────┐    ┌──────────────┐
│  Database  │    │  External APIs   │    │    Email     │
│   (Neon)   │    │  ┌────────────┐  │    │   (Gmail)    │
│            │    │  │ OpenWeather│  │    │              │
│ PostgreSQL │    │  │    API     │  │    │ Nodemailer   │
│            │    │  └────────────┘  │    │              │
│ ┌────────┐ │    │                  │    │ ┌──────────┐ │
│ │Farmers │ │    │  🌤️  Weather     │    │ │Welcome   │ │
│ │Prices  │ │    │  📊 Forecasts    │    │ │Alerts    │ │
│ │Subsidy │ │    │  🌡️  Temperature │    │ │Notifs    │ │
│ │Notify  │ │    │                  │    │ └──────────┘ │
│ └────────┘ │    └──────────────────┘    │              │
│            │                             │  SMTP: 587   │
│ ⚡ Fast    │                             │  TLS/SSL     │
│ 🔒 Secure  │                             └──────────────┘
│ ☁️  Cloud   │
└────────────┘
```

---

## 🔄 Data Flow Diagram

### User Registration Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  Farmer  │──1──▶│ Frontend │──2──▶│ Backend  │──3──▶│ Database │
│  Browser │      │ Vercel   │      │ Render   │      │  Neon    │
└──────────┘      └──────────┘      └──────────┘      └──────────┘
                         │                  │
                         │                  │
                         │                  └──4──▶┌──────────┐
                         │                          │  Email   │
                         │                          │  Service │
                         │                          └──────────┘
                         │                                │
                         └────────5. Success Response◄────┘

Steps:
1. User fills registration form
2. Frontend sends POST /api/farmers/register
3. Backend validates, hashes password, saves to DB
4. Backend sends welcome email
5. Frontend shows success, redirects to login
```

### Weather Data Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌────────────┐
│ Farmer   │──1──▶│ Frontend │──2──▶│ Backend  │──3──▶│OpenWeather │
│Dashboard │      │          │      │          │      │   API      │
└──────────┘      └──────────┘      └──────────┘      └────────────┘
     ▲                                    │                    │
     │                                    │                    │
     └─────5. Display Weather◄────4. Returns Data◄────────────┘

Steps:
1. User opens dashboard
2. Frontend requests GET /api/weather/:location
3. Backend calls OpenWeatherMap API
4. Backend processes and returns weather data
5. Frontend displays forecast
```

---

## 🌐 Deployment Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        GITHUB                              │
│               (Source Code Repository)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Repository: krushi-mithra                           │  │
│  │  Branch: main                                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │  │
│  │  │  Backend   │  │  Frontend  │  │    Configs   │  │  │
│  │  │   Files    │  │   Files    │  │  vercel.json │  │  │
│  │  └────────────┘  └────────────┘  │  render.yaml │  │  │
│  │                                   └──────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬──────────────────────────┬────────────────────┘
             │                          │
    Git Push │                          │ Git Push
             │                          │
             ▼                          ▼
┌──────────────────────┐    ┌────────────────────────┐
│   RENDER PLATFORM    │    │   VERCEL PLATFORM      │
│                      │    │                        │
│  🔄 Auto-Detects     │    │  🔄 Auto-Detects      │
│     Changes          │    │     Changes           │
│                      │    │                        │
│  📦 Builds Backend   │    │  📦 Builds Frontend   │
│     - npm install    │    │     - No build needed │
│     - npm start      │    │     - Static serve    │
│                      │    │                        │
│  🚀 Deploys to:      │    │  🚀 Deploys to:       │
│     Production URL   │    │     Production URL    │
│                      │    │                        │
│  ⏱️  ~3-5 minutes    │    │  ⏱️  ~1-2 minutes     │
└──────────────────────┘    └────────────────────────┘
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────┐
│              SECURITY LAYERS                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Layer 1: Network Security                         │
│  ┌───────────────────────────────────────────┐     │
│  │  • HTTPS/TLS Encryption (Auto by hosting)│     │
│  │  • CORS Protection                        │     │
│  │  • Rate Limiting (100 req/15min)         │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  Layer 2: Application Security                     │
│  ┌───────────────────────────────────────────┐     │
│  │  • JWT Authentication                     │     │
│  │  • Password Hashing (bcrypt)             │     │
│  │  • Input Validation                      │     │
│  │  • SQL Injection Prevention              │     │
│  │  • XSS Protection                        │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  Layer 3: Data Security                            │
│  ┌───────────────────────────────────────────┐     │
│  │  • Database SSL Connection               │     │
│  │  • Environment Variables (secrets)       │     │
│  │  • No sensitive data in code             │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  Layer 4: Monitoring                               │
│  ┌───────────────────────────────────────────┐     │
│  │  • Request Logging                       │     │
│  │  • Error Tracking                        │     │
│  │  • Health Checks                         │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📱 Multi-Device Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Desktop   │     │   Mobile    │     │   Tablet    │
│  (Laptop)   │     │   (Phone)   │     │   (iPad)    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                    │
       │ Browser           │ Browser/PWA        │ Browser/PWA
       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Responsive Frontend  │
              │  ┌──────────────────┐  │
              │  │  Auto-Adapts to: │  │
              │  │  • Screen Size   │  │
              │  │  • Device Type   │  │
              │  │  • Orientation   │  │
              │  └──────────────────┘  │
              │                        │
              │  🎨 CSS Media Queries  │
              │  📱 Mobile-First       │
              │  ⚡ Fast Loading       │
              └────────────────────────┘
```

---

## 🌍 Environment Detection System

```
┌──────────────────────────────────────────────────────┐
│               Frontend config.js                     │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Check hostname      │
          │  window.location.    │
          │  hostname            │
          └──────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│ localhost OR │          │  Production  │
│ 127.0.0.1 OR │          │   Domain     │
│ 192.168.x.x  │          │              │
└──────┬───────┘          └──────┬───────┘
       │                         │
       ▼                         ▼
┌──────────────┐          ┌──────────────┐
│ Development  │          │  Production  │
│   Mode       │          │    Mode      │
│              │          │              │
│ API_URL =    │          │ API_URL =    │
│ localhost:   │          │ backend.     │
│ 3000         │          │ onrender.com │
└──────────────┘          └──────────────┘
```

---

## 🔄 Auto-Deployment Pipeline

```
Developer Makes Changes
         │
         ▼
   git add .
   git commit -m "..."
   git push
         │
         ▼
    ┌─────────┐
    │ GitHub  │  (Receives Push)
    └────┬────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐  ┌────────┐
│ Render │  │Vercel  │
│Webhook │  │Webhook │
└───┬────┘  └───┬────┘
    │           │
    ▼           ▼
┌────────┐  ┌────────┐
│ Build  │  │ Build  │
│Backend │  │Frontend│
└───┬────┘  └───┬────┘
    │           │
    ▼           ▼
┌────────┐  ┌────────┐
│ Test   │  │ Test   │
│        │  │        │
└───┬────┘  └───┬────┘
    │           │
    ▼           ▼
┌────────┐  ┌────────┐
│Deploy  │  │Deploy  │
│Live    │  │Live    │
└───┬────┘  └───┬────┘
    │           │
    └─────┬─────┘
          ▼
    ✅ Production
       Updated!
```

---

## 📊 Database Schema (Simplified)

```
┌──────────────────────────────────────────────┐
│              NEON POSTGRESQL                 │
├──────────────────────────────────────────────┤
│                                              │
│  farmers                                     │
│  ┌────────────────────────────────────┐     │
│  │ id (PK)                            │     │
│  │ name                               │     │
│  │ email (unique)                     │     │
│  │ password (hashed)                  │     │
│  │ phone                              │     │
│  │ location                           │     │
│  │ primary_crop                       │     │
│  │ created_at                         │     │
│  └────────────────────────────────────┘     │
│                                              │
│  market_prices                               │
│  ┌────────────────────────────────────┐     │
│  │ id (PK)                            │     │
│  │ crop_name                          │     │
│  │ market                             │     │
│  │ price                              │     │
│  │ unit                               │     │
│  │ updated_at                         │     │
│  └────────────────────────────────────┘     │
│                                              │
│  subsidies                                   │
│  ┌────────────────────────────────────┐     │
│  │ id (PK)                            │     │
│  │ title                              │     │
│  │ description                        │     │
│  │ eligibility                        │     │
│  │ amount                             │     │
│  │ created_at                         │     │
│  └────────────────────────────────────┘     │
│                                              │
│  notifications                               │
│  ┌────────────────────────────────────┐     │
│  │ id (PK)                            │     │
│  │ farmer_id (FK)                     │     │
│  │ title                              │     │
│  │ message                            │     │
│  │ type                               │     │
│  │ is_read                            │     │
│  │ created_at                         │     │
│  └────────────────────────────────────┘     │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 🎯 Request/Response Flow

### Example: Get Market Prices

```
1. User Request
   ┌──────────────────────────────────────┐
   │ GET /api/market-prices               │
   │ Host: backend.onrender.com           │
   │ Authorization: Bearer <jwt_token>    │
   └──────────────────────────────────────┘
                    │
                    ▼
2. Backend Processing
   ┌──────────────────────────────────────┐
   │ • Verify JWT token                   │
   │ • Check rate limit                   │
   │ • Query database                     │
   │ • Format response                    │
   └──────────────────────────────────────┘
                    │
                    ▼
3. Database Query
   ┌──────────────────────────────────────┐
   │ SELECT * FROM market_prices          │
   │ ORDER BY updated_at DESC             │
   │ LIMIT 50                             │
   └──────────────────────────────────────┘
                    │
                    ▼
4. Response
   ┌──────────────────────────────────────┐
   │ {                                    │
   │   "success": true,                   │
   │   "data": [                          │
   │     {                                │
   │       "crop": "Rice",                │
   │       "price": 2500,                 │
   │       "market": "Bangalore"          │
   │     },                               │
   │     ...                              │
   │   ]                                  │
   │ }                                    │
   └──────────────────────────────────────┘
```

---

## 🚀 Scalability Architecture

```
Current Setup (Free Tier):
┌────────────────────────────────┐
│ 1 Backend Instance (Render)    │
│ 1 Database (Neon)             │
│ CDN Distribution (Vercel)     │
│                                │
│ Handles: ~1000 users/day      │
└────────────────────────────────┘

Future Scale (Paid Tier):
┌────────────────────────────────┐
│ Multiple Backend Instances     │
│ Load Balancer                  │
│ Redis Cache Layer             │
│ Database Read Replicas        │
│ CDN with Edge Caching         │
│                                │
│ Handles: ~100,000+ users/day  │
└────────────────────────────────┘
```

---

**Architecture ready for production deployment! 🚀**

*Diagram Version 1.0 - January 2026*
