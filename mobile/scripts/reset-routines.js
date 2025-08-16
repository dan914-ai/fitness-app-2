#!/usr/bin/env node

/**
 * Script to reset routines in AsyncStorage
 * Run this in browser console to force reset routines
 */

const resetRoutinesCode = `
// Clear old routine data and force re-initialization
(async function() {
  try {
    // Clear the routines data
    await AsyncStorage.removeItem('@user_routines');
    await AsyncStorage.removeItem('@routines_initialized');
    console.log('✅ Cleared old routine data');
    
    // Force reload
    window.location.reload();
  } catch (error) {
    console.error('Error resetting routines:', error);
  }
})();
`;

console.log('Copy and paste this code into your browser console:');
console.log('================================================');
console.log(resetRoutinesCode);
console.log('================================================');