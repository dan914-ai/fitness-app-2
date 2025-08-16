#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('=== FIXING JSON.PARSE ISSUES ===\n');

// Files to fix
const filesToFix = [
  'src/screens/home/WaterIntakeScreen.tsx',
  'src/screens/menu/NotificationSettingsScreen.tsx',
  'src/screens/menu/PrivacySettingsScreen.tsx',
  'src/screens/menu/UnitSettingsScreen.tsx',
  'src/screens/wellness/NutritionTrackingScreen.tsx',
  'src/screens/wellness/WellnessScreen.tsx',
  'src/components/workout/PlateCalculator.tsx',
  'src/components/workout/RestTimer.tsx',
  'src/services/achievement-api.service.ts',
  'src/services/achievement.service.ts',
  'src/services/auth.service.supabase.ts',
  'src/services/authApi.ts',
  'src/services/imageCache.service.ts',
  'src/services/notification.service.ts',
  'src/services/personalRecords.service.ts',
  'src/services/restTimer.service.ts',
  'src/services/routines.service.ts',
  'src/services/workoutPrograms.service.ts',
  'src/services/workoutTimer.service.ts',
  'src/utils/apiWrapper.ts',
  'src/utils/testAuthWorkaround.ts'
];

let fixedCount = 0;

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Check if file already imports safeJsonParse
  const hasSafeImport = content.includes('safeJsonParse');
  
  // Find all JSON.parse occurrences not in try-catch
  const jsonParsePattern = /JSON\.parse\([^)]+\)/g;
  const matches = content.match(jsonParsePattern) || [];
  
  if (matches.length === 0) {
    return;
  }
  
  // Check if they're in try-catch blocks
  let needsFix = false;
  matches.forEach(match => {
    const index = content.indexOf(match);
    const before = content.substring(Math.max(0, index - 100), index);
    const after = content.substring(index, Math.min(content.length, index + 100));
    
    // Check if it's in a try block
    if (!before.includes('try {') || !after.includes('} catch')) {
      needsFix = true;
    }
  });
  
  if (!needsFix) {
    console.log(`✅ ${file} - Already safe`);
    return;
  }
  
  // Add import if needed
  if (!hasSafeImport) {
    // Find the last import statement
    const importMatches = content.match(/^import .* from .*;$/gm);
    if (importMatches && importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1];
      const importStatement = "import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';";
      content = content.replace(lastImport, lastImport + '\n' + importStatement);
    }
  }
  
  // Replace unsafe JSON.parse
  content = content.replace(/JSON\.parse\(([^)]+)\)(?![^{]*} catch)/g, (match, arg) => {
    // Check context to determine fallback
    const isArray = content.substring(content.indexOf(match) - 50, content.indexOf(match)).includes('[]');
    const fallback = isArray ? '[]' : '{}';
    return `safeJsonParse(${arg}, ${fallback})`;
  });
  
  // Replace JSON.stringify if needed
  content = content.replace(/JSON\.stringify\(([^)]+)\)(?![^{]*} catch)/g, (match, arg) => {
    return `safeJsonStringify(${arg})`;
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    fixedCount++;
    console.log(`✏️  Fixed: ${file}`);
  } else {
    console.log(`✅ ${file} - No changes needed`);
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);