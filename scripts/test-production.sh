#!/bin/bash

# Test Production Build Script
echo "🧪 Testing production build..."

# Set production environment
export NODE_ENV=production

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the app
echo "🔨 Building the app..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Starting production server..."
    echo "📱 Open http://localhost:3000 to test"
    echo "🔍 Check that no debug logs appear in console"
    echo "🐛 Verify debug panel is not visible"
    npm start
else
    echo "❌ Build failed!"
    exit 1
fi 