#!/bin/bash

# Sales Leaderboard - Vercel Deployment Script
echo "🚀 Starting Vercel deployment..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Build the application
echo "📦 Building application..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo ""
echo "📋 Don't forget to set these environment variables in your Vercel dashboard:"
echo "   - DATABASE_URL: Your PostgreSQL connection string"
echo "   - SESSION_SECRET: Random secret key for sessions"
echo "   - NODE_ENV: production"
echo ""
echo "🔗 After deployment, run: npm run db:push to set up your database schema"
echo "🎯 Access your admin panel at: https://your-domain.vercel.app/admin-portal"