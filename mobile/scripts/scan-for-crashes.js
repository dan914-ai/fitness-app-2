#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('=== SCANNING FOR POTENTIAL CRASHES ===\n');

const issues = [];
const criticalIssues = [];

// Directories to scan
const dirsToScan = [
  'src/screens',
  'src/components',
  'src/services',
  'src/utils',
  'src/hooks'
];

// Patterns that often cause crashes
const crashPatterns = [
  // Undefined/null access
  { pattern: /(\w+)\.(\w+)\.(\w+)/g, name: 'Deep property access without null checks', severity: 'warning' },
  { pattern: /JSON\.parse\([^)]+\)/g, name: 'JSON.parse without try/catch', severity: 'critical' },
  { pattern: /require\(['"`][^'"`]+['"`]\)/g, name: 'Dynamic require that might fail', severity: 'warning' },
  
  // Array operations
  { pattern: /\[0\]\./g, name: 'Direct array[0] access without length check', severity: 'warning' },
  { pattern: /\.map\(|\.filter\(|\.reduce\(/g, name: 'Array method on potentially undefined', severity: 'info' },
  
  // Async issues  
  { pattern: /async\s+\w+\s*\([^)]*\)\s*{[^}]*(?!try)/g, name: 'Async function without try/catch', severity: 'warning' },
  { pattern: /await\s+[^;]+(?!\.catch)/g, name: 'Await without .catch', severity: 'info' },
  
  // Missing imports
  { pattern: /staticThumbnails\[/g, name: 'Using staticThumbnails', severity: 'check-import' },
  { pattern: /exerciseDatabase/g, name: 'Using exerciseDatabase', severity: 'check-import' },
  { pattern: /EXERCISE_DATABASE/g, name: 'Using EXERCISE_DATABASE', severity: 'check-import' }
];

// Files to check specifically
const criticalFiles = [
  'src/services/exerciseDatabase.service.ts',
  'src/services/thumbnailGenerator.service.ts',
  'src/screens/record/ExerciseSelectionScreen.tsx',
  'src/screens/home/ExerciseTrackScreen.tsx',
  'src/constants/staticThumbnails.ts',
  'src/data/exerciseDatabase.ts'
];

// Function to scan file
function scanFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.relative(path.join(__dirname, '..'), filePath);
  const fileIssues = [];
  
  // Check for crash patterns
  crashPatterns.forEach(({ pattern, name, severity }) => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      if (severity === 'check-import') {
        // Special handling for import checks
        const hasImport = content.includes(`import`) && content.includes(name.replace('Using ', ''));
        if (!hasImport) {
          fileIssues.push({
            file: fileName,
            issue: `Missing import for ${name.replace('Using ', '')}`,
            severity: 'critical',
            count: matches.length
          });
        }
      } else if (severity === 'critical' || (severity === 'warning' && matches.length > 3)) {
        fileIssues.push({
          file: fileName,
          issue: name,
          severity,
          count: matches.length
        });
      }
    }
  });
  
  // Check for specific dangerous patterns
  // 1. Accessing nested properties without optional chaining
  const unsafeAccess = content.match(/(\w+)\.(\w+)\.(\w+)(?!\?)/g);
  if (unsafeAccess && unsafeAccess.length > 5) {
    fileIssues.push({
      file: fileName,
      issue: 'Multiple unsafe nested property accesses',
      severity: 'warning',
      count: unsafeAccess.length
    });
  }
  
  // 2. Using deleted/moved files
  const oldImports = [
    'staticThumbnail.service',
    'thumbnail.service',
    'getLocalGif'
  ];
  
  oldImports.forEach(oldImport => {
    if (content.includes(oldImport)) {
      fileIssues.push({
        file: fileName,
        issue: `Importing deleted file: ${oldImport}`,
        severity: 'critical',
        count: 1
      });
    }
  });
  
  return fileIssues;
}

// Scan all directories
console.log('Scanning directories...\n');

dirsToScan.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) return;
  
  const files = fs.readdirSync(fullPath, { recursive: true })
    .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
    .map(f => path.join(fullPath, f));
  
  files.forEach(file => {
    const fileIssues = scanFile(file);
    if (fileIssues && fileIssues.length > 0) {
      issues.push(...fileIssues);
    }
  });
});

// Scan critical files
console.log('Checking critical files...\n');

criticalFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  const fileIssues = scanFile(fullPath);
  if (fileIssues && fileIssues.length > 0) {
    criticalIssues.push(...fileIssues);
  }
});

// Check for missing files referenced in code
console.log('Checking for missing file references...\n');

const dbPath = path.join(__dirname, '..', 'src/data/exerciseDatabase.ts');
if (fs.existsSync(dbPath)) {
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  
  // Check if all referenced thumbnails exist
  const thumbRefs = dbContent.match(/exercise-thumbnails\/[^'"`]+/g) || [];
  const missingThumbs = thumbRefs.filter(ref => {
    const thumbPath = path.join(__dirname, '..', 'assets', ref);
    return !fs.existsSync(thumbPath);
  });
  
  if (missingThumbs.length > 0) {
    criticalIssues.push({
      file: 'src/data/exerciseDatabase.ts',
      issue: `References ${missingThumbs.length} missing thumbnail files`,
      severity: 'critical',
      details: missingThumbs.slice(0, 5)
    });
  }
}

// Report findings
console.log('=' * 50);
console.log('📊 CRASH SCAN REPORT');
console.log('=' * 50 + '\n');

const critical = [...criticalIssues, ...issues.filter(i => i.severity === 'critical')];
const warnings = issues.filter(i => i.severity === 'warning');

if (critical.length === 0 && warnings.length === 0) {
  console.log('✅ No crash-causing issues found!');
} else {
  if (critical.length > 0) {
    console.log(`❌ CRITICAL ISSUES: ${critical.length}\n`);
    critical.forEach(issue => {
      console.log(`  📍 ${issue.file}`);
      console.log(`     Issue: ${issue.issue}`);
      if (issue.count) console.log(`     Occurrences: ${issue.count}`);
      if (issue.details) console.log(`     Details: ${issue.details.join(', ')}`);
      console.log();
    });
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS: ${warnings.length}\n`);
    warnings.slice(0, 10).forEach(issue => {
      console.log(`  📍 ${issue.file}`);
      console.log(`     Issue: ${issue.issue} (${issue.count} occurrences)`);
    });
    
    if (warnings.length > 10) {
      console.log(`\n  ... and ${warnings.length - 10} more warnings`);
    }
  }
}

// Write results to file for fixing
if (critical.length > 0) {
  fs.writeFileSync(
    path.join(__dirname, 'crash-issues.json'),
    JSON.stringify({ critical, warnings }, null, 2)
  );
  console.log('\n💾 Issues saved to scripts/crash-issues.json');
}

console.log('\n' + '=' * 50);