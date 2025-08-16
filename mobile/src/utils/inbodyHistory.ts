import storageService from '../services/storage.service';

export interface InBodyRecord {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  weight: number; // in kg
  skeletalMuscleMass: number; // in kg
  bodyFatMass: number; // in kg
  bodyFatPercentage: number; // percentage
  height: number; // in cm
  bmi: number; // user input BMI
  createdAt: string; // ISO timestamp
  notes?: string; // optional notes
}

export interface BMIStatus {
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  label: string;
  color: string;
}

export interface BodyFatStatus {
  category: 'low' | 'normal' | 'high';
  label: string;
  color: string;
}

export interface WeightStatus {
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  label: string;
  color: string;
}

// BMI calculation function
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

// BMI status calculation
export function getBMIStatus(bmi: number): BMIStatus {
  if (bmi < 18.5) {
    return {
      category: 'underweight',
      label: '저체중',
      color: '#3B82F6' // blue
    };
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    return {
      category: 'normal',
      label: '정상',
      color: '#10B981' // green
    };
  } else if (bmi >= 25 && bmi <= 29.9) {
    return {
      category: 'overweight',
      label: '과체중',
      color: '#F59E0B' // yellow
    };
  } else {
    return {
      category: 'obese',
      label: '비만',
      color: '#EF4444' // red
    };
  }
}

// Body fat percentage status calculation
export function getBodyFatStatus(bodyFatPercentage: number, gender: 'male' | 'female'): BodyFatStatus {
  if (gender === 'male') {
    if (bodyFatPercentage < 15) {
      return {
        category: 'low',
        label: '낮음',
        color: '#3B82F6' // blue
      };
    } else if (bodyFatPercentage >= 15 && bodyFatPercentage <= 20) {
      return {
        category: 'normal',
        label: '정상',
        color: '#10B981' // green
      };
    } else {
      return {
        category: 'high',
        label: '높음',
        color: '#EF4444' // red
      };
    }
  } else {
    // female
    if (bodyFatPercentage < 20) {
      return {
        category: 'low',
        label: '낮음',
        color: '#3B82F6' // blue
      };
    } else if (bodyFatPercentage >= 20 && bodyFatPercentage <= 25) {
      return {
        category: 'normal',
        label: '정상',
        color: '#10B981' // green
      };
    } else {
      return {
        category: 'high',
        label: '높음',
        color: '#EF4444' // red
      };
    }
  }
}

// Weight status based on BMI
export function getWeightStatus(bmi: number): WeightStatus {
  const bmiStatus = getBMIStatus(bmi);
  return {
    category: bmiStatus.category,
    label: bmiStatus.label,
    color: bmiStatus.color
  };
}

// Get InBody history from storage
export async function getInBodyHistory(): Promise<InBodyRecord[]> {
  try {
    const history = await storageService.getInBodyHistory();
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error loading InBody history:', error);
    return [];
  }
}

