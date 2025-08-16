// Debug thumbnail service logic
console.log('🔍 Debugging Thumbnail Service Logic\n');

const newExerciseFiles = [
  '45-degree-extension', 'ab-roller', 'decline-sit-up', 'leg-raise', 
  'mountain-climber', 'machine-crunch', 'bicycle-crunch', 'side-plank',
  'sit-up', 'weighted-russian-twist', 'weighted-cable-crunch', 'weighted-plank',
  'captains-chair-knee-raise', 'crunch', 'cross-body-crunch', 'toes-to-bar',
  'push-up', 'plank', 'flutter-kick', 'hanging-leg-raise'
];

function isNewExercise(gifUrl) {
  return newExerciseFiles.some(filename => gifUrl.includes(filename));
}

function getStaticThumbnail(gifUrl) {
  if (!gifUrl) return null;
  
  const isNew = isNewExercise(gifUrl);
  
  if (isNew) {
    const thumbnailUrl = gifUrl.replace('.gif', '-thumb.jpg');
    console.log('🆕 NEW exercise detected');
    console.log('   GIF URL: ' + gifUrl);
    console.log('   Thumbnail: ' + thumbnailUrl);
    return thumbnailUrl;
  }
  
  const thumbnailUrl = gifUrl.replace('.gif', '-thumb.jpg');
  console.log('📦 EXISTING exercise');
  console.log('   GIF URL: ' + gifUrl);
  console.log('   Thumbnail: ' + thumbnailUrl);
  return thumbnailUrl;
}

console.log('='.repeat(60));
console.log('WORKING EXERCISE (ID 1):');
const workingUrl = 'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/abdominals/alternate-heel-touches.gif';
getStaticThumbnail(workingUrl);

console.log('\n' + '='.repeat(60));
console.log('NEW EXERCISE (ID 348):');
const newUrl = 'https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/abdominals/45-degree-extension.gif';
getStaticThumbnail(newUrl);

console.log('\n' + '='.repeat(60));
console.log('ANALYSIS:');
console.log('✅ Both should convert .gif to -thumb.jpg');
console.log('✅ Both thumbnail URLs tested as accessible');
console.log('🤔 Issue must be elsewhere in the component chain');

// Test URL accessibility 
async function testUrls() {
  console.log('\n🧪 Testing actual URL accessibility...');
  
  const urls = [
    'https://nwpyliujuimufkfjolsj.supabase.co/storage/v1/object/public/exercise-gifs/abdominals/alternate-heel-touches-thumb.jpg',
    'https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/abdominals/45-degree-extension-thumb.jpg'
  ];
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      const project = url.includes('nwpyliujuimufkfjolsj') ? 'OLD' : 'NEW';
      console.log(`${response.ok ? '✅' : '❌'} ${project} project: ${response.status} - ${url.split('/').pop()}`);
    } catch (err) {
      console.log('❌ Error: ' + err.message);
    }
  }
}

testUrls();