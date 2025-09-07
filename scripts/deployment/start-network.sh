#!/bin/bash

echo "🚀 Starting SISO-CORE (Latest Version) on Network"
echo "================================================"
echo ""

# Get the local IP address
LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Could not detect local IP address"
    echo "Try running: ipconfig getifaddr en0"
    exit 1
fi

echo "📱 Your local IP address is: $LOCAL_IP"
echo ""

# Kill any existing vite processes
echo "🔄 Stopping any existing servers..."
pkill -f vite || true
sleep 2

echo "🏗️ Starting SISO-CORE development server..."
echo ""

# Start the dev server with host flag to expose on network
echo "📡 Server will be accessible at:"
echo "   Local:   http://localhost:5173"
echo "   Network: http://$LOCAL_IP:5173"
echo ""
echo "📱 On your phone/browser, open: http://$LOCAL_IP:5173"
echo ""
echo "🔐 Login credentials:"
echo "   Email: Fuzeheritage123456789@gmail.com"
echo "   Password: Million2025@SISO"
echo ""
echo "🎯 LifeLock pages:"
echo "   - http://$LOCAL_IP:5173/admin/life-lock"
echo "   - http://$LOCAL_IP:5173/admin/life-lock/day"
echo ""
echo "✨ This is the LATEST version with:"
echo "   - Updated tasks tracker"
echo "   - LifeLock functionality"
echo "   - Admin dashboard improvements"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================================"
echo ""

# Start vite with host flag
npm run dev -- --host