// Mapping between string IDs used in routines and numeric IDs used in database
export const exerciseIdMap: Record<string, string> = {
  // Chest exercises
  'barbell-bench-press': '204',
  'incline-dumbbell-press': '229',
  'incline-barbell-bench-press': '228',
  'dumbbell-bench-press': '221',
  'dumbbell-chest-fly': '222',
  'cable-chest-fly': '208',
  'push-up': '364',
  'dips': '220',
  
  // Back exercises  
  'pull-up': '46',
  'lat-pulldown': '34',
  'barbell-row': '12',
  'dumbbell-row': '29',
  'cable-row': '18',
  'deadlift': '177',
  
  // Shoulder exercises
  'seated-dumbbell-shoulder-press': '142',
  'dumbbell-shoulder-press': '142',
  'barbell-shoulder-press': '117',
  'dumbbell-lateral-raise': '122',
  'cable-lateral-raise': '146',
  'front-raise': '140',
  'rear-delt-fly': '124',
  
  // Bicep exercises
  'barbell-bicep-curl': '60',
  'dumbbell-bicep-curl': '70',
  'hammer-curl': '72',
  'preacher-curl': '62',
  'cable-bicep-curl': '63',
  
  // Tricep exercises
  'tricep-pushdown': '346',
  'cable-tricep-pushdown': '346',
  'overhead-tricep-extension': '345',
  'close-grip-bench-press': '332',
  'tricep-dips': '220',
  'cable-tricep-extension': '328',
  
  // Leg exercises
  'squat': '254',
  'barbell-squat': '254',
  'leg-press': '286',
  'leg-extension': '282',
  'leg-curl': '187',
  'bulgarian-split-squat': '263',
  'lunges': '285',
  'calf-raise': '95',
  
  // Core exercises
  'plank': '365',
  'crunch': '361',
  'sit-up': '356',
  'leg-raise': '351',
  'russian-twist': '357',
  'ab-roller': '349',
  'mountain-climber': '352',
};

// Function to get numeric ID from string ID
export function getNumericExerciseId(stringId: string | number): string | undefined {
  // Convert to string if it's a number
  const id = String(stringId);
  
  // If it's already a numeric string, return it
  if (/^\d+$/.test(id)) {
    return id;
  }
  
  // Otherwise look up in the map
  return exerciseIdMap[id];
}

// Function to find exercise by name (Korean or English)
export function findExerciseIdByName(name: string): string | undefined {
  // Common name mappings
  const nameMap: Record<string, string> = {
    '바벨 벤치 프레스': '204',
    '인클라인 덤벨 프레스': '229',
    '풀업': '46',
    '바벨 로우': '12',
    '시티드 덤벨 숄더 프레스': '142',
    '덤벨 레터럴 레이즈': '122',
    '바벨 컬': '60',
    '트라이셉 푸시다운': '346',
    '스쿼트': '254',
    '레그 프레스': '286',
    '플랭크': '365',
    '크런치': '361',
  };
  
  return nameMap[name];
}