import { exerciseDatabaseService } from '../services/exerciseDatabase.service';
import { convertAllPrograms } from './programConverter';
import { PROFESSIONAL_PROGRAMS } from '../data/programsData';

export function debugProgramConversion() {
  // Test getExerciseByName
  const testNames = ['바벨 스쿼트', '바디웨이트 스쿼트', 'Barbell Squat', 'Walking Lunge', '바벨 런지'];
  
  testNames.forEach(name => {
    const exercise = exerciseDatabaseService.getExerciseByName(name);
    // Process exercise data silently
  });
  
  // Check what squats are in the database
  const allExercises = exerciseDatabaseService.getAllExercisesWithDetails();
  const squatExercises = allExercises.filter(ex => 
    ex && (ex.koreanName?.includes('스쿼트') || ex.englishName?.toLowerCase().includes('squat'))
  );
  
  // Check PPL program source
  const pplProgram = PROFESSIONAL_PROGRAMS.find(p => p.program_name.includes('PPL'));
  if (pplProgram) {
    const legsDay = pplProgram.weekly_workout_plan.find(d => d.focus.includes('Legs A'));
    if (legsDay) {
      // Process legs day exercises silently
    }
  }
  
  // Convert and check
  const converted = convertAllPrograms();
  const convertedPPL = converted.find(p => p.name.includes('PPL'));
  if (convertedPPL) {
    const legsDay = convertedPPL.workoutDays.find(d => d.name.includes('Legs A'));
    if (legsDay) {
      // Process converted exercises silently
    }
  }
  
  return { testNames, squatExercises, converted };
}