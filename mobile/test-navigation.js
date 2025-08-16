// Quick test to verify navigation tabs
const fs = require('fs');
const path = require('path');

const navFile = path.join(__dirname, 'src/navigation/AppNavigator.tsx');
const content = fs.readFileSync(navFile, 'utf8');

// Check for all tabs
const tabs = ['홈', '기록', '통계', '소셜', '메뉴'];
console.log('Checking navigation tabs...\n');

tabs.forEach(tab => {
  const regex = new RegExp(`name="${tab}"`, 'g');
  const matches = content.match(regex);
  if (matches) {
    console.log(`✅ ${tab} tab found (${matches.length} occurrences)`);
  } else {
    console.log(`❌ ${tab} tab NOT found`);
  }
});

// Check for SocialStackNavigator
if (content.includes('SocialStackNavigator')) {
  console.log('\n✅ SocialStackNavigator is defined');
} else {
  console.log('\n❌ SocialStackNavigator is NOT defined');
}

// Check tab icon
if (content.includes("case '소셜':")) {
  console.log('✅ Social tab icon case is defined');
} else {
  console.log('❌ Social tab icon case is NOT defined');
}