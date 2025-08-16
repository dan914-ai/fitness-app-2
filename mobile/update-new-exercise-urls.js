// Update exercise URLs in database to use proper English filenames
const fs = require('fs');

const urlMappings = {
  "45도-익스텐션": "45-degree-extension",
  "ab-롤러": "ab-roller", 
  "디클라인-싯업": "decline-sit-up",
  "레그-레이즈": "leg-raise",
  "마운틴-클라이머": "mountain-climber",
  "머신-크런치": "machine-crunch",
  "바이시클-크런치": "bicycle-crunch",
  "사이드-플랭크": "side-plank",
  "싯-업": "sit-up",
  "중량-러시안-트위스트": "weighted-russian-twist",
  "중량-케이블-크런치": "weighted-cable-crunch",
  "중량-플랭크": "weighted-plank",
  "캡틴스-체어-니-레이즈": "captains-chair-knee-raise",
  "크런치": "crunch",
  "크로스-바디-크런치": "cross-body-crunch",
  "토즈-투-바": "toes-to-bar",
  "푸시업": "push-up",
  "플랭크": "plank",
  "플러터-킥": "flutter-kick",
  "행잉-레그-레이즈": "hanging-leg-raise"
};

// Read the current database file
let content = fs.readFileSync('./src/data/exerciseDatabase.ts', 'utf8');

// Replace all the URLs
Object.entries(urlMappings).forEach(([korean, english]) => {
  const koreanUrl = `abdominals/${korean}.gif`;
  const englishUrl = `abdominals/${english}.gif`;
  
  // Special case for push-up which goes to pectorals folder
  if (korean === "푸시업") {
    content = content.replace(
      /abdominals\/푸시업\.gif/g,
      `pectorals/${english}.gif`
    );
  } else {
    content = content.replace(
      new RegExp(koreanUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      englishUrl
    );
  }
});

// Write back to file
fs.writeFileSync('./src/data/exerciseDatabase.ts', content);
console.log('✅ Updated all exercise URLs to use English filenames');

// Create a rename script for the actual files
let renameScript = '#!/bin/bash\n';
renameScript += 'cd "/mnt/c/Users/PW1234/.vscode/new finess app/new exercises"\n\n';

Object.entries(urlMappings).forEach(([korean, english]) => {
  const koreanFile = korean.replace(/-/g, ' ');
  renameScript += `mv "${koreanFile}.gif" "${english}.gif"\n`;
});

fs.writeFileSync('./rename-exercise-files.sh', renameScript);
console.log('✅ Created rename script: rename-exercise-files.sh');