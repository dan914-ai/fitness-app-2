import AsyncStorage from '@react-native-async-storage/async-storage';

export type WeightUnit = 'kg' | 'lbs';
export type DistanceUnit = 'km' | 'miles';
export type HeightUnit = 'cm' | 'ft';

interface UnitSettings {
  weight: WeightUnit;
  distance: DistanceUnit;
  height: HeightUnit;
  temperature: 'celsius' | 'fahrenheit';
}

// Conversion constants
const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 0.453592;
const KM_TO_MILES = 0.621371;
const MILES_TO_KM = 1.60934;
const CM_TO_FT = 0.0328084;
const FT_TO_CM = 30.48;

// Weight conversions
export function kgToLbs(kg: number): number {
  return Math.round(kg * KG_TO_LBS * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs * LBS_TO_KG * 10) / 10;
}

// Distance conversions
export function kmToMiles(km: number): number {
  return Math.round(km * KM_TO_MILES * 100) / 100;
}

export function milesToKm(miles: number): number {
  return Math.round(miles * MILES_TO_KM * 100) / 100;
}

// Height conversions
export function cmToFeet(cm: number): string {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

export function feetToCm(feet: number, inches: number = 0): number {
  return Math.round((feet * 30.48) + (inches * 2.54));
}

// Get current unit settings
let cachedSettings: UnitSettings | null = null;

export async function getUnitSettings(): Promise<UnitSettings> {
  if (cachedSettings) {
    return cachedSettings;
  }

  try {
    const savedSettings = await AsyncStorage.getItem('unitSettings');
    if (savedSettings) {
      cachedSettings = JSON.parse(savedSettings);
      return cachedSettings!;
    }
  } catch (error) {
    console.error('Failed to load unit settings:', error);
  }

  // Default settings
  cachedSettings = {
    weight: 'kg',
    distance: 'km',
    height: 'cm',
    temperature: 'celsius',
  };
  
  return cachedSettings;
}

// Clear cached settings when they change
export function clearUnitSettingsCache() {
  cachedSettings = null;
}

// Format weight with current unit
export async function formatWeight(weightInKg: number): Promise<string> {
  const settings = await getUnitSettings();
  
  if (settings.weight === 'lbs') {
    const lbs = kgToLbs(weightInKg);
    return `${lbs} lbs`;
  }
  
  return `${weightInKg} kg`;
}

// Format distance with current unit
export async function formatDistance(distanceInKm: number): Promise<string> {
  const settings = await getUnitSettings();
  
  if (settings.distance === 'miles') {
    const miles = kmToMiles(distanceInKm);
    return `${miles} mi`;
  }
  
  return `${distanceInKm} km`;
}

// Convert weight to kg for storage (always store in metric)
export async function convertWeightToKg(weight: number): Promise<number> {
  const settings = await getUnitSettings();
  
  if (settings.weight === 'lbs') {
    return lbsToKg(weight);
  }
  
  return weight;
}

// Convert weight from kg for display
export async function convertWeightFromKg(weightInKg: number): Promise<number> {
  const settings = await getUnitSettings();
  
  if (settings.weight === 'lbs') {
    return kgToLbs(weightInKg);
  }
  
  return weightInKg;
}

// Convert distance to km for storage
export async function convertDistanceToKm(distance: number): Promise<number> {
  const settings = await getUnitSettings();
  
  if (settings.distance === 'miles') {
    return milesToKm(distance);
  }
  
  return distance;
}

// Convert distance from km for display
export async function convertDistanceFromKm(distanceInKm: number): Promise<number> {
  const settings = await getUnitSettings();
  
  if (settings.distance === 'miles') {
    return kmToMiles(distanceInKm);
  }
  
  return distanceInKm;
}

// Get current weight unit label
export async function getWeightUnitLabel(): Promise<string> {
  const settings = await getUnitSettings();
  return settings.weight;
}

// Get current distance unit label
export async function getDistanceUnitLabel(): Promise<string> {
  const settings = await getUnitSettings();
  return settings.distance === 'km' ? 'km' : 'mi';
}