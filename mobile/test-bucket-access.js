// Test different ways to access the Supabase bucket
import('node-fetch').then(async ({ default: fetch }) => {
  const SUPABASE_URL = 'https://nwpyliujuimufkfjolsj.supabase.co';
  
  console.log('Testing Supabase bucket access...\n');
  
  // Test some known uploaded files from your screenshot
  const testFiles = [
    'arnold-press.gif',
    'barbell_bench_press.gif',
    'barbell_deadlift.gif',
    'barbell_squat.gif',
    'barbell-row.gif',
    'alternate-heel-touches.gif',
    'anderson_squat.gif'
  ];
  
  console.log('Testing direct access to known files:');
  for (const file of testFiles) {
    const url = `${SUPABASE_URL}/storage/v1/object/public/exercise-gifs/${file}`;
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      
      if (response.ok) {
        console.log(`✅ ${file} - Found (${response.headers.get('content-length')} bytes)`);
      } else {
        console.log(`❌ ${file} - Not found (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${file} - Error: ${error.message}`);
    }
  }
  
  console.log('\nBased on your screenshot, the bucket contains many files.');
  console.log('The issue might be with the API list endpoint.');
  console.log('\nTo get a full list, you can:');
  console.log('1. Go to: https://supabase.com/dashboard/project/nwpyliujuimufkfjolsj/storage/buckets/exercise-gifs');
  console.log('2. Check how many files are shown there');
  console.log('3. Use the download option if you need a full list');
});