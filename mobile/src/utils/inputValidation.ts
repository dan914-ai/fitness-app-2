// Input validation utilities for fitness app

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Number validations
export function validateWeight(weight: string | number): ValidationResult {
  const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;
  
  if (isNaN(numWeight)) {
    return { isValid: false, error: '유효한 숫자를 입력하세요' };
  }
  
  if (numWeight < 0) {
    return { isValid: false, error: '무게는 0보다 커야 합니다' };
  }
  
  if (numWeight > 1000) {
    return { isValid: false, error: '무게가 너무 큽니다 (최대 1000kg)' };
  }
  
  return { isValid: true };
}

export function validateReps(reps: string | number): ValidationResult {
  const numReps = typeof reps === 'string' ? parseInt(reps, 10) : reps;
  
  if (isNaN(numReps)) {
    return { isValid: false, error: '유효한 숫자를 입력하세요' };
  }
  
  if (!Number.isInteger(numReps)) {
    return { isValid: false, error: '반복 횟수는 정수여야 합니다' };
  }
  
  if (numReps < 0) {
    return { isValid: false, error: '반복 횟수는 0보다 커야 합니다' };
  }
  
  if (numReps > 1000) {
    return { isValid: false, error: '반복 횟수가 너무 많습니다 (최대 1000)' };
  }
  
  return { isValid: true };
}

export function validateSets(sets: string | number): ValidationResult {
  const numSets = typeof sets === 'string' ? parseInt(sets, 10) : sets;
  
  if (isNaN(numSets)) {
    return { isValid: false, error: '유효한 숫자를 입력하세요' };
  }
  
  if (!Number.isInteger(numSets)) {
    return { isValid: false, error: '세트 수는 정수여야 합니다' };
  }
  
  if (numSets < 1) {
    return { isValid: false, error: '최소 1세트 이상이어야 합니다' };
  }
  
  if (numSets > 100) {
    return { isValid: false, error: '세트 수가 너무 많습니다 (최대 100)' };
  }
  
  return { isValid: true };
}

export function validateDuration(duration: string | number): ValidationResult {
  const numDuration = typeof duration === 'string' ? parseFloat(duration) : duration;
  
  if (isNaN(numDuration)) {
    return { isValid: false, error: '유효한 숫자를 입력하세요' };
  }
  
  if (numDuration < 0) {
    return { isValid: false, error: '시간은 0보다 커야 합니다' };
  }
  
  if (numDuration > 600) {
    return { isValid: false, error: '시간이 너무 깁니다 (최대 10분)' };
  }
  
  return { isValid: true };
}

// Helper function to sanitize numeric input
export function sanitizeNumericInput(input: string): string {
  // Remove all non-numeric characters except decimal point
  return input.replace(/[^0-9.]/g, '');
}

// Helper function to parse numeric input safely
export function parseNumericInput(input: string): number | null {
  const sanitized = sanitizeNumericInput(input);
  const parsed = parseFloat(sanitized);
  
  if (isNaN(parsed)) {
    return null;
  }
  
  return parsed;
}

// Validate and parse combined
export function validateAndParseWeight(input: string): { value: number | null; error?: string } {
  const parsed = parseNumericInput(input);
  
  if (parsed === null) {
    return { value: null, error: '유효한 숫자를 입력하세요' };
  }
  
  const validation = validateWeight(parsed);
  
  if (!validation.isValid) {
    return { value: null, error: validation.error };
  }
  
  return { value: parsed };
}

export function validateAndParseReps(input: string): { value: number | null; error?: string } {
  const parsed = parseNumericInput(input);
  
  if (parsed === null) {
    return { value: null, error: '유효한 숫자를 입력하세요' };
  }
  
  const validation = validateReps(Math.floor(parsed));
  
  if (!validation.isValid) {
    return { value: null, error: validation.error };
  }
  
  return { value: Math.floor(parsed) };
}