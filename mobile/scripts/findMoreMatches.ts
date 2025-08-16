const fs = require('fs');
const path = require('path');

// Read database
const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
const databaseContent = fs.readFileSync(databasePath, 'utf-8');

// Get all exercise IDs
const exerciseIds = [];
const idMatches = databaseContent.matchAll(/id:\s*['"]([^'"]+)['"]/g);
for (const match of idMatches) {
  exerciseIds.push(match[1]);
}

// Check specific patterns for unmatched GIFs
const additionalMappings = [];

// Check for exercises containing specific keywords
const keywords = {
  chest: ['fly', 'press', 'dips', 'push', 'bench'],
  back: ['row', 'pull', 'lat', 'deadlift'],
  shoulder: ['shoulder', 'delt', 'raise', 'press', 'lateral']
};

// Specific GIFs we still need to match
const unmatchedGifs = {
  chest: [
    '덤벨 체스트 플라이',
    '디클라인 덤벨 플라이',
    '디클라인 케이블 플라이',
    '머신 체스트 플라이',
    '스미스 벤치 프레스',
    '인클라인 덤벨 플라이',
    '플레이트 체스트 프레스'
  ],
  back: [
    '랫 풀 다운',
    '머신 시티드 로우',
    '티 바 로우',
    '풀업',
    '체스트 서포티드 덤벨 로우',
    '체스트 서포티드 바벨로우',
    '케이블 시티드 로우',
    '케이블 풀오버'
  ],
  shoulder: [
    '머신 레터럴 레이즈',
    '머신 숄더 프레스',
    '시티드 바벨 숄더 프레스',
    '원 암 덤벨 숄더 프레스',
    '케이블 페이스 풀'
  ]
};

// Search for matches
console.log('Searching for additional matches...\n');

for (const [category, gifNames] of Object.entries(unmatchedGifs)) {
  console.log(`${category.toUpperCase()}:`);
  
  for (const gifName of gifNames) {
    // Try to find matching exercise IDs
    const searchTerms = gifName.toLowerCase()
      .replace('덤벨', 'dumbbell')
      .replace('바벨', 'barbell')
      .replace('케이블', 'cable')
      .replace('머신', 'machine')
      .replace('체스트', 'chest')
      .replace('플라이', 'fly')
      .replace('프레스', 'press')
      .replace('로우', 'row')
      .replace('풀다운', 'pulldown')
      .replace('랫', 'lat')
      .replace('풀업', 'pull-up')
      .replace('시티드', 'seated')
      .replace('레터럴 레이즈', 'lateral-raise')
      .replace('숄더', 'shoulder')
      .replace('델트', 'delt');
    
    // Find exercises containing these terms
    const matches = exerciseIds.filter(id => {
      const idLower = id.toLowerCase();
      const terms = searchTerms.split(' ');
      return terms.some(term => idLower.includes(term));
    });
    
    if (matches.length > 0) {
      console.log(`  ${gifName} -> Possible matches:`, matches.slice(0, 3));
      
      // Pick the best match
      const bestMatch = matches.find(m => {
        const termCount = searchTerms.split(' ').filter(term => m.includes(term)).length;
        return termCount >= 2;
      }) || matches[0];
      
      additionalMappings.push({
        exerciseId: bestMatch,
        gif: `${gifName}.gif`,
        category: category
      });
    }
  }
}

// Generate additional implementation script
const additionalScript = `const path = require('path');
const { SafeGifImplementation } = require('./safeGifImplementation.ts');

// Additional mappings found
const additionalMappings = ${JSON.stringify(additionalMappings, null, 2)};

async function implementAdditionalGifs() {
  const safe = new SafeGifImplementation();
  
  console.log(\`Implementing \${additionalMappings.length} additional GIFs...\`);
  
  if (!safe.createBackup()) {
    console.error('Failed to create backup.');
    return;
  }

  const successful = [];
  const failed = [];

  for (const mapping of additionalMappings) {
    const sourcePath = \`/mnt/c/Users/danny/Downloads/\${mapping.category} exercises/\${mapping.gif}\`;
    const destPath = \`./assets/exercise-gifs/\${mapping.category}/\${mapping.gif}\`;
    
    console.log(\`\\nProcessing: \${mapping.exerciseId} -> \${mapping.gif}\`);
    
    // Check if already done
    const dbContent = require('fs').readFileSync(safe.databasePath, 'utf-8');
    if (dbContent.includes(\`'\${destPath}'\`)) {
      console.log('  ⏭️  Already updated');
      continue;
    }
    
    if (!safe.verifyGifExists(sourcePath)) {
      console.log(\`  ❌ Source not found\`);
      failed.push(mapping);
      continue;
    }

    const absoluteDestPath = path.join(__dirname, '..', destPath);
    if (safe.copyGifFile(sourcePath, absoluteDestPath)) {
      console.log(\`  ✅ Copied GIF\`);
      
      if (safe.updateExerciseGif(mapping.exerciseId, destPath)) {
        console.log(\`  ✅ Updated database\`);
        successful.push(mapping);
      } else {
        console.log(\`  ❌ Failed to update database\`);
        failed.push(mapping);
      }
    } else {
      console.log(\`  ❌ Failed to copy\`);
      failed.push(mapping);
    }
  }

  console.log(\`\\n=== Summary ===\`);
  console.log(\`✅ Successful: \${successful.length}\`);
  console.log(\`❌ Failed: \${failed.length}\`);
}

implementAdditionalGifs();
`;

fs.writeFileSync(path.join(__dirname, 'implementAdditionalGifs.js'), additionalScript);
console.log(`\nFound ${additionalMappings.length} additional mappings`);
console.log('Created implementAdditionalGifs.js');