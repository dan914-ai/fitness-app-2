// Utility to ensure controlled input values are never undefined
export const ensureControlledValue = (value: any): string => {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return String(value);
};

// Helper for numeric inputs
export const ensureNumericValue = (value: any): string => {
  if (value === undefined || value === null || value === '') {
    return '0';
  }
  return String(value);
};