// Converter to transform professional program data into our app's format
import { WorkoutProgramData } from '../data/programTypes';
import { PROFESSIONAL_PROGRAMS } from '../data/programsData';
import { WorkoutProgram, WorkoutDay, ProgramExercise } from '../services/workoutPrograms.service';
import { exerciseDatabaseService } from '../services/exerciseDatabase.service';

// Exercise name mappings (English to Korean and to database IDs)
const EXERCISE_NAME_MAPPINGS: Record<string, { koreanName: string; alternateNames?: string[] }> = {
  // Chest
  "Bench Press": { koreanName: "바벨 벤치 프레스", alternateNames: ["Barbell Bench Press", "Flat Bench Press"] },
  "Incline Barbell Press": { koreanName: "인클라인 바벨 벤치 프레스", alternateNames: ["Incline Bench Press"] },
  "Incline Dumbbell Press": { koreanName: "인클라인 덤벨 프레스" },
  "Incline Smith Machine Press": { koreanName: "인클라인 스미스 머신 프레스" },
  "Flat Dumbbell Press": { koreanName: "덤벨 벤치 프레스", alternateNames: ["Dumbbell Bench Press"] },
  "Decline Machine Press": { koreanName: "디클라인 머신 프레스" },
  "Cable Crossover": { koreanName: "케이블 크로스오버" },
  "Dips": { koreanName: "딥스", alternateNames: ["Dips (Chest-focused)", "Chest Dips"] },
  "Push-ups": { koreanName: "푸시업", alternateNames: ["Pushups", "Push Ups"] }, // Now we have the exact exercise!
  "Incline Push-ups": { koreanName: "인클라인 푸시업", alternateNames: ["Incline Push-ups (or Knee Push-ups)"] },
  "Close-Grip Bench Press": { koreanName: "클로즈 그립 벤치 프레스" },
  
  // Back
  "Pull-Ups": { koreanName: "풀업", alternateNames: ["Pull-Ups (or Lat Pulldown)", "Weighted Pull-Ups"] },
  "Pull-Ups (or Lat Pulldown)": { koreanName: "풀업" },
  "Lat Pulldown": { koreanName: "랫 풀다운", alternateNames: ["Wide Grip Pulldown"] },
  "Barbell Row": { koreanName: "바벨 로우", alternateNames: ["Bent-Over Row", "Bent Over Barbell Row"] },
  "Bent-Over Row": { koreanName: "바벨 로우" },
  "T-Bar Row": { koreanName: "T바 로우" },
  "Dumbbell Row": { koreanName: "덤벨 로우", alternateNames: ["One-Arm Dumbbell Row"] },
  "Seated Cable Row": { koreanName: "시티드 케이블 로우", alternateNames: ["Cable Row", "Seated Cable Row (Close Grip)"] },
  "Straight Arm Pulldown": { koreanName: "스트레이트 암 풀다운" },
  "Deadlift": { koreanName: "바벨 데드리프트", alternateNames: ["Conventional Deadlift", "데드리프트"] },
  "Romanian Deadlift": { koreanName: "루마니안 데드리프트", alternateNames: ["RDL"] },
  "Stiff-Legged Deadlift": { koreanName: "스티프 레그 데드리프트" },
  "Australian Rows": { koreanName: "인버티드 로우", alternateNames: ["Inverted Rows"] },
  "Australian Rows (Inverted Rows)": { koreanName: "인버티드 로우" },
  "Chin-Ups": { koreanName: "친업" },
  "Face Pulls": { koreanName: "페이스 풀" },
  
  // Shoulders
  "Overhead Press": { koreanName: "오버헤드 프레스", alternateNames: ["Military Press", "Barbell Shoulder Press", "Seated Overhead Press"] },
  "Dumbbell Shoulder Press": { koreanName: "덤벨 숄더 프레스", alternateNames: ["Seated Dumbbell Press"] },
  "Machine Shoulder Press": { koreanName: "머신 숄더 프레스" },
  "Arnold Press": { koreanName: "아놀드 프레스" },
  "Lateral Raise": { koreanName: "레터럴 레이즈", alternateNames: ["Side Lateral Raise", "Dumbbell Lateral Raise", "Lateral Raises"] },
  "Cable Rear Delt Fly": { koreanName: "케이블 리어 델트 플라이" },
  "Reverse Pec-Deck": { koreanName: "리버스 펙덱", alternateNames: ["Reverse Pec Deck"] },
  "Dumbbell Shrug": { koreanName: "덤벨 슈러그" },
  
  // Legs - Quads
  "Barbell Squat": { koreanName: "바벨 스쿼트", alternateNames: ["Back Squat"] }, // Fixed: Use actual barbell squat
  "Front Squat": { koreanName: "프론트 스쿼트", alternateNames: ["바벨 프론트 스쿼트"] },
  "Leg Press": { koreanName: "레그 프레스", alternateNames: ["Machine Leg Press"] },
  "Leg Extension": { koreanName: "레그 익스텐션" },
  "Bulgarian Split Squat": { koreanName: "불가리안 스플릿 스쿼트" },
  "Walking Lunge": { koreanName: "런지", alternateNames: ["Lunges", "바벨 런지"] }, // Fixed: Use actual lunge
  "Bodyweight Squats": { koreanName: "바디웨이트 스쿼트", alternateNames: ["Air Squats", "맨몸 스쿼트"] },
  "Squat": { koreanName: "바벨 스쿼트" }, // Default squat to barbell squat for weightlifting
  "Squats": { koreanName: "바벨 스쿼트" }, // Default squats to barbell squat for weightlifting
  
  // Legs - Hamstrings
  "Leg Curl": { koreanName: "레그 컬", alternateNames: ["Lying Leg Curl", "Seated Leg Curl"] },
  "Good Mornings": { koreanName: "굿모닝" },
  "Glute Kickback Machine": { koreanName: "글루트 킥백 머신" },
  
  // Arms - Biceps
  "Barbell Curl": { koreanName: "바벨 컬", alternateNames: ["Barbell Bicep Curl"] },
  "Incline Dumbbell Curl": { koreanName: "인클라인 덤벨 컬" },
  "Hammer Curl": { koreanName: "해머 컬" },
  "Bicep Curls (variation)": { koreanName: "바이셉 컬" },
  
  // Arms - Triceps
  "Triceps Pushdown": { koreanName: "트라이셉 푸시다운", alternateNames: ["Cable Triceps Pushdown"] },
  "Overhead Triceps Extension": { koreanName: "오버헤드 트라이셉 익스텐션", alternateNames: ["Triceps Extension (variation)"] },
  "Skull Crusher": { koreanName: "바벨 라잉 트라이셉 익스텐션", alternateNames: ["Lying Triceps Extension"] },
  
  // Calves
  "Calf Raise": { koreanName: "카프 레이즈", alternateNames: ["Standing Calf Raise"] },
  "Seated Calf Raise": { koreanName: "시티드 카프 레이즈" },
  
  // Core  
  "Plank": { koreanName: "플랭크", alternateNames: ["플랜크"] }, // Now we have the exact exercise!
  "Hanging Knee Raises": { koreanName: "행잉 레그 레이즈", alternateNames: ["Hanging Knee Raise", "Hanging Leg Raise"] }, // Now we have the exact exercise!
  "Ab Wheel Rollout": { koreanName: "앱 롤러", alternateNames: ["Ab Wheel", "Ab Roller"] }, // Now we have the exact exercise!
  
  // Variations for programs
  "Incline Push-ups": { koreanName: "인클라인 푸시업", alternateNames: ["Incline Push-ups (or Knee Push-ups)"] },
  "Australian Rows (Inverted Rows)": { koreanName: "인버티드 로우" },
  "Bench Press or Overhead Press": { koreanName: "바벨 벤치 프레스" }, // Default to bench press
  "Bench Press or Overhead Press (opposite of Monday)": { koreanName: "오버헤드 프레스" }, // Default to overhead
  
  // Olympic/Power
  "Power Clean": { koreanName: "클린 앤 프레스", alternateNames: ["Power Clean or Power Snatch"] }, // Using clean and press as alternative
  "Power Snatch": { koreanName: "클린 앤 프레스" }, // Using clean and press as alternative
  "Power Clean or Power Snatch": { koreanName: "클린 앤 프레스" } // Using clean and press as alternative
};

