// Diagnose Supabase bucket issues
import('node-fetch').then(async ({ default: fetch }) => {
  const SUPABASE_URL = 'https://nwpyliujuimufkfjolsj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHlsaXVqdWltdWZrZmpvbHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjIzNjgsImV4cCI6MjA2OTIzODM2OH0.dWYh2ROhXN6n4scKc-gKMMPUjVXBXD2xv5l-UGqyTZA';
  
  console.log('Diagnosing Supabase Storage...\n');
  
  // Test 1: List all buckets
  console.log('1. Listing all buckets:');
  try {
    const bucketsResponse = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (bucketsResponse.ok) {
      const buckets = await bucketsResponse.json();
      console.log(`Found ${buckets.length} buckets:`);
      buckets.forEach(bucket => {
        console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    } else {
      console.log(`Failed to list buckets: ${bucketsResponse.status}`);
    }
  } catch (error) {
    console.log('Error listing buckets:', error.message);
  }
  
  console.log('\n2. Testing different URL patterns:');
  
  // Test different URL patterns
  const testPatterns = [
    // Pattern 1: Standard public URL
    {
      name: 'Standard public URL',
      url: `${SUPABASE_URL}/storage/v1/object/public/exercise-gifs/test.gif`
    },
    // Pattern 2: Without v1
    {
      name: 'Without v1',
      url: `${SUPABASE_URL}/storage/object/public/exercise-gifs/test.gif`
    },
    // Pattern 3: Direct bucket access
    {
      name: 'Direct bucket',
      url: `${SUPABASE_URL}/storage/v1/object/exercise-gifs/test.gif`
    },
    // Pattern 4: Sign URL approach
    {
      name: 'Signed URL',
      url: `${SUPABASE_URL}/storage/v1/object/sign/exercise-gifs/test.gif`
    }
  ];
  
  for (const pattern of testPatterns) {
    try {
      const response = await fetch(pattern.url, { method: 'HEAD' });
      console.log(`  ${pattern.name}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`  ${pattern.name}: Error - ${error.message}`);
    }
  }
  
  console.log('\n3. Instructions:');
  console.log('If you see "Bucket not found" errors, please:');
  console.log('1. Go to: https://supabase.com/dashboard/project/nwpyliujuimufkfjolsj/storage/buckets');
  console.log('2. Check the exact bucket name (it might have a different name than "exercise-gifs")');
  console.log('3. Make sure the bucket is set to PUBLIC');
  console.log('4. If the bucket has a different name, update EXERCISE_GIFS_BUCKET in src/config/supabase.ts');
});