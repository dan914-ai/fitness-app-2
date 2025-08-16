// Check what files are actually in the Supabase bucket
import('node-fetch').then(async ({ default: fetch }) => {
  const SUPABASE_URL = 'https://nwpyliujuimufkfjolsj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHlsaXVqdWltdWZrZmpvbHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjIzNjgsImV4cCI6MjA2OTIzODM2OH0.dWYh2ROhXN6n4scKc-gKMMPUjVXBXD2xv5l-UGqyTZA';
  
  console.log('Checking Supabase bucket contents...\n');
  
  try {
    // List files in the bucket
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/list/exercise-gifs`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Error listing bucket:', response.status, error);
      return;
    }
    
    const files = await response.json();
    console.log(`Found ${files.length} files in bucket:\n`);
    
    // Show first 10 files
    files.slice(0, 10).forEach(file => {
      console.log(`- ${file.name} (${(file.metadata?.size / 1024).toFixed(1)} KB)`);
    });
    
    if (files.length > 10) {
      console.log(`... and ${files.length - 10} more files`);
    }
    
    // Test accessing a file directly
    if (files.length > 0) {
      const testFile = files[0].name;
      console.log(`\nTesting access to: ${testFile}`);
      
      const testUrl = `${SUPABASE_URL}/storage/v1/object/public/exercise-gifs/${testFile}`;
      const testResponse = await fetch(testUrl, { method: 'HEAD' });
      
      if (testResponse.ok) {
        console.log(`✅ Successfully accessed: ${testUrl}`);
      } else {
        console.log(`❌ Failed to access: ${testUrl} (${testResponse.status})`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
});