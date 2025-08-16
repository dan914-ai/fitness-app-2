// Script to generate complete exercise list
const db = require('./src/data/exerciseDatabase.ts');
const fs = require('fs');
const exercises = db.default;

// Sort by ID
const sorted = exercises.sort((a, b) => a.id - b.id);

let output = '# Complete Exercise Database List\n\n';
output += `## Total Exercises: ${exercises.length}\n\n`;
output += '## All Exercises (Sorted by ID)\n\n';
output += '| ID | Korean Name | English Name | Muscle Group | Category | Difficulty |\n';
output += '|----|-------------|--------------|--------------|----------|------------|\n';

sorted.forEach(ex => {
  const koreanName = ex.name || '-';
  const englishName = ex.englishName || '-';
  const muscleGroup = ex.muscleGroup || '-';
  const category = ex.category || '-';
  const difficulty = ex.difficulty || '-';
  
  output += `| ${ex.id} | ${koreanName} | ${englishName} | ${muscleGroup} | ${category} | ${difficulty} |\n`;
});

// Group by muscle group
output += '\n## Exercises by Muscle Group\n\n';

const muscleGroups = {};
exercises.forEach(ex => {
  const group = ex.muscleGroup || 'Other';
  if (!muscleGroups[group]) {
    muscleGroups[group] = [];
  }
  muscleGroups[group].push(ex);
});

Object.keys(muscleGroups).sort().forEach(group => {
  output += `### ${group} (${muscleGroups[group].length} exercises)\n\n`;
  muscleGroups[group]
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(ex => {
      output += `- **${ex.name}** (${ex.englishName}) - ID: ${ex.id}\n`;
    });
  output += '\n';
});

// Group by difficulty
output += '## Exercises by Difficulty\n\n';

const difficulties = {};
exercises.forEach(ex => {
  const diff = ex.difficulty || 'unspecified';
  if (!difficulties[diff]) {
    difficulties[diff] = [];
  }
  difficulties[diff].push(ex);
});

['beginner', 'intermediate', 'advanced', 'unspecified'].forEach(diff => {
  if (difficulties[diff]) {
    output += `### ${diff.charAt(0).toUpperCase() + diff.slice(1)} (${difficulties[diff].length} exercises)\n\n`;
    difficulties[diff]
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(ex => {
        output += `- **${ex.name}** (${ex.englishName}) - ${ex.muscleGroup || 'N/A'}\n`;
      });
    output += '\n';
  }
});

// Write to file
fs.writeFileSync('exercise-list-complete.md', output);
console.log('✅ Exercise list saved to exercise-list-complete.md');
console.log(`📊 Total exercises: ${exercises.length}`);

// Also create a simple text list
let simpleList = 'COMPLETE EXERCISE LIST\n';
simpleList += '======================\n\n';
sorted.forEach(ex => {
  simpleList += `${ex.id}. ${ex.name} (${ex.englishName})\n`;
});

fs.writeFileSync('exercise-list-simple.txt', simpleList);
console.log('✅ Simple list saved to exercise-list-simple.txt');