// Save new InBody record
export async function saveInBodyRecord(recordData: Omit<InBodyRecord, 'id' | 'createdAt'>): Promise<InBodyRecord> {
  try {
    // Create complete record
    const record: InBodyRecord = {
      ...recordData,
      id: `inbody_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Save to storage
    await storageService.addInBodyRecord(record);
    
    return record;
  } catch (error) {
    console.error('💥 Error saving InBody record:', error);
    throw error;
  }
}

// Update existing InBody record
export async function updateInBodyRecord(recordId: string, updates: Partial<Omit<InBodyRecord, 'id' | 'createdAt'>>): Promise<InBodyRecord | null> {
  try {
    const history = await getInBodyHistory();
    const recordIndex = history.findIndex(record => record.id === recordId);
    
    if (recordIndex === -1) {
      console.warn('❌ InBody record not found:', recordId);
      return null;
    }

    const currentRecord = history[recordIndex];
    const updatedRecord: InBodyRecord = {
      ...currentRecord,
      ...updates,
    };

    // Update storage
    await storageService.updateInBodyRecord(updatedRecord);
    
    return updatedRecord;
  } catch (error) {
    console.error('💥 Error updating InBody record:', error);
    throw error;
  }
}

// Delete InBody record
export async function deleteInBodyRecord(recordId: string): Promise<boolean> {
  try {
    await storageService.deleteInBodyRecord(recordId);
    return true;
  } catch (error) {
    console.error('💥 Error deleting InBody record:', error);
    return false;
  }
}

// Get InBody record by ID
export async function getInBodyRecordById(recordId: string): Promise<InBodyRecord | null> {
  try {
    const history = await getInBodyHistory();
    return history.find(record => record.id === recordId) || null;
  } catch (error) {
    console.error('Error loading InBody record:', error);
    return null;
  }
}

// Get InBody records by date range
export async function getInBodyRecordsByDateRange(startDate: Date, endDate: Date): Promise<InBodyRecord[]> {
  try {
    const history = await getInBodyHistory();
    return history.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
  } catch (error) {
    console.error('Error filtering InBody records by date:', error);
    return [];
  }
}

// Get latest InBody record
export async function getLatestInBodyRecord(): Promise<InBodyRecord | null> {
  try {
    const history = await getInBodyHistory();
    return history.length > 0 ? history[0] : null;
  } catch (error) {
    console.error('Error loading latest InBody record:', error);
    return null;
  }
}

// Calculate body composition trends
export interface BodyCompositionTrend {
  weight: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  bodyFat: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  muscleMass: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  bmi: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export async function getBodyCompositionTrends(): Promise<BodyCompositionTrend | null> {
  try {
    const history = await getInBodyHistory();
    
    if (history.length < 2) {
      return null; // Need at least 2 records to calculate trends
    }

    const current = history[0];
    const previous = history[1];

    const getTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
      const change = Math.abs(current - previous);
      if (change < 0.1) return 'stable';
      return current > previous ? 'up' : 'down';
    };

    return {
      weight: {
        current: current.weight,
        previous: previous.weight,
        change: Math.round((current.weight - previous.weight) * 10) / 10,
        trend: getTrend(current.weight, previous.weight),
      },
      bodyFat: {
        current: current.bodyFatPercentage,
        previous: previous.bodyFatPercentage,
        change: Math.round((current.bodyFatPercentage - previous.bodyFatPercentage) * 10) / 10,
        trend: getTrend(current.bodyFatPercentage, previous.bodyFatPercentage),
      },
      muscleMass: {
        current: current.skeletalMuscleMass,
        previous: previous.skeletalMuscleMass,
        change: Math.round((current.skeletalMuscleMass - previous.skeletalMuscleMass) * 10) / 10,
        trend: getTrend(current.skeletalMuscleMass, previous.skeletalMuscleMass),
      },
      bmi: {
        current: current.bmi,
        previous: previous.bmi,
        change: Math.round((current.bmi - previous.bmi) * 10) / 10,
        trend: getTrend(current.bmi, previous.bmi),
      },
    };
  } catch (error) {
    console.error('Error calculating body composition trends:', error);
    return null;
  }
}

// Get overall InBody status
export function getInBodyStatus(record: InBodyRecord) {
  return {
    weight: getWeightStatus(record.bmi),
    bmi: getBMIStatus(record.bmi),
    bodyFat: getBodyFatStatus(record.bodyFatPercentage, 'male'), // Default to male
    muscleMass: getMuscleStatus(record.skeletalMuscleMass, record.weight)
  };
}

// Get status text for display
export function getStatusText(statusType: string, value: number) {
  switch (statusType) {
    case 'weight':
      return getWeightStatus(value);
    case 'bmi': 
      return getBMIStatus(value);
    case 'bodyFat':
      return getBodyFatStatus(value, 'male');
    case 'muscleMass':
      return getMuscleStatus(value, 70); // Default weight
    default:
      return { label: '정상', color: '#4CAF50', category: 'normal' };
  }
}

// Calculate InBody trends
export function calculateInBodyTrends(records: InBodyRecord[]) {
  if (records.length < 2) {
    return {
      weight: { change: 0, trend: 'stable' },
      bodyFat: { change: 0, trend: 'stable' },
      muscleMass: { change: 0, trend: 'stable' },
      bmi: { change: 0, trend: 'stable' }
    };
  }

  const latest = records[0];
  const previous = records[1];

  return {
    weight: {
      change: Number((latest.weight - previous.weight).toFixed(1)),
      trend: latest.weight > previous.weight ? 'up' : latest.weight < previous.weight ? 'down' : 'stable'
    },
    bodyFat: {
      change: Number((latest.bodyFatPercentage - previous.bodyFatPercentage).toFixed(1)),
      trend: latest.bodyFatPercentage > previous.bodyFatPercentage ? 'up' : latest.bodyFatPercentage < previous.bodyFatPercentage ? 'down' : 'stable'
    },
    muscleMass: {
      change: Number((latest.skeletalMuscleMass - previous.skeletalMuscleMass).toFixed(1)),
      trend: latest.skeletalMuscleMass > previous.skeletalMuscleMass ? 'up' : latest.skeletalMuscleMass < previous.skeletalMuscleMass ? 'down' : 'stable'
    },
    bmi: {
      change: Number((latest.bmi - previous.bmi).toFixed(1)),
      trend: latest.bmi > previous.bmi ? 'up' : latest.bmi < previous.bmi ? 'down' : 'stable'
    }
  };
}

// Helper function for muscle mass status
function getMuscleStatus(muscleMass: number, weight: number) {
  const ratio = (muscleMass / weight) * 100;
  if (ratio < 35) {
    return { label: '부족', color: '#FF9800', category: 'low' };
  } else if (ratio < 45) {
    return { label: '정상', color: '#4CAF50', category: 'normal' };
  } else {
    return { label: '우수', color: '#2196F3', category: 'excellent' };
  }
}

// Sample data for testing
export const sampleInBodyData: InBodyRecord[] = [
  {
    id: 'inbody_1701234567890',
    date: '2024-01-15',
    weight: 70.5,
    skeletalMuscleMass: 32.8,
    bodyFatMass: 10.7,
    bodyFatPercentage: 15.2,
    height: 175,
    bmi: calculateBMI(70.5, 175),
    createdAt: '2024-01-15T09:30:00.000Z',
    notes: '아침 운동 후 측정',
  },
  {
    id: 'inbody_1701334567890',
    date: '2024-01-08',
    weight: 71.2,
    skeletalMuscleMass: 32.5,
    bodyFatMass: 11.4,
    bodyFatPercentage: 16.0,
    height: 175,
    bmi: calculateBMI(71.2, 175),
    createdAt: '2024-01-08T08:45:00.000Z',
    notes: '새해 첫 측정',
  },
  {
    id: 'inbody_1700234567890',
    date: '2024-01-01',
    weight: 72.0,
    skeletalMuscleMass: 32.0,
    bodyFatMass: 12.1,
    bodyFatPercentage: 16.8,
    height: 175,
    bmi: calculateBMI(72.0, 175),
    createdAt: '2024-01-01T10:00:00.000Z',
    notes: '연말연시 후 체크',
  },
];

// Initialize sample data (for development/testing)
export async function initializeSampleInBodyData(): Promise<void> {
  try {
    const existingHistory = await getInBodyHistory();
    if (existingHistory.length === 0) {
      for (const record of sampleInBodyData) {
        await storageService.addInBodyRecord(record);
      }
    }
  } catch (error) {
    console.error('💥 Error initializing sample InBody data:', error);
  }
}