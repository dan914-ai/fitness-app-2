#!/bin/bash

echo "🔧 Fixing Expo configuration..."

# Kill all running processes
echo "📍 Stopping all Expo/Metro processes..."
pkill -f expo 2>/dev/null || true
pkill -f metro 2>/dev/null || true
pkill -f react-native 2>/dev/null || true
lsof -ti:19000,19001,19002,8081 | xargs kill -9 2>/dev/null || true

# Clear all caches
echo "🗑️  Clearing all caches..."
rm -rf .expo .expo-shared node_modules/.cache
rm -rf $TMPDIR/metro-* $TMPDIR/haste-* $TMPDIR/react-* 2>/dev/null || true
rm -rf %TEMP%/metro-* %TEMP%/haste-* 2>/dev/null || true

# Clear watchman if it exists
watchman watch-del-all 2>/dev/null || true

# Reset Metro bundler
echo "🔄 Resetting Metro bundler..."
npx expo doctor --fix-dependencies 2>/dev/null || true

echo "✅ Configuration fixed!"
echo ""
echo "📱 To start the app, run:"
echo "   npx expo start --clear"
echo ""
echo "If you still see errors, try:"
echo "   1. Close all terminal windows"
echo "   2. Open a fresh terminal"
echo "   3. Run: npx expo start --clear"