// Test thumbnail mapping
const exerciseDatabase = require('./src/data/exerciseDatabase.ts').exerciseDatabase;

// Get all abdominal exercises
const abdominalExercises = exerciseDatabase.filter(ex => ex.muscleGroup === '복근');

console.log('Total abdominal exercises:', abdominalExercises.length);
console.log('\nAbdominal exercise IDs:');
abdominalExercises.forEach(ex => {
  console.log(`ID: ${ex.id}, Name: ${ex.name}`);
  console.log(`  Current URL: ${ex.thumbnailUrl || ex.imageUrl}`);
});

// Check which IDs we're mapping
const mappedIds = [
  '1', '2', '3', '4', '5',
  '348', '349', '350', '351', '352', '353', '354', '355', '356', '357',
  '358', '359', '360', '361', '362', '363', '365', '366', '367'
];

console.log('\n\nChecking mapped IDs:');
mappedIds.forEach(id => {
  const exercise = exerciseDatabase.find(ex => ex.id.toString() === id);
  if (exercise) {
    console.log(`✓ ID ${id}: ${exercise.name} (${exercise.muscleGroup})`);
  } else {
    console.log(`✗ ID ${id}: NOT FOUND`);
  }
});