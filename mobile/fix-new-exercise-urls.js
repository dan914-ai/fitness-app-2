// Fix URLs for new exercises (348-367) to point to correct Supabase project
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing URLs for new exercises to point to correct Supabase project...\n');

const dbFilePath = './src/data/exerciseDatabase.ts';

try {
  // Read the current database file
  let content = fs.readFileSync(dbFilePath, 'utf8');
  
  console.log('📖 Read exercise database file');
  
  // Define the URL mappings
  const oldProject = 'nwpyliujuimufkfjolsj.supabase.co';
  const newProject = 'ayttqsgttuvdhvbvbnsk.supabase.co';
  
  console.log(`🔄 Converting URLs from ${oldProject} to ${newProject}`);
  
  // New exercise filenames (IDs 348-367)
  const newExerciseFiles = [
    '45-degree-extension',
    'ab-roller', 
    'decline-sit-up',
    'leg-raise',
    'mountain-climber',
    'machine-crunch',
    'bicycle-crunch',
    'side-plank', 
    'sit-up',
    'weighted-russian-twist',
    'weighted-cable-crunch',
    'weighted-plank',
    'captains-chair-knee-raise',
    'crunch',
    'cross-body-crunch',
    'toes-to-bar',
    'push-up',
    'plank',
    'flutter-kick',
    'hanging-leg-raise'
  ];
  
  let updatedCount = 0;
  
  // Update URLs for each new exercise file
  newExerciseFiles.forEach(fileName => {
    // Create regex patterns to find and replace URLs for this specific file
    const imageUrlPattern = new RegExp(`"imageUrl": "https://${oldProject}([^"]*${fileName}\\.gif)"`, 'g');
    const thumbnailUrlPattern = new RegExp(`"thumbnailUrl": "https://${oldProject}([^"]*${fileName}\\.gif)"`, 'g');
    
    // Replace imageUrl
    const beforeImage = content;
    content = content.replace(imageUrlPattern, `"imageUrl": "https://${newProject}$1"`);
    if (content !== beforeImage) {
      console.log(`✅ Updated imageUrl for ${fileName}`);
      updatedCount++;
    }
    
    // Replace thumbnailUrl  
    const beforeThumbnail = content;
    content = content.replace(thumbnailUrlPattern, `"thumbnailUrl": "https://${newProject}$1"`);
    if (content !== beforeThumbnail) {
      console.log(`✅ Updated thumbnailUrl for ${fileName}`);
    }
  });
  
  // Create backup of original file
  const backupPath = `${dbFilePath}.backup-url-fix-${Date.now()}`;
  fs.writeFileSync(backupPath, fs.readFileSync(dbFilePath));
  console.log(`\n💾 Created backup: ${backupPath}`);
  
  // Write the updated content back to the file
  fs.writeFileSync(dbFilePath, content);
  
  console.log(`\n🎉 Successfully updated ${updatedCount} exercise URLs!`);
  console.log(`📁 Updated file: ${dbFilePath}`);
  console.log(`\n📋 Next steps:`);
  console.log(`1. Restart the app to load updated URLs`);
  console.log(`2. Test thumbnails for new exercises`);
  
} catch (error) {
  console.error('❌ Error updating URLs:', error.message);
}