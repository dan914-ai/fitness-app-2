export interface Exercise {
  id: string;
  name: string;
  targetMuscles: string[];
  sets: number;
  reps: string;
  weight?: string;
  restTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  gifUrl?: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  targetMuscles: string[];
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: Exercise[];
}

// COMPLETELY EMPTY - NO MOCK ROUTINES AT ALL
export const mockRoutines: Record<string, Routine> = {};