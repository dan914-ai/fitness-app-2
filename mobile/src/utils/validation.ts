// Validation utilities for tracking forms

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const trackingValidation = {
  // Water intake validation (ml)
  validateWaterAmount: (amount: number): ValidationResult => {
    if (!amount || amount <= 0) {
      return { isValid: false, message: '물 섭취량을 입력해주세요' };
    }
    if (amount > 5000) {
      return { isValid: false, message: '한 번에 5L 이상은 입력할 수 없습니다' };
    }
    if (amount < 50) {
      return { isValid: false, message: '최소 50ml 이상 입력해주세요' };
    }
    return { isValid: true };
  },

  // Alias for backward compatibility
  validateWaterIntake: (amount: number): ValidationResult & { error?: string } => {
    const result = trackingValidation.validateWaterAmount(amount);
    return {
      ...result,
      error: result.message // Add error field for compatibility
    };
  },

  // Sleep duration validation (hours)
  validateSleepDuration: (bedTime: Date, wakeTime: Date): ValidationResult => {
    const duration = (wakeTime.getTime() - bedTime.getTime()) / (1000 * 60 * 60);
    
    if (duration < 0) {
      return { isValid: false, message: '취침 시간이 기상 시간보다 늦을 수 없습니다' };
    }
    if (duration > 24) {
      return { isValid: false, message: '수면 시간이 24시간을 초과할 수 없습니다' };
    }
    if (duration < 1) {
      return { isValid: false, message: '수면 시간은 최소 1시간 이상이어야 합니다' };
    }
    return { isValid: true };
  },

  // Sleep quality validation (1-5)
  validateSleepQuality: (quality: number): ValidationResult => {
    if (!Number.isInteger(quality) || quality < 1 || quality > 5) {
      return { isValid: false, message: '수면 품질은 1-5 사이의 숫자여야 합니다' };
    }
    return { isValid: true };
  },

  // Nutrition validation
  validateNutritionData: (calories: number, protein: number, carbs: number, fat: number): ValidationResult => {
    if (calories <= 0 || calories > 5000) {
      return { isValid: false, message: '칼로리는 1-5000 사이여야 합니다' };
    }
    if (protein < 0 || protein > 500) {
      return { isValid: false, message: '단백질은 0-500g 사이여야 합니다' };
    }
    if (carbs < 0 || carbs > 1000) {
      return { isValid: false, message: '탄수화물은 0-1000g 사이여야 합니다' };
    }
    if (fat < 0 || fat > 500) {
      return { isValid: false, message: '지방은 0-500g 사이여야 합니다' };
    }
    return { isValid: true };
  },

  // Cardio validation
  validateCardioData: (distance: number, duration: number): ValidationResult => {
    if (distance <= 0 || distance > 100) {
      return { isValid: false, message: '거리는 0-100km 사이여야 합니다' };
    }
    if (duration <= 0 || duration > 480) {
      return { isValid: false, message: '운동 시간은 0-480분 사이여야 합니다' };
    }
    return { isValid: true };
  },

  // Recovery validation
  validateRecoveryData: (duration: number, intensity: number): ValidationResult => {
    if (duration <= 0 || duration > 240) {
      return { isValid: false, message: '회복 시간은 0-240분 사이여야 합니다' };
    }
    if (!Number.isInteger(intensity) || intensity < 1 || intensity > 5) {
      return { isValid: false, message: '강도는 1-5 사이의 숫자여야 합니다' };
    }
    return { isValid: true };
  },

  // Body measurement validation
  validateBodyMeasurement: (weight?: number, bodyFat?: number, muscleMass?: number): ValidationResult => {
    if (weight !== undefined && (weight <= 0 || weight > 500)) {
      return { isValid: false, message: '체중은 0-500kg 사이여야 합니다' };
    }
    if (bodyFat !== undefined && (bodyFat < 0 || bodyFat > 50)) {
      return { isValid: false, message: '체지방률은 0-50% 사이여야 합니다' };
    }
    if (muscleMass !== undefined && (muscleMass <= 0 || muscleMass > 200)) {
      return { isValid: false, message: '근육량은 0-200kg 사이여야 합니다' };
    }
    return { isValid: true };
  },

  // Generic text validation
  validateNotes: (notes: string): ValidationResult => {
    if (notes && notes.length > 500) {
      return { isValid: false, message: '메모는 500자를 초과할 수 없습니다' };
    }
    return { isValid: true };
  },

  // Date validation
  validateDate: (date: Date): ValidationResult => {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    if (date < oneYearAgo || date > oneYearFromNow) {
      return { isValid: false, message: '날짜는 1년 전부터 1년 후까지만 입력 가능합니다' };
    }
    return { isValid: true };
  },
};

// Helper function to validate all fields and return the first error
export function validateMultiple(...validations: ValidationResult[]): ValidationResult {
  for (const validation of validations) {
    if (!validation.isValid) {
      return validation;
    }
  }
  return { isValid: true };
}

// Workout-related validation functions
export function validateWeight(weight: string): boolean {
  const trimmed = weight.trim();
  if (!trimmed) return false;
  
  const num = parseFloat(trimmed);
  if (isNaN(num)) return false;
  
  // Weight should be between 0 and 500kg
  return num >= 0 && num <= 500;
}

export function validateReps(reps: string): boolean {
  const trimmed = reps.trim();
  if (!trimmed) return false;
  
  const num = parseInt(trimmed);
  if (isNaN(num)) return false;
  
  // Check if it's a whole number (no decimals)
  if (parseFloat(trimmed) !== num) return false;
  
  // Reps should be between 0 and 999
  return num >= 0 && num <= 999;
}

export function validateEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return false;
  
  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

export function validateUsername(username: string): boolean {
  const trimmed = username.trim();
  if (!trimmed) return false;
  
  // Username should be 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(trimmed);
}