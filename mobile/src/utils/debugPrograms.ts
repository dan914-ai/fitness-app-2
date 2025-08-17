import { exerciseDatabaseService } from '../services/exerciseDatabase.service';
import { convertAllPrograms } from './programConverter';
import { PROFESSIONAL_PROGRAMS } from '../data/programsData';

export function debugProgramConversion() {
  console.log('=== DEBUG: Program Conversion ===');
  
  // Test getExerciseByName
  console.log('\n1. Testing getExerciseByName:');
  const testNames = ['바벨 스쿼트', '바디웨이트 스쿼트', 'Barbell Squat', 'Walking Lunge', '바벨 런지'];
  
  testNames.forEach(name => {
    const exercise = exerciseDatabaseService.getExerciseByName(name);
    if (exercise) {
      console.log(`  "${name}" -> ID: ${exercise.exerciseId}, Name: ${exercise.exerciseName}`);
    } else {
      console.log(`  "${name}" -> NOT FOUND`);
    }
  });
  
  // Check what squats are in the database
  console.log('\n2. All squat exercises in database:');
  const allExercises = exerciseDatabaseService.getAllExercisesWithDetails();
  const squatExercises = allExercises.filter(ex => 
    ex && (ex.koreanName?.includes('스쿼트') || ex.englishName?.toLowerCase().includes('squat'))
  );
  
  squatExercises.slice(0, 10).forEach(ex => {
    console.log(`  ID: ${ex.exerciseId}, Korean: ${ex.koreanName}, English: ${ex.englishName}, Equipment: ${ex.equipment}`);
  });
  
  // Check PPL program source
  console.log('\n3. PPL Program Source Data:');
  const pplProgram = PROFESSIONAL_PROGRAMS.find(p => p.program_name.includes('PPL'));
  if (pplProgram) {
    const legsDay = pplProgram.weekly_workout_plan.find(d => d.focus.includes('Legs A'));
    if (legsDay) {
      console.log('  Legs A exercises from source:');
      legsDay.exercises.forEach(ex => {
        console.log(`    - ${ex.exercise_name}`);
      });
    }
  }
  
  // Convert and check
  console.log('\n4. Converting programs:');
  const converted = convertAllPrograms();
  const convertedPPL = converted.find(p => p.name.includes('PPL'));
  if (convertedPPL) {
    const legsDay = convertedPPL.workoutDays.find(d => d.name.includes('Legs A'));
    if (legsDay) {
      console.log('  Converted Legs A exercises:');
      legsDay.exercises.forEach(ex => {
        console.log(`    - ID: ${ex.exerciseId}, Name: ${ex.exerciseName}`);
      });
    }
  }
  
  return { testNames, squatExercises, converted };
}