#!/bin/bash

# Build script for production deployment
echo "Building Sales Dashboard for production..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build:client

# Build backend
echo "Building backend..."
npm run build:server

# Create production directory
echo "Creating production build..."
mkdir -p production-build

# Copy built files
cp -r dist/ production-build/
cp -r server/ production-build/
cp database.sqlite production-build/
cp package.json production-build/
cp package-lock.json production-build/
cp production.env production-build/.env
cp -r uploads/ production-build/
cp -r attached_assets/ production-build/

# Copy node_modules (for production)
echo "Copying dependencies..."
cp -r node_modules/ production-build/

echo "Production build complete!"
echo "Upload the 'production-build' folder to your FTP server."
echo "Then run: cd production-build && node server/index.js"