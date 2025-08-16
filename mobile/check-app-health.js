// Quick health check script
const fs = require('fs');
const path = require('path');

console.log('=== App Health Check ===\n');

// Check critical files exist
const criticalFiles = [
  'App.tsx',
  'src/navigation/AppNavigator.tsx',
  'src/contexts/WorkoutContext.tsx',
  'src/screens/home/HomeScreen.tsx',
  'src/data/exerciseDatabase.ts',
  'src/services/exerciseDatabase.service.ts'
];

let allFilesExist = true;
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

console.log('\n=== Checking for syntax errors ===');

// Check ExerciseTrackScreen for balanced braces
const exerciseTrackFile = path.join(__dirname, 'src/screens/home/ExerciseTrackScreen.tsx');
const content = fs.readFileSync(exerciseTrackFile, 'utf-8');

let openBraces = 0;
let closeBraces = 0;
let openParens = 0;
let closeParens = 0;

for (let char of content) {
  if (char === '{') openBraces++;
  if (char === '}') closeBraces++;
  if (char === '(') openParens++;
  if (char === ')') closeParens++;
}

console.log(`Braces: { ${openBraces} } ${closeBraces} - ${openBraces === closeBraces ? '✅ Balanced' : '❌ Unbalanced'}`);
console.log(`Parens: ( ${openParens} ) ${closeParens} - ${openParens === closeParens ? '✅ Balanced' : '❌ Unbalanced'}`);

// Check for common issues
console.log('\n=== Common Issues Check ===');

// Check if there are any console errors that might break the app
const hasDebuggerStatement = content.includes('debugger;');
const hasConsoleError = content.includes('console.error(') && !content.includes('catch');

if (hasDebuggerStatement) {
  console.log('⚠️  Found debugger statement - may pause app');
}

// Check imports
const hasReactImport = content.includes("import React");
const hasExpoImports = fs.readFileSync(path.join(__dirname, 'App.tsx'), 'utf-8').includes("from 'expo");

console.log(`${hasReactImport ? '✅' : '❌'} React imports found`);
console.log(`${hasExpoImports ? '✅' : '❌'} Expo imports found`);

console.log('\n=== Summary ===');
if (allFilesExist && openBraces === closeBraces && openParens === closeParens) {
  console.log('✅ Basic health check passed');
  console.log('\nNext steps:');
  console.log('1. Clear Metro cache: npx expo start --clear');
  console.log('2. Check browser console for specific errors');
  console.log('3. Try reloading the app (press r in terminal)');
} else {
  console.log('❌ Issues found that may cause white screen');
}