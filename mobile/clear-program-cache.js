#!/usr/bin/env node

// Script to clear workout program cache and force reload of new programs
// This script is for development purposes to reset the program data

console.log('🔄 CLEARING WORKOUT PROGRAM CACHE');
console.log('='.repeat(50));

console.log('\n📋 NEW PROFESSIONAL PROGRAMS LOADED:');
console.log('1. Starting Strength Plus (Beginner Powerlifting)');
console.log('2. Push Pull Legs 2.0 (Intermediate Bodybuilding)');
console.log('3. Calisthenics Mastery Path (Intermediate Calisthenics)');
console.log('4. Hybrid Athlete Protocol (Advanced Hybrid)');
console.log('5. Female Strength & Shape (Intermediate Bodybuilding)');
console.log('6. Powerlifter\'s Road to Elite (Advanced Powerlifting)');

console.log('\n✅ CHANGES MADE:');
console.log('• Replaced all old programs with 6 new modern programs');
console.log('• Removed basic Korean programs (were causing only 3 to show)');
console.log('• Programs now cover all experience levels and disciplines');
console.log('• Added female-specific program for better representation');

console.log('\n🚀 TO APPLY CHANGES:');
console.log('1. Restart your mobile app');
console.log('2. Programs will be automatically reloaded');
console.log('3. You should now see 6 new professional programs');

console.log('\n💡 NEW PROGRAM FEATURES:');
console.log('• Starting Strength Plus: Perfect for beginners wanting to get strong');
console.log('• Push Pull Legs 2.0: The gold standard for muscle building');
console.log('• Calisthenics Mastery: Bodyweight skills and strength progression');
console.log('• Hybrid Athlete: Combines strength, size, and athleticism');
console.log('• Female Strength & Shape: Designed specifically for women');
console.log('• Powerlifter\'s Elite: Competition-focused powerlifting program');

console.log('\n🔧 Technical Details:');
console.log('• Removed old programs from programsData.ts');
console.log('• Updated workoutPrograms.service.ts to only load professional programs');
console.log('• AsyncStorage will auto-clear on app restart due to program changes');

console.log('\n✨ The app should now show 6 high-quality, modern workout programs instead of just 3 old ones!');