// Find exercise ID by name (searches both English and Korean names)
function findExerciseId(exerciseName: string): string | null {
  // First try exact match with our mapping
  const mapping = EXERCISE_NAME_MAPPINGS[exerciseName];
  if (mapping) {
    // Search by Korean name in database
    const exercise = exerciseDatabaseService.getExerciseByName(mapping.koreanName);
    if (exercise) return exercise.exerciseId;
    
    // Try alternate names
    if (mapping.alternateNames) {
      for (const altName of mapping.alternateNames) {
        const altExercise = exerciseDatabaseService.getExerciseByName(altName);
        if (altExercise) return altExercise.exerciseId;
      }
    }
  }
  
  // Try direct search in database (in case the name is already in the database)
  const directSearch = exerciseDatabaseService.getExerciseByName(exerciseName);
  if (directSearch) return directSearch.exerciseId;
  
  // Try searching using detailed exercises (has englishName)
  const allExercisesWithDetails = exerciseDatabaseService.getAllExercisesWithDetails();
  const found = allExercisesWithDetails.find(ex => {
    if (!ex) return false;
    const koreanMatch = ex.koreanName && ex.koreanName.toLowerCase() === exerciseName.toLowerCase();
    const englishMatch = ex.englishName && ex.englishName.toLowerCase() === exerciseName.toLowerCase();
    return koreanMatch || englishMatch;
  });
  
  if (found) return found.exerciseId;
  
  // Try partial match
  const partialMatch = allExercisesWithDetails.find(ex => {
    if (!ex) return false;
    const searchLower = exerciseName.toLowerCase();
    const koreanIncludes = ex.koreanName && ex.koreanName.toLowerCase().includes(searchLower);
    const englishIncludes = ex.englishName && ex.englishName.toLowerCase().includes(searchLower);
    return koreanIncludes || englishIncludes;
  });
  
  if (partialMatch) return partialMatch.exerciseId;
  
  console.warn(`Exercise not found in database: ${exerciseName}`);
  return null;
}

// Convert rest period string to seconds
function parseRestPeriod(restPeriod: string): number {
  // Handle formats like "2-3", "1.5-2", "3-5", etc.
  const parts = restPeriod.split('-');
  const maxMinutes = parseFloat(parts[parts.length - 1]);
  return Math.round(maxMinutes * 60); // Convert to seconds
}

// Convert a professional program to our app's format
export function convertProgramToAppFormat(programData: WorkoutProgramData): Omit<WorkoutProgram, 'id' | 'createdAt'> {
  const workoutDays: WorkoutDay[] = [];
  
  programData.weekly_workout_plan.forEach((day, index) => {
    const dayNumber = typeof day.day === 'number' ? day.day : index + 1;
    const dayName = day.focus;
    
    const exercises: ProgramExercise[] = [];
    
    day.exercises.forEach(exercise => {
      const exerciseId = findExerciseId(exercise.exercise_name);
      if (exerciseId) {
        // Get the Korean name from the database
        const dbExercise = exerciseDatabaseService.getExerciseById(exerciseId);
        const koreanName = dbExercise?.exerciseName || exercise.exercise_name; // Fixed: use exerciseName property
        
        exercises.push({
          exerciseId,
          exerciseName: koreanName, // Use Korean name
          sets: exercise.sets,
          reps: exercise.reps,
          restTime: parseRestPeriod(exercise.rest_period_minutes),
          notes: exercise.notes
        });
      } else {
        // Skip exercises that can't be mapped, but continue with others
        console.warn(`Skipping exercise "${exercise.exercise_name}" - not found in database`);
      }
    });
    
    workoutDays.push({
      dayNumber,
      name: dayName,
      exercises,
      restDay: exercises.length === 0
    });
  });
  
  // Map difficulty levels
  const difficultyMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
    'Beginner': 'beginner',
    'Intermediate': 'intermediate',
    'Advanced': 'advanced'
  };
  
  return {
    name: programData.program_name,
    description: programData.program_description,
    duration: extractWeeks(programData.weekly_schedule_summary),
    difficulty: difficultyMap[programData.experience_level] || 'intermediate',
    category: programData.discipline,
    workoutDays,
    isCustom: false,
    isActive: false
  };
}

// Extract number of weeks from schedule summary
function extractWeeks(scheduleSummary: string): number {
  // Look for patterns like "8 weeks", "12-week", etc.
  const match = scheduleSummary.match(/(\d+)\s*(?:weeks?|day)/i);
  if (match) {
    const num = parseInt(match[1]);
    // If it mentions days and is less than 7, assume it's a weekly program
    if (scheduleSummary.toLowerCase().includes('day') && num <= 7) {
      return 4; // Default 4-week program for daily schedules
    }
    return num;
  }
  return 8; // Default 8 weeks if not specified
}

// Convert all professional programs
export function convertAllPrograms(): Array<Omit<WorkoutProgram, 'id' | 'createdAt'>> {
  const converted: Array<Omit<WorkoutProgram, 'id' | 'createdAt'>> = [];
  
  for (const program of PROFESSIONAL_PROGRAMS) {
    try {
      const convertedProgram = convertProgramToAppFormat(program);
      converted.push(convertedProgram);
    } catch (error) {
      console.error(`[programConverter] Error converting program ${program.program_name}:`, error);
    }
  }
  
  return converted;
}

// Get a specific converted program by name
export function getConvertedProgramByName(name: string): Omit<WorkoutProgram, 'id' | 'createdAt'> | null {
  const program = PROFESSIONAL_PROGRAMS.find(p => p.program_name === name);
  if (!program) return null;
  return convertProgramToAppFormat(program);
}