// Simple workout session state management
// This will be replaced by proper backend integration later

type SetType = 'Normal' | 'Warmup' | 'Drop' | 'Failure';

interface WorkoutSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  restTime?: number;
  type: SetType;
}

interface ExerciseSession {
  exerciseId: string;
  sets: WorkoutSet[];
  isCompleted: boolean;
}

interface WorkoutSession {
  routineId: string;
  exercises: Record<string, ExerciseSession>;
  startTime: Date;
}

class WorkoutSessionManager {
  private currentSession: WorkoutSession | null = null;

  startSession(routineId: string): void {
    this.currentSession = {
      routineId,
      exercises: {},
      startTime: new Date(),
    };
  }

  getSession(): WorkoutSession | null {
    return this.currentSession;
  }

  initializeExercise(exerciseId: string, defaultSets: WorkoutSet[]): void {
    if (!this.currentSession) return;

    if (!this.currentSession.exercises[exerciseId]) {
      this.currentSession.exercises[exerciseId] = {
        exerciseId,
        sets: defaultSets,
        isCompleted: false,
      };
    }
  }

  updateExerciseSets(exerciseId: string, sets: WorkoutSet[]): void {
    if (!this.currentSession) return;

    if (this.currentSession.exercises[exerciseId]) {
      this.currentSession.exercises[exerciseId].sets = sets;
    }
  }

  getExerciseSets(exerciseId: string): WorkoutSet[] | null {
    if (!this.currentSession) return null;
    return this.currentSession.exercises[exerciseId]?.sets || null;
  }

  completeExercise(exerciseId: string): void {
    if (!this.currentSession) return;

    if (this.currentSession.exercises[exerciseId]) {
      this.currentSession.exercises[exerciseId].isCompleted = true;
    }
  }

  isExerciseCompleted(exerciseId: string): boolean {
    if (!this.currentSession) return false;
    return this.currentSession.exercises[exerciseId]?.isCompleted || false;
  }

  endSession(): void {
    this.currentSession = null;
  }

  getAllExerciseData(): Record<string, ExerciseSession> {
    return this.currentSession?.exercises || {};
  }
}

// Export singleton instance
export const workoutSessionManager = new WorkoutSessionManager();
export type { WorkoutSet, SetType };