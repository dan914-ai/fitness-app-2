const fs = require('fs');
const path = require('path');

// Load all the required modules
const { BODYBUILDING_PROGRAMS } = require('../src/data/bodybuildingPrograms');
const { POWERLIFTING_PROGRAMS } = require('../src/data/powerliftingPrograms');
const { KOREAN_BEGINNER_PROGRAM } = require('../src/data/koreanBeginnerProgram');
const { additionalPrograms } = require('../src/data/additionalPrograms');
const { exercises: exerciseDB } = require('../src/data/exerciseDatabase');

// Load the converter
const programConverterPath = '../src/utils/programConverter';
const programConverter = fs.readFileSync(path.join(__dirname, programConverterPath + '.ts'), 'utf-8');

// Extract EXERCISE_NAME_MAPPINGS from the converter file
const mappingsMatch = programConverter.match(/const EXERCISE_NAME_MAPPINGS[^{]*{([^}]+(?:{[^}]*}[^}]*)*)}[^}]*}/s);
const mappingsContent = mappingsMatch ? mappingsMatch[0] : '';

// Extract all exercise names from mappings
const exerciseMappings = [];
const lines = mappingsContent.split('\n');
lines.forEach(line => {
  const match = line.match(/"([^"]+)":\s*{.*koreanName:\s*"([^"]+)"/);
  if (match) {
    exerciseMappings.push({
      english: match[1],
      korean: match[2]
    });
  }
});

// Combine all programs
const ALL_PROGRAMS = [
  KOREAN_BEGINNER_PROGRAM,
  ...POWERLIFTING_PROGRAMS,
  ...BODYBUILDING_PROGRAMS,
  ...additionalPrograms
];

console.log('========================================');
console.log('COMPREHENSIVE PROGRAM SCAN REPORT');
console.log('========================================\n');

// Statistics
let totalPrograms = ALL_PROGRAMS.length;
let totalDays = 0;
let totalExercises = 0;
let unmappedExercises = new Set();
let missingInDatabase = new Set();
let successfulMappings = new Set();

// Scan each program
console.log('SCANNING PROGRAMS...\n');

ALL_PROGRAMS.forEach((program, index) => {
  console.log(`[${index + 1}/${totalPrograms}] ${program.program_name || program.name}`);
  console.log(`  Discipline: ${program.discipline || 'N/A'}`);
  console.log(`  Level: ${program.experience_level || program.difficulty || 'N/A'}`);
  
  const workoutPlan = program.weekly_workout_plan || program.workouts || [];
  console.log(`  Days: ${workoutPlan.length}`);
  totalDays += workoutPlan.length;
  
  let programExerciseCount = 0;
  let programIssues = [];
  
  workoutPlan.forEach((day, dayIndex) => {
    const dayNum = day.day || dayIndex + 1;
    const dayFocus = day.focus || day.name || `Day ${dayNum}`;
    const exercises = day.exercises || [];
    
    exercises.forEach(exercise => {
      programExerciseCount++;
      totalExercises++;
      
      const exerciseName = exercise.exercise_name || exercise.name;
      
      // Check if exercise is in mappings
      const mapping = exerciseMappings.find(m => m.english === exerciseName);
      if (!mapping) {
        unmappedExercises.add(exerciseName);
        programIssues.push(`    Day ${dayNum} (${dayFocus}): "${exerciseName}" - NO MAPPING`);
      } else {
        // Check if Korean name exists in database
        const inDB = exerciseDB.find(e => e.name === mapping.korean);
        if (!inDB) {
          missingInDatabase.add(`${exerciseName} → ${mapping.korean}`);
          programIssues.push(`    Day ${dayNum} (${dayFocus}): "${exerciseName}" → "${mapping.korean}" - NOT IN DB`);
        } else {
          successfulMappings.add(exerciseName);
        }
      }
      
      // Check for invalid sets/reps
      if (!exercise.sets || exercise.sets <= 0) {
        programIssues.push(`    Day ${dayNum}: "${exerciseName}" - INVALID SETS: ${exercise.sets}`);
      }
      if (!exercise.reps) {
        programIssues.push(`    Day ${dayNum}: "${exerciseName}" - MISSING REPS`);
      }
    });
  });
  
  console.log(`  Exercises: ${programExerciseCount}`);
  if (programIssues.length > 0) {
    console.log('  ⚠️  ISSUES FOUND:');
    programIssues.forEach(issue => console.log(issue));
  } else {
    console.log('  ✅ All exercises mapped successfully');
  }
  console.log('');
});

// Summary Report
console.log('========================================');
console.log('SUMMARY REPORT');
console.log('========================================\n');

console.log(`Total Programs: ${totalPrograms}`);
console.log(`Total Workout Days: ${totalDays}`);
console.log(`Total Exercises: ${totalExercises}`);
console.log(`Successfully Mapped: ${successfulMappings.size}`);
console.log(`Unmapped Exercises: ${unmappedExercises.size}`);
console.log(`Missing in Database: ${missingInDatabase.size}`);
console.log('');

if (unmappedExercises.size > 0) {
  console.log('❌ EXERCISES WITHOUT MAPPINGS:');
  Array.from(unmappedExercises).sort().forEach(exercise => {
    console.log(`  - "${exercise}"`);
  });
  console.log('');
}

if (missingInDatabase.size > 0) {
  console.log('❌ MAPPED BUT NOT IN DATABASE:');
  Array.from(missingInDatabase).sort().forEach(mapping => {
    console.log(`  - ${mapping}`);
  });
  console.log('');
}

// Check for duplicate exercises in database
console.log('CHECKING FOR DUPLICATE EXERCISES IN DATABASE...');
const nameCount = {};
exerciseDB.forEach(exercise => {
  const name = exercise.name;
  nameCount[name] = (nameCount[name] || 0) + 1;
});

const duplicates = Object.entries(nameCount).filter(([name, count]) => count > 1);
if (duplicates.length > 0) {
  console.log('⚠️  DUPLICATE EXERCISE NAMES FOUND:');
  duplicates.forEach(([name, count]) => {
    console.log(`  - "${name}" appears ${count} times`);
  });
} else {
  console.log('✅ No duplicate exercise names found');
}

console.log('\n========================================');
console.log('SCAN COMPLETE');
console.log('========================================');

// Exit with error code if issues found
if (unmappedExercises.size > 0 || missingInDatabase.size > 0) {
  process.exit(1);
} else {
  console.log('\n✅ All programs are properly configured!');
  process.exit(0);
}