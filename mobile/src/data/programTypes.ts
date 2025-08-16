// Program Type Definitions

export interface ProgramExerciseData {
  exercise_name: string;
  sets: number;
  reps: string;
  rest_period_minutes: string;
  notes?: string;
}

export interface WorkoutDayData {
  day: string | number;
  focus: string;
  exercises: ProgramExerciseData[];
}

export interface WorkoutProgramData {
  program_name: string;
  discipline: 'Bodybuilding' | 'Powerlifting' | 'Calisthenics' | 'Hybrid';
  experience_level: 'Beginner' | 'Intermediate' | 'Advanced';
  program_description: string;
  weekly_schedule_summary: string;
  periodization_model: string;
  program_source_notes?: string;
  weekly_workout_plan: WorkoutDayData[];
  program_notes?: string;
}