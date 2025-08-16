// Debug exact new exercise detection
console.log('🔍 Testing exact new exercise detection\n');

const newExerciseFiles = [
  '45-degree-extension', 'ab-roller', 'decline-sit-up', 'leg-raise', 
  'mountain-climber', 'machine-crunch', 'bicycle-crunch', 'side-plank',
  'sit-up', 'weighted-russian-twist', 'weighted-cable-crunch', 'weighted-plank',
  'captains-chair-knee-raise', 'crunch', 'cross-body-crunch', 'toes-to-bar',
  'push-up', 'plank', 'flutter-kick', 'hanging-leg-raise'
];

// Test cases
const testUrls = [
  // Working existing exercises
  'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/abdominals/alternate-heel-touches.gif',
  'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/abdominals/knee-touch-crunch.gif',
  
  // New exercises  
  'https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/abdominals/45-degree-extension.gif',
  'https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/abdominals/crunch.gif',
  'https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/abdominals/machine-crunch.gif',
  'https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/pectorals/push-up.gif'
];

function isNewExercise(gifUrl) {
  return newExerciseFiles.some(filename => gifUrl.includes(filename));
}

console.log('🧪 Testing new exercise detection:\n');

testUrls.forEach(url => {
  const isNew = isNewExercise(url);
  const filename = url.split('/').pop();
  const project = url.includes('nwpyliujuimufkfjolsj') ? 'OLD' : 'NEW';
  
  console.log(`${isNew ? '🆕' : '📦'} ${project} | ${filename} | ${isNew ? 'NEW EXERCISE' : 'EXISTING'}`);
});

console.log('\n⚠️  POTENTIAL ISSUE SPOTTED:');
console.log('The function uses .includes() which might have false positives!');
console.log('For example: "knee-touch-crunch" contains "crunch"');

console.log('\n🔧 Better detection method needed:');
console.log('Should check EXACT filename match or use exercise IDs (348-367)');

// Test improved detection
function isNewExerciseImproved(gifUrl) {
  // Extract just the filename without .gif
  const filename = gifUrl.split('/').pop().replace('.gif', '');
  return newExerciseFiles.includes(filename);
}

console.log('\n✅ IMPROVED detection test:');
testUrls.forEach(url => {
  const isNew = isNewExerciseImproved(url);
  const filename = url.split('/').pop();
  const project = url.includes('nwpyliujuimufkfjolsj') ? 'OLD' : 'NEW';
  
  console.log(`${isNew ? '🆕' : '📦'} ${project} | ${filename} | ${isNew ? 'NEW EXERCISE' : 'EXISTING'}`);
});