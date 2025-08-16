import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateExerciseDatabase() {
  console.log('🔄 Updating exercise database with Supabase URLs...');
  
  // Get all files in Supabase storage
  const { data: files, error } = await supabase.storage
    .from('exercise-gifs')
    .list('', { limit: 1000 });
  
  if (error) {
    console.error('❌ Error fetching files:', error);
    return;
  }
  
  console.log(`📁 Found ${files.length} files in Supabase storage`);
  
  // Create mapping of exercise ID to Supabase URL
  const supabaseUrls = {};
  files.forEach(file => {
    const exerciseId = file.name.replace('.gif', '');
    const { data } = supabase.storage
      .from('exercise-gifs')
      .getPublicUrl(file.name);
    supabaseUrls[exerciseId] = data.publicUrl;
  });
  
  // Read exercise database
  const dbPath = './src/data/exerciseDatabase.ts';
  let content = fs.readFileSync(dbPath, 'utf8');
  
  // Update media objects to include supabaseGifUrl
  let updatedCount = 0;
  
  for (const [exerciseId, supabaseUrl] of Object.entries(supabaseUrls)) {
    // Find the exercise's media section and add supabaseGifUrl
    const mediaRegex = new RegExp(
      `(id:\\s*'${exerciseId}'[\\s\\S]*?media:\\s*{[^}]*)(})`
    );
    
    const match = content.match(mediaRegex);
    if (match) {
      const hasSupabaseUrl = match[1].includes('supabaseGifUrl');
      if (!hasSupabaseUrl) {
        const updatedMedia = match[1] + `,\n      supabaseGifUrl: '${supabaseUrl}'` + match[2];
        content = content.replace(mediaRegex, updatedMedia);
        updatedCount++;
      }
    }
  }
  
  // Write updated content back to file
  fs.writeFileSync(dbPath, content, 'utf8');
  
  console.log(`✅ Updated ${updatedCount} exercises with Supabase URLs`);
  console.log(`📊 Total exercises with working GIFs: ${Object.keys(supabaseUrls).length}`);
  
  // Log some sample URLs for verification
  console.log('\n🔗 Sample Supabase URLs:');
  const sampleIds = Object.keys(supabaseUrls).slice(0, 5);
  sampleIds.forEach(id => {
    console.log(`   ${id}: ${supabaseUrls[id]}`);
  });
}

updateExerciseDatabase().catch(console.error);