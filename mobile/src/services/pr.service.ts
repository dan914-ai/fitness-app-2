import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  volume: number; // weight * reps
  date: string;
  previousRecord?: {
    weight: number;
    reps: number;
    volume: number;
    date: string;
  };
}

export interface PRNotification {
  type: 'weight' | 'reps' | 'volume';
  exerciseName: string;
  newValue: number;
  oldValue: number;
  improvement: number; // percentage
  date: string;
}

class PRService {
  private readonly STORAGE_KEY = '@fitness_prs';
  private prs: Map<string, PersonalRecord> = new Map();
  private loaded: boolean = false;

  async loadPRs(): Promise<void> {
    if (this.loaded) return;
    
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const records = JSON.parse(stored);
        this.prs = new Map(Object.entries(records));
      }
      this.loaded = true;
    } catch (error) {
      console.error('Failed to load PRs:', error);
      this.loaded = true;
    }
  }

  async savePRs(): Promise<void> {
    try {
      const records = Object.fromEntries(this.prs);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Failed to save PRs:', error);
    }
  }

  async checkAndUpdatePR(
    exerciseId: string,
    exerciseName: string,
    weight: number,
    reps: number
  ): Promise<PRNotification | null> {
    await this.loadPRs();
    
    const volume = weight * reps;
    const currentPR = this.prs.get(exerciseId);
    const now = new Date().toISOString();
    
    if (!currentPR) {
      // First time doing this exercise
      const newPR: PersonalRecord = {
        exerciseId,
        exerciseName,
        weight,
        reps,
        volume,
        date: now,
      };
      this.prs.set(exerciseId, newPR);
      await this.savePRs();
      
      return {
        type: 'weight',
        exerciseName,
        newValue: weight,
        oldValue: 0,
        improvement: 100,
        date: now,
      };
    }
    
    // Check for new PRs
    let notification: PRNotification | null = null;
    let isNewPR = false;
    
    // Priority: Weight PR > Volume PR > Reps PR
    if (weight > currentPR.weight) {
      notification = {
        type: 'weight',
        exerciseName,
        newValue: weight,
        oldValue: currentPR.weight,
        improvement: ((weight - currentPR.weight) / currentPR.weight) * 100,
        date: now,
      };
      isNewPR = true;
    } else if (volume > currentPR.volume) {
      notification = {
        type: 'volume',
        exerciseName,
        newValue: volume,
        oldValue: currentPR.volume,
        improvement: ((volume - currentPR.volume) / currentPR.volume) * 100,
        date: now,
      };
      isNewPR = true;
    } else if (weight === currentPR.weight && reps > currentPR.reps) {
      notification = {
        type: 'reps',
        exerciseName,
        newValue: reps,
        oldValue: currentPR.reps,
        improvement: ((reps - currentPR.reps) / currentPR.reps) * 100,
        date: now,
      };
      isNewPR = true;
    }
    
    if (isNewPR) {
      const updatedPR: PersonalRecord = {
        exerciseId,
        exerciseName,
        weight: Math.max(weight, currentPR.weight),
        reps: weight >= currentPR.weight ? reps : currentPR.reps,
        volume: Math.max(volume, currentPR.volume),
        date: now,
        previousRecord: {
          weight: currentPR.weight,
          reps: currentPR.reps,
          volume: currentPR.volume,
          date: currentPR.date,
        },
      };
      this.prs.set(exerciseId, updatedPR);
      await this.savePRs();
    }
    
    return notification;
  }

  async getPR(exerciseId: string): Promise<PersonalRecord | null> {
    await this.loadPRs();
    return this.prs.get(exerciseId) || null;
  }

  async getAllPRs(): Promise<PersonalRecord[]> {
    await this.loadPRs();
    return Array.from(this.prs.values());
  }

  async getRecentPRs(days: number = 30): Promise<PersonalRecord[]> {
    await this.loadPRs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return Array.from(this.prs.values()).filter(pr => {
      return new Date(pr.date) >= cutoffDate;
    });
  }

  async clearPRs(): Promise<void> {
    this.prs.clear();
    await AsyncStorage.removeItem(this.STORAGE_KEY);
    this.loaded = false;
  }

  // Get exercises close to PR (within 90% of PR)
  async getCloseToPR(exerciseId: string, weight: number): Promise<number> {
    const pr = await this.getPR(exerciseId);
    if (!pr) return 0;
    
    const percentage = (weight / pr.weight) * 100;
    return percentage >= 90 ? percentage : 0;
  }

  // Get achievement milestones
  getAchievementMilestones(weight: number): string[] {
    const milestones: string[] = [];
    
    // Weight milestones
    if (weight >= 100) milestones.push('💯 센츄리 클럽');
    if (weight >= 140) milestones.push('🎯 140kg 달성');
    if (weight >= 180) milestones.push('💪 180kg 달성');
    if (weight >= 200) milestones.push('🏆 200kg 달성');
    if (weight >= 225) milestones.push('👑 225kg 마스터');
    
    // Plate milestones (20kg plates)
    const plates = Math.floor(weight / 20);
    if (plates >= 3) milestones.push(`🏋️ ${plates}판`);
    
    return milestones;
  }
}

export const prService = new PRService();