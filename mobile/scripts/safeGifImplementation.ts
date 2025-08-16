const fs = require('fs');
const path = require('path');

// Error prevention and validation utilities
class SafeGifImplementation {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.backupPath = null;
    this.databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
  }

  // 1. Create backup before any changes
  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupPath = path.join(__dirname, `../src/data/exerciseDatabase.backup-${timestamp}.ts`);
    
    try {
      fs.copyFileSync(this.databasePath, this.backupPath);
      console.log('✅ Backup created:', this.backupPath);
      return true;
    } catch (error) {
      this.errors.push(`Failed to create backup: ${error.message}`);
      return false;
    }
  }

  // 2. Validate file paths and handle encoding issues
  validateAndNormalizeGifPath(gifPath) {
    // Handle Korean characters in filenames
    const normalizedPath = gifPath.replace(/\\/g, '/');
    
    // Check for problematic characters
    if (normalizedPath.includes('?') || normalizedPath.includes('*')) {
      this.warnings.push(`Path contains problematic characters: ${gifPath}`);
      return null;
    }

    // Ensure proper encoding for Korean filenames
    try {
      // Test if the path can be properly encoded
      Buffer.from(normalizedPath, 'utf8');
      return normalizedPath;
    } catch (error) {
      this.errors.push(`Encoding error for path: ${gifPath}`);
      return null;
    }
  }

  // 3. Check if GIF file actually exists
  verifyGifExists(gifPath) {
    // Convert relative path to absolute for checking
    const absolutePath = path.join(__dirname, '..', gifPath);
    
    try {
      if (fs.existsSync(absolutePath)) {
        const stats = fs.statSync(absolutePath);
        if (stats.size === 0) {
          this.warnings.push(`Empty file: ${gifPath}`);
          return false;
        }
        return true;
      }
    } catch (error) {
      // File doesn't exist or can't be accessed
    }
    
    // Check in Downloads folders as fallback
    const downloadPaths = [
      `/mnt/c/Users/danny/Downloads/chest exercises/${path.basename(gifPath)}`,
      `/mnt/c/Users/danny/Downloads/back exercises/${path.basename(gifPath)}`,
      `/mnt/c/Users/danny/Downloads/shoulder exercises/${path.basename(gifPath)}`
    ];
    
    for (const downloadPath of downloadPaths) {
      try {
        if (fs.existsSync(downloadPath)) {
          return downloadPath;
        }
      } catch (error) {
        // Continue checking other paths
      }
    }
    
    return false;
  }

  // 4. Safe database update with validation
  updateExerciseGif(exerciseId, newGifPath) {
    // Validate the GIF path
    const normalizedPath = this.validateAndNormalizeGifPath(newGifPath);
    if (!normalizedPath) {
      this.errors.push(`Invalid path for ${exerciseId}: ${newGifPath}`);
      return false;
    }

    // Read current database content
    let databaseContent;
    try {
      databaseContent = fs.readFileSync(this.databasePath, 'utf-8');
    } catch (error) {
      this.errors.push(`Failed to read database: ${error.message}`);
      return false;
    }

    // Find the exercise
    const exerciseRegex = new RegExp(
      `(id:\\s*['"]${exerciseId}['"][\\s\\S]*?)media:\\s*{([^}]*)}`,
      'g'
    );
    
    let found = false;
    let updated = false;
    
    const newContent = databaseContent.replace(exerciseRegex, (match, exercisePart, mediaContent) => {
      found = true;
      
      // Check current media content
      if (mediaContent.includes('gifUrl:')) {
        // Update existing gifUrl
        const updatedMedia = mediaContent.replace(
          /gifUrl:\s*['"][^'"]*['"]/,
          `gifUrl: '${normalizedPath}'`
        );
        updated = true;
        return exercisePart + 'media: {' + updatedMedia + '}';
      } else {
        // Add gifUrl if missing
        const updatedMedia = mediaContent.trim();
        const separator = updatedMedia.endsWith(',') ? '\n' : ',\n';
        updated = true;
        return exercisePart + 'media: {' + updatedMedia + separator +
               `      gifUrl: '${normalizedPath}'\n    }`;
      }
    });

    if (!found) {
      this.warnings.push(`Exercise not found: ${exerciseId}`);
      return false;
    }

    if (updated) {
      try {
        fs.writeFileSync(this.databasePath, newContent, 'utf-8');
        return true;
      } catch (error) {
        this.errors.push(`Failed to write database: ${error.message}`);
        return false;
      }
    }

    return false;
  }

  // 5. Copy GIF files safely
  copyGifFile(sourcePath, destPath) {
    try {
      // Create destination directory if it doesn't exist
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Check source file
      if (!fs.existsSync(sourcePath)) {
        this.errors.push(`Source file not found: ${sourcePath}`);
        return false;
      }

      // Copy with error handling
      fs.copyFileSync(sourcePath, destPath);
      
      // Verify copy
      const sourceSize = fs.statSync(sourcePath).size;
      const destSize = fs.statSync(destPath).size;
      
      if (sourceSize !== destSize) {
        this.errors.push(`File size mismatch after copy: ${sourcePath}`);
        fs.unlinkSync(destPath); // Remove corrupted copy
        return false;
      }

      return true;
    } catch (error) {
      this.errors.push(`Copy failed: ${error.message}`);
      return false;
    }
  }

  // 6. Rollback mechanism
  rollback() {
    if (!this.backupPath) {
      console.error('❌ No backup available for rollback');
      return false;
    }

    try {
      fs.copyFileSync(this.backupPath, this.databasePath);
      console.log('✅ Database rolled back successfully');
      return true;
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      return false;
    }
  }

  // 7. Generate safe implementation script
  generateSafeScript() {
    const script = `const SafeGifImplementation = require('./safeGifImplementation').SafeGifImplementation;

// Exercise to GIF mappings
const gifMappings = [
  { exerciseId: 'barbell_bench_press', gif: '바벨 벤치프레스.gif', category: 'chest' },
  { exerciseId: 'dumbbell_bench_press', gif: '덤벨 벤치프레스.gif', category: 'chest' },
  { exerciseId: 'dips', gif: '딥스.gif', category: 'chest' },
  { exerciseId: 'lat_pulldown', gif: '랫 풀다운.gif', category: 'back' },
  { exerciseId: 'barbell_row', gif: '바벨 로우.gif', category: 'back' },
  { exerciseId: 'deadlift', gif: '데드리프트.gif', category: 'back' },
  { exerciseId: 'shoulder_press', gif: '바벨 숄더프레스.gif', category: 'shoulders' },
  { exerciseId: 'lateral_raise', gif: '덤벨 레터럴 레이즈.gif', category: 'shoulders' },
  { exerciseId: 'arnold_press', gif: '아놀드 프레스.gif', category: 'shoulders' }
];

async function implementGifsSafely() {
  const safe = new SafeGifImplementation();
  
  // Create backup first
  if (!safe.createBackup()) {
    console.error('❌ Failed to create backup. Aborting.');
    return;
  }

  const successful = [];
  const failed = [];

  for (const mapping of gifMappings) {
    const sourcePath = \`/mnt/c/Users/danny/Downloads/\${mapping.category} exercises/\${mapping.gif}\`;
    const destPath = \`./assets/exercise-gifs/\${mapping.category}/\${mapping.gif}\`;
    
    console.log(\`\\nProcessing: \${mapping.exerciseId}\`);
    
    // Verify source exists
    const sourceExists = safe.verifyGifExists(sourcePath);
    if (!sourceExists) {
      console.log(\`  ⚠️  Source not found: \${mapping.gif}\`);
      failed.push(mapping);
      continue;
    }

    // Copy GIF file
    const absoluteDestPath = path.join(__dirname, '..', destPath);
    if (safe.copyGifFile(sourcePath, absoluteDestPath)) {
      console.log(\`  ✅ Copied GIF file\`);
      
      // Update database
      if (safe.updateExerciseGif(mapping.exerciseId, destPath)) {
        console.log(\`  ✅ Updated database\`);
        successful.push(mapping);
      } else {
        console.log(\`  ❌ Failed to update database\`);
        failed.push(mapping);
      }
    } else {
      console.log(\`  ❌ Failed to copy GIF\`);
      failed.push(mapping);
    }
  }

  // Report results
  console.log(\`\\n=== Implementation Summary ===\`);
  console.log(\`✅ Successful: \${successful.length}\`);
  console.log(\`❌ Failed: \${failed.length}\`);
  
  if (safe.errors.length > 0) {
    console.log(\`\\n⚠️  Errors:\`);
    safe.errors.forEach(err => console.log(\`  - \${err}\`));
  }
  
  if (safe.warnings.length > 0) {
    console.log(\`\\n⚠️  Warnings:\`);
    safe.warnings.forEach(warn => console.log(\`  - \${warn}\`));
  }

  // Ask for rollback if there were failures
  if (failed.length > 0) {
    console.log(\`\\n⚠️  Some operations failed. You can rollback by running:\`);
    console.log(\`  node scripts/rollbackDatabase.js\`);
  }
}

// Run the implementation
implementGifsSafely();
`;

    fs.writeFileSync(
      path.join(__dirname, 'runSafeGifImplementation.js'),
      script
    );
  }

  // 8. Create rollback script
  createRollbackScript() {
    const rollbackScript = `const fs = require('fs');
const path = require('path');

// Find the most recent backup
const dataDir = path.join(__dirname, '../src/data');
const files = fs.readdirSync(dataDir);
const backups = files.filter(f => f.startsWith('exerciseDatabase.backup-'));

if (backups.length === 0) {
  console.error('❌ No backup files found');
  process.exit(1);
}

// Sort by timestamp (newest first)
backups.sort().reverse();
const latestBackup = backups[0];

console.log(\`Found backup: \${latestBackup}\`);
console.log('Do you want to restore this backup? (yes/no)');

process.stdin.once('data', (data) => {
  const answer = data.toString().trim().toLowerCase();
  
  if (answer === 'yes' || answer === 'y') {
    try {
      const backupPath = path.join(dataDir, latestBackup);
      const databasePath = path.join(dataDir, 'exerciseDatabase.ts');
      
      fs.copyFileSync(backupPath, databasePath);
      console.log('✅ Database restored successfully');
    } catch (error) {
      console.error('❌ Restore failed:', error.message);
    }
  } else {
    console.log('Rollback cancelled');
  }
  
  process.exit(0);
});
`;

    fs.writeFileSync(
      path.join(__dirname, 'rollbackDatabase.js'),
      rollbackScript
    );
  }
}

// Export for use in other scripts
module.exports = { SafeGifImplementation };

// If run directly, create the implementation scripts
if (require.main === module) {
  const safe = new SafeGifImplementation();
  safe.generateSafeScript();
  safe.createRollbackScript();
  
  console.log('✅ Created safe implementation scripts:');
  console.log('  1. runSafeGifImplementation.js - Main implementation script');
  console.log('  2. rollbackDatabase.js - Rollback script');
  console.log('\nRun: node scripts/runSafeGifImplementation.js');
}