const fs = require('fs');
const path = require('path');

console.log('=== GIF Implementation Validation ===\n');

const issues = {
  critical: [],
  warnings: [],
  info: []
};

// 1. Check database file
const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
try {
  const stats = fs.statSync(databasePath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  
  if (sizeMB > 2) {
    issues.warnings.push(`Database file is large: ${sizeMB}MB - Consider splitting`);
  }
  
  // Check if readable
  const content = fs.readFileSync(databasePath, 'utf-8');
  
  // Check for syntax issues
  if (!content.includes('export default EXERCISE_DATABASE')) {
    issues.critical.push('Database missing default export');
  }
  
  // Check for proper array closure
  const openBrackets = (content.match(/\[/g) || []).length;
  const closeBrackets = (content.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    issues.critical.push(`Bracket mismatch: ${openBrackets} [ vs ${closeBrackets} ]`);
  }
  
} catch (error) {
  issues.critical.push(`Cannot read database: ${error.message}`);
}

// 2. Check for Korean filename issues
const koreanGifs = [
  '바벨 벤치프레스.gif',
  '덤벨 로우.gif',
  '랫 풀다운.gif'
];

koreanGifs.forEach(gif => {
  try {
    // Test encoding
    const encoded = encodeURIComponent(gif);
    const decoded = decodeURIComponent(encoded);
    if (decoded !== gif) {
      issues.warnings.push(`Encoding issue with: ${gif}`);
    }
  } catch (error) {
    issues.critical.push(`Cannot encode filename: ${gif}`);
  }
});

// 3. Check asset directories
const assetDirs = [
  'mobile/assets/exercise-gifs/chest',
  'mobile/assets/exercise-gifs/back', 
  'mobile/assets/exercise-gifs/shoulders',
  'mobile/assets/exercise-gifs/all'
];

assetDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir.replace('mobile/', ''));
  if (!fs.existsSync(fullPath)) {
    issues.warnings.push(`Missing directory: ${dir}`);
  }
});

// 4. Check for common exercise ID patterns
const commonPatterns = [
  { pattern: /id:\s*['"].*['"],\s*id:/g, issue: 'Duplicate id field' },
  { pattern: /gifUrl:\s*undefined/g, issue: 'Undefined gifUrl' },
  { pattern: /gifUrl:\s*null/g, issue: 'Null gifUrl' },
  { pattern: /gifUrl:\s*''/g, issue: 'Empty gifUrl' },
  { pattern: /media:\s*{\s*}/g, issue: 'Empty media object' },
  { pattern: /\.\.\//g, issue: 'Parent directory references (../)' }
];

try {
  const content = fs.readFileSync(databasePath, 'utf-8');
  
  commonPatterns.forEach(({ pattern, issue }) => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      issues.warnings.push(`Found ${matches.length} instances of: ${issue}`);
    }
  });
} catch (error) {
  // Already handled above
}

// 5. Check TypeScript compilation
const tsConfig = path.join(__dirname, '../tsconfig.json');
if (!fs.existsSync(tsConfig)) {
  issues.warnings.push('No tsconfig.json found - TypeScript errors may not be caught');
}

// 6. Create pre-implementation checklist
const checklist = `
# Pre-Implementation Checklist

## Before Running GIF Implementation:

### 1. Backup Status
- [ ] Database backup created
- [ ] Git commit created  
- [ ] Can rollback if needed

### 2. File System
- [ ] Asset directories exist
- [ ] Write permissions verified
- [ ] Enough disk space

### 3. Korean Filename Handling  
- [ ] Terminal supports UTF-8
- [ ] File system supports Korean characters
- [ ] Git configured for UTF-8

### 4. Dependencies
- [ ] Node.js working properly
- [ ] All npm packages installed
- [ ] No conflicting processes

### 5. Testing Plan
- [ ] Test with 1-2 exercises first
- [ ] Verify app still loads
- [ ] Check GIF display works

## Common Issues to Avoid:

1. **Encoding Issues**
   - Use UTF-8 for all operations
   - Avoid special characters in paths

2. **Path Issues**
   - Always use forward slashes (/)
   - Use relative paths in database
   - Use absolute paths for file operations

3. **Database Corruption**
   - Never edit database while app is running
   - Always create backups
   - Validate JSON syntax

4. **GIF File Issues**
   - Verify files aren't corrupted
   - Check file sizes (not too large)
   - Ensure proper file extensions

## Safe Implementation Commands:

\`\`\`bash
# 1. Create backup
cp src/data/exerciseDatabase.ts src/data/exerciseDatabase.backup-manual.ts

# 2. Test with one file first
node scripts/testSingleGifUpdate.js

# 3. Run full implementation
node scripts/runSafeGifImplementation.js

# 4. If issues occur, rollback
node scripts/rollbackDatabase.js
\`\`\`
`;

fs.writeFileSync(
  path.join(__dirname, 'gif-implementation-checklist.md'),
  checklist
);

// 7. Create test script for single exercise
const testScript = `const fs = require('fs');
const path = require('path');

// Test with a single exercise first
const testExercise = {
  exerciseId: 'barbell_bench_press',
  gif: '바벨 벤치프레스.gif',
  category: 'chest'
};

console.log('Testing single exercise update...');

// 1. Check if exercise exists
const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
const content = fs.readFileSync(databasePath, 'utf-8');

if (!content.includes(\`id: '\${testExercise.exerciseId}'\`)) {
  console.error('❌ Exercise not found:', testExercise.exerciseId);
  process.exit(1);
}

console.log('✅ Exercise found');

// 2. Check if GIF exists
const sourcePath = \`/mnt/c/Users/danny/Downloads/\${testExercise.category} exercises/\${testExercise.gif}\`;
if (!fs.existsSync(sourcePath)) {
  console.error('❌ GIF not found:', sourcePath);
  process.exit(1);
}

console.log('✅ GIF file exists');

// 3. Test path encoding
try {
  const encoded = encodeURIComponent(testExercise.gif);
  console.log('✅ Path encoding works:', encoded);
} catch (error) {
  console.error('❌ Path encoding failed:', error.message);
  process.exit(1);
}

console.log('\\n✅ All tests passed! Safe to proceed with implementation.');
`;

fs.writeFileSync(
  path.join(__dirname, 'testSingleGifUpdate.js'),
  testScript
);

// Report validation results
console.log('=== Validation Results ===\n');

if (issues.critical.length > 0) {
  console.log('❌ CRITICAL ISSUES (must fix):');
  issues.critical.forEach(issue => console.log(`  - ${issue}`));
  console.log('');
}

if (issues.warnings.length > 0) {
  console.log('⚠️  WARNINGS (should review):');
  issues.warnings.forEach(issue => console.log(`  - ${issue}`));
  console.log('');
}

if (issues.info.length > 0) {
  console.log('ℹ️  INFO:');
  issues.info.forEach(issue => console.log(`  - ${issue}`));
  console.log('');
}

if (issues.critical.length === 0) {
  console.log('✅ No critical issues found\n');
}

console.log('Created files:');
console.log('  1. gif-implementation-checklist.md');
console.log('  2. testSingleGifUpdate.js');
console.log('\nRun validation test: node scripts/testSingleGifUpdate.js');