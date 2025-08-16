// Quick test to check Supabase GIF availability
import('node-fetch').then(({ default: fetch }) => {
  const SUPABASE_URL = 'https://nwpyliujuimufkfjolsj.supabase.co';
  const BUCKET = 'exercise-gifs';

  // Test a few exercise IDs (using underscores to match Supabase)
  const testExercises = [
    'barbell_bench_press',
    'barbell_row', 
    'barbell_squat',
    'barbell_deadlift',
    'arnold_press'
  ];

  async function testSupabaseGifs() {
    console.log('Testing Supabase GIF availability...\n');
    
    for (const exerciseId of testExercises) {
      const gifUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${exerciseId}.gif`;
      
      try {
        const response = await fetch(gifUrl, { method: 'HEAD' });
        
        if (response.ok) {
          console.log(`✅ ${exerciseId}: Available at ${gifUrl}`);
        } else {
          console.log(`❌ ${exerciseId}: Not found (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ ${exerciseId}: Error - ${error.message}`);
      }
    }
    
    console.log('\nTest complete! If you see mostly ❌, the GIFs may not have been uploaded to Supabase.');
    console.log('You can check the bucket at: https://supabase.com/dashboard/project/nwpyliujuimufkfjolsj/storage/buckets/exercise-gifs');
  }

  testSupabaseGifs();
}).catch(err => {
  console.error('Failed to load fetch:', err);
});