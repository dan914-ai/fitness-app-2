// Test which exercises can't be found
const exerciseNames = [
  "Ab Wheel Rollout",
  "Arnold Press",
  "Australian Rows (Inverted Rows)",
  "Barbell Curl",
  "Barbell Row",
  "Barbell Squat",
  "Bench Press",
  "Bench Press or Overhead Press",
  "Bench Press or Overhead Press (opposite of Monday)",
  "Bench Press or Overhead Press (same as Monday)",
  "Bent-Over Row",
  "Bicep Curls (variation)",
  "Bodyweight Squats",
  "Bulgarian Split Squat",
  "Cable Crossover",
  "Cable Rear Delt Fly",
  "Calf Raise",
  "Chin-Ups",
  "Close-Grip Bench Press",
  "Deadlift",
  "Decline Machine Press",
  "Dips (Chest-focused)",
  "Dumbbell Lateral Raise",
  "Dumbbell Row",
  "Dumbbell Shoulder Press",
  "Dumbbell Shrug",
  "Face Pulls",
  "Flat Dumbbell Press",
  "Front Squat",
  "Glute Kickback Machine",
  "Good Mornings",
  "Hammer Curl",
  "Hanging Knee Raises",
  "Incline Barbell Press",
  "Incline Dumbbell Curl",
  "Incline Dumbbell Press",
  "Incline Push-ups (or Knee Push-ups)",
  "Incline Smith Machine Press",
  "Lat Pulldown",
  "Lateral Raise",
  "Lateral Raises",
  "Leg Curl",
  "Leg Extension",
  "Leg Press",
  "Lying Leg Curl",
  "Machine Shoulder Press",
  "Overhead Press",
  "Overhead Triceps Extension",
  "Plank",
  "Power Clean or Power Snatch",
  "Pull-Ups (or Lat Pulldown)",
  "Push-ups",
  "Reverse Pec-Deck",
  "Romanian Deadlift",
  "Seated Cable Row",
  "Seated Cable Row (Close Grip)",
  "Seated Calf Raise",
  "Seated Dumbbell Press",
  "Seated Leg Curl",
  "Seated Overhead Press",
  "Skull Crusher",
  "Squat",
  "Squats",
  "Stiff-Legged Deadlift",
  "Straight Arm Pulldown",
  "T-Bar Row",
  "Triceps Extension (variation)",
  "Triceps Pushdown",
  "Walking Lunge",
  "Weighted Pull-Ups",
  "Wide Grip Pulldown"
];

const db = require('./src/data/exerciseDatabase.ts');
const exercises = db.default;

console.log('Checking exercise mappings...\n');
console.log('MISSING EXERCISES (not in database):');
console.log('=====================================');

const missing = [];
const found = [];

exerciseNames.forEach(name => {
  // Try to find in database
  let foundExercise = false;
  
  // Check exact match
  const exactMatch = exercises.find(ex => 
    ex.englishName?.toLowerCase() === name.toLowerCase() ||
    ex.name === name
  );
  
  if (exactMatch) {
    found.push(`✅ "${name}" -> ID ${exactMatch.id}: ${exactMatch.name}`);
    foundExercise = true;
  } else {
    // Try partial match
    const partialMatch = exercises.find(ex => {
      const searchLower = name.toLowerCase();
      return ex.englishName?.toLowerCase().includes(searchLower.split(' ')[0]) ||
             ex.name.toLowerCase().includes(searchLower.split(' ')[0]);
    });
    
    if (partialMatch) {
      found.push(`⚠️  "${name}" -> Partial match: ID ${partialMatch.id}: ${partialMatch.name}`);
      foundExercise = true;
    }
  }
  
  if (!foundExercise) {
    missing.push(`❌ "${name}"`);
  }
});

missing.forEach(m => console.log(m));

console.log('\n\nFOUND EXERCISES:');
console.log('================');
found.forEach(f => console.log(f));

console.log('\n\nSUMMARY:');
console.log(`Found: ${found.length}/${exerciseNames.length}`);
console.log(`Missing: ${missing.length}/${exerciseNames.length}`);