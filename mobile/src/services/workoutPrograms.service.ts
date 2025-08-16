import AsyncStorage from '@react-native-async-storage/async-storage';
import { routinesService, Routine } from './routines.service';
import { exerciseDatabaseService } from './exerciseDatabase.service';
import { convertAllPrograms } from '../utils/programConverter';
import { safeJsonParse, safeJsonStringify } from '../utils/safeJsonParse';

const PROGRAMS_STORAGE_KEY = '@workout_programs';
const ACTIVE_PROGRAM_KEY = '@active_program';

export interface WorkoutDay {
  dayNumber: number;
  name: string;
  exercises: ProgramExercise[];
  restDay: boolean;
}

export interface ProgramExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  restTime: number;
  notes?: string;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  duration: number; // weeks
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  workoutDays: WorkoutDay[];
  isCustom: boolean;
  isActive: boolean;
  createdAt: string;
  currentWeek?: number;
  currentDay?: number;
}

class WorkoutProgramsService {
  private programs: WorkoutProgram[] = [];
  private activeProgram: WorkoutProgram | null = null;

  constructor() {
    this.loadPrograms();
  }

  async loadPrograms(): Promise<void> {
    try {
      const storedPrograms = await AsyncStorage.getItem(PROGRAMS_STORAGE_KEY);
      if (storedPrograms) {
        this.programs = safeJsonParse(storedPrograms, []);
      } else {
        // Initialize with default programs (Korean beginner program)
        this.programs = this.getDefaultPrograms();
        await this.savePrograms();
      }

      // Load active program
      const activeProgramId = await AsyncStorage.getItem(ACTIVE_PROGRAM_KEY);
      if (activeProgramId) {
        this.activeProgram = this.programs.find(p => p.id === activeProgramId) || null;
      }
    } catch (error) {
      console.error('Error loading programs:', error);
      this.programs = this.getDefaultPrograms();
    }
  }

  private getDefaultPrograms(): WorkoutProgram[] {
    let programsWithMetadata: WorkoutProgram[] = [];
    
    try {
      // Get the professional programs and convert them
      const professionalPrograms = convertAllPrograms();
      
      if (professionalPrograms.length > 0) {
        console.log(`[workoutPrograms.service] Loading ${professionalPrograms.length} professional programs`);
        // Add IDs and createdAt dates to the converted programs
        programsWithMetadata = professionalPrograms.map((program, index) => ({
          ...program,
          id: `program-${Date.now()}-${index}`,
          createdAt: new Date().toISOString()
        }));
      } else {
        console.warn('[workoutPrograms.service] No professional programs found');
      }
    } catch (error) {
      console.error('[workoutPrograms.service] Error converting programs:', error);
    }
    
    console.log(`[workoutPrograms.service] Returning ${programsWithMetadata.length} programs`);
    return programsWithMetadata;
  }

  async savePrograms(): Promise<void> {
    try {
      await AsyncStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(this.programs));
    } catch (error) {
      console.error('Error saving programs:', error);
    }
  }

  async getAllPrograms(): Promise<WorkoutProgram[]> {
    if (this.programs.length === 0) {
      await this.loadPrograms();
    }
    return this.programs;
    
    // ORIGINAL CODE - DISABLED
    // await this.loadPrograms();
    // return this.programs;
  }

  async getActiveProgram(): Promise<WorkoutProgram | null> {
    return this.activeProgram;
    
    // ORIGINAL CODE - DISABLED
    // await this.loadPrograms();
    // return this.activeProgram;
  }

  async activateProgram(programId: string): Promise<boolean> {
    console.log('🚀 activateProgram called with ID:', programId);
    try {
      await this.loadPrograms();
      console.log('📚 Programs loaded:', this.programs.length);
      
      // Deactivate all programs
      this.programs = this.programs.map(p => ({ ...p, isActive: false }));
      
      // Activate the selected program
      const programIndex = this.programs.findIndex(p => p.id === programId);
      if (programIndex === -1) {
        console.error('❌ Program not found with ID:', programId);
        return false;
      }

      console.log('✅ Found program:', this.programs[programIndex].name);
      this.programs[programIndex].isActive = true;
      this.programs[programIndex].currentWeek = 1;
      this.programs[programIndex].currentDay = 1;
      this.activeProgram = this.programs[programIndex];

      console.log('💾 Saving programs...');
      await this.savePrograms();
      await AsyncStorage.setItem(ACTIVE_PROGRAM_KEY, programId);

      // Create routines from the program
      console.log('🏋️ Creating routines from program...');
      await this.createRoutinesFromProgram(this.programs[programIndex]);

      console.log('✅ Program activated successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error activating program:', error);
      return false;
    }
  }

  async deactivateProgram(): Promise<void> {
    try {
      await this.loadPrograms();
      
      // Deactivate all programs
      this.programs = this.programs.map(p => ({ ...p, isActive: false }));
      this.activeProgram = null;

      await this.savePrograms();
      await AsyncStorage.removeItem(ACTIVE_PROGRAM_KEY);
    } catch (error) {
      console.error('Error deactivating program:', error);
    }
  }

  async createRoutinesFromProgram(program: WorkoutProgram): Promise<void> {
    console.log('📝 createRoutinesFromProgram called for:', program.name);
    console.log('📅 Workout days:', program.workoutDays?.length || 0);
    try {
      // Create a routine for each workout day in the program
      for (const day of program.workoutDays) {
        console.log(`  Processing day ${day.dayNumber}: ${day.name}`);
        if (day.restDay) {
          console.log('    Skipping rest day');
          continue;
        }

        const routineName = `${program.name} - ${day.name}`;
        console.log(`    Creating routine: ${routineName}`);
        
        // Check if routine already exists
        const existingRoutines = await routinesService.getAllRoutines();
        console.log(`    Existing routines count: ${existingRoutines.length}`);
        const exists = existingRoutines.some(r => r.name === routineName);
        
        if (!exists) {
          console.log('    Routine does not exist, creating new...');
          // Create the routine
          const exercises = day.exercises.map(ex => {
            // Get Korean name from database
            const dbExercise = exerciseDatabaseService.getExerciseById(ex.exerciseId);
            const koreanName = dbExercise?.exerciseName || ex.exerciseName; // Fixed: use exerciseName property
            console.log(`      Exercise: ${ex.exerciseName} (ID: ${ex.exerciseId}) -> Korean: ${koreanName}`);
            
            return {
              id: ex.exerciseId,
              name: koreanName, // Use Korean name
              sets: Array.from({ length: ex.sets }, (_, i) => ({
                id: `set-${i}`,
                weight: '',
                reps: ex.reps.includes('-') ? ex.reps.split('-')[1] : ex.reps,
                completed: false,
                type: 'Normal' as const
              })),
              isCompleted: false,
              notes: ex.notes
            };
          });

          // Create a new routine object that matches the Routine interface
          const newRoutine = {
            id: `${program.id}-day-${day.dayNumber}`,
            name: routineName,
            description: day.name,
            targetMuscles: [...new Set(day.exercises.flatMap(ex => {
              const dbExercise = exerciseDatabaseService.getExerciseById(ex.exerciseId);
              return dbExercise?.targetMuscles?.primary || [];
            }))],
            duration: '45-60분',
            difficulty: program.difficulty,
            exercises: day.exercises.map(ex => {
              // Get Korean name from database
              const dbExercise = exerciseDatabaseService.getExerciseById(ex.exerciseId);
              const koreanName = dbExercise?.exerciseName || ex.exerciseName; // Fixed: use exerciseName property
              
              return {
                id: ex.exerciseId,
                name: koreanName, // Use Korean name
                targetMuscles: [],
                sets: ex.sets,
                reps: ex.reps,
                restTime: `${ex.restTime}초`,
                difficulty: program.difficulty,
              };
            }),
            isCustom: true,
            createdAt: new Date().toISOString(),
            programId: program.id,
            dayNumber: day.dayNumber
          };
          
          console.log('    Saving routine to storage...');
          await routinesService.saveRoutine(newRoutine);
          console.log('    ✅ Routine saved successfully!');
        } else {
          console.log('    Routine already exists, skipping...');
        }
      }
      console.log('✅ All routines created from program!');
    } catch (error) {
      console.error('❌ Error creating routines from program:', error);
    }
  }

  async createProgram(program: Omit<WorkoutProgram, 'id' | 'createdAt'>): Promise<WorkoutProgram> {
    const newProgram: WorkoutProgram = {
      ...program,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      isCustom: true,
      isActive: false
    };

    this.programs.push(newProgram);
    await this.savePrograms();
    return newProgram;
  }

  async updateProgram(programId: string, updates: Partial<WorkoutProgram>): Promise<boolean> {
    const programIndex = this.programs.findIndex(p => p.id === programId);
    if (programIndex === -1) {
      return false;
    }

    this.programs[programIndex] = {
      ...this.programs[programIndex],
      ...updates
    };

    await this.savePrograms();
    return true;
  }

  async deleteProgram(programId: string): Promise<boolean> {
    const program = this.programs.find(p => p.id === programId);
    if (!program || !program.isCustom) {
      return false; // Can't delete default programs
    }

    this.programs = this.programs.filter(p => p.id !== programId);
    
    if (this.activeProgram?.id === programId) {
      this.activeProgram = null;
      await AsyncStorage.removeItem(ACTIVE_PROGRAM_KEY);
    }

    await this.savePrograms();
    return true;
  }

  async getTodaysWorkout(): Promise<WorkoutDay | null> {
    if (!this.activeProgram) {
      return null;
    }

    const currentDay = this.activeProgram.currentDay || 1;
    return this.activeProgram.workoutDays.find(d => d.dayNumber === currentDay) || null;
  }

  async advanceToNextDay(): Promise<void> {
    if (!this.activeProgram) return;

    const currentDay = this.activeProgram.currentDay || 1;
    const totalDays = this.activeProgram.workoutDays.length;
    
    if (currentDay >= totalDays) {
      // Move to next week
      const currentWeek = this.activeProgram.currentWeek || 1;
      if (currentWeek >= this.activeProgram.duration) {
        // Program completed
        this.activeProgram.isActive = false;
        await this.deactivateProgram();
      } else {
        this.activeProgram.currentWeek = currentWeek + 1;
        this.activeProgram.currentDay = 1;
      }
    } else {
      this.activeProgram.currentDay = currentDay + 1;
    }

    await this.updateProgram(this.activeProgram.id, {
      currentWeek: this.activeProgram.currentWeek,
      currentDay: this.activeProgram.currentDay
    });
  }
}

export const workoutProgramsService = new WorkoutProgramsService();
export default workoutProgramsService;