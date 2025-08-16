// Setup Supabase bucket and upload sample GIFs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nwpyliujuimufkfjolsj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHlsaXVqdWltdWZrZmpvbHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjIzNjgsImV4cCI6MjA2OTIzODM2OH0.dWYh2ROhXN6n4scKc-gKMMPUjVXBXD2xv5l-UGqyTZA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupBucket() {
  console.log('Setting up Supabase bucket...\n');
  
  // Check if bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    console.log('\n⚠️  Note: You may need to use the Supabase service role key (not anon key) to create buckets.');
    console.log('Go to https://supabase.com/dashboard/project/nwpyliujuimufkfjolsj/settings/api');
    console.log('And use the service_role key instead of the anon key.\n');
    return;
  }
  
  const bucketExists = buckets?.some(b => b.name === 'exercise-gifs');
  
  if (!bucketExists) {
    console.log('Creating exercise-gifs bucket...');
    const { data, error } = await supabase.storage.createBucket('exercise-gifs', {
      public: true,
      allowedMimeTypes: ['image/gif'],
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (error) {
      console.error('Error creating bucket:', error);
      console.log('\n⚠️  You need to create the bucket manually in Supabase dashboard:');
      console.log('1. Go to: https://supabase.com/dashboard/project/nwpyliujuimufkfjolsj/storage/buckets');
      console.log('2. Click "New bucket"');
      console.log('3. Name: exercise-gifs');
      console.log('4. Make it public');
      console.log('5. Save\n');
      return;
    }
    console.log('✅ Bucket created successfully!');
  } else {
    console.log('✅ Bucket already exists!');
  }
  
  // List current files
  const { data: files, error: filesError } = await supabase.storage
    .from('exercise-gifs')
    .list('', { limit: 10 });
    
  if (filesError) {
    console.error('Error listing files:', filesError);
  } else {
    console.log(`\nCurrent files in bucket: ${files?.length || 0}`);
    if (files && files.length > 0) {
      console.log('Sample files:');
      files.slice(0, 5).forEach(f => console.log(`  - ${f.name}`));
    }
  }
}

setupBucket().catch(console.error);