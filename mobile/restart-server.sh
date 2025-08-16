#!/bin/bash
echo "Stopping all Expo processes..."
pkill -f expo || true
pkill -f metro || true
pkill -f react-native || true

echo "Clearing caches..."
rm -rf .expo .expo-shared node_modules/.cache
rm -rf $TMPDIR/metro-* $TMPDIR/haste-* 2>/dev/null || true

echo "Starting Expo with clean cache..."
npx expo start --clear --web