#!/bin/bash

# 🚀 Vercel Deployment Quick Start Script
# This script helps you deploy Krushi Mithra to Vercel

echo "======================================"
echo "🌾 Krushi Mithra - Vercel Deployment"
echo "======================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Krushi Mithra"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Push to GitHub:"
echo "    git remote add origin https://github.com/YOUR_USERNAME/krushi-mithra.git"
echo "    git branch -M main"
echo "    git push -u origin main"
echo ""
echo "2️⃣  Deploy to Vercel:"
echo "    Visit: https://vercel.com/new"
echo "    Import your GitHub repository"
echo ""
echo "3️⃣  Add Environment Variables in Vercel Dashboard:"
echo "    • DATABASE_URL (your Neon PostgreSQL URL)"
echo "    • NODE_ENV=production"
echo "    • JWT_SECRET=krushi_mithra_secret_key_2025_secure_token"
echo "    • OPENWEATHER_API_KEY=2dc416bde8a045c05a52551eebc4d477"
echo "    • WEATHER_API_KEY=2dc416bde8a045c05a52551eebc4d477"
echo "    • ADMIN_EMAIL=admin@krushimithra.com"
echo "    • ADMIN_PASSWORD=Admin@12345"
echo "    • EMAIL_USER=krishimithra2026@gmail.com"
echo "    • EMAIL_APP_PASSWORD=umbhpecgsispzpmw"
echo "    • SUPPORT_EMAIL=support@krushimithra.com"
echo ""
echo "4️⃣  Deploy and Test:"
echo "    Your app will be live at: https://your-project.vercel.app"
echo ""
echo "📖 Full guide: See VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
