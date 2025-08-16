// Quick test to verify thumbnails are accessible
const path = require('path');
const fs = require('fs');

console.log('🔍 Testing Thumbnail Access...\n');

// Check if thumbnails directory exists
const thumbDir = path.join(__dirname, 'assets', 'exercise-thumbnails');
console.log('📁 Thumbnail directory:', thumbDir);
console.log('   Exists:', fs.existsSync(thumbDir));

// Check a specific thumbnail
const testThumb = path.join(thumbDir, 'back', 'pull-up.jpg');
console.log('\n🖼️ Test thumbnail:', testThumb);
console.log('   Exists:', fs.existsSync(testThumb));
if (fs.existsSync(testThumb)) {
  const stats = fs.statSync(testThumb);
  console.log('   Size:', stats.size, 'bytes');
}

// Check mapping file
const mappingFile = path.join(__dirname, 'src', 'constants', 'thumbnailMapping.ts');
console.log('\n📄 Mapping file:', mappingFile);
console.log('   Exists:', fs.existsSync(mappingFile));

// Count total thumbnails
const countThumbnails = (dir) => {
  let count = 0;
  const subdirs = fs.readdirSync(dir);
  subdirs.forEach(subdir => {
    const subdirPath = path.join(dir, subdir);
    if (fs.statSync(subdirPath).isDirectory()) {
      const files = fs.readdirSync(subdirPath);
      const jpgs = files.filter(f => f.endsWith('.jpg'));
      count += jpgs.length;
      console.log(`   ${subdir}: ${jpgs.length} thumbnails`);
    }
  });
  return count;
};

console.log('\n📊 Thumbnail count by category:');
const total = countThumbnails(thumbDir);
console.log(`\n✅ Total thumbnails: ${total}`);

// Test if we can require a thumbnail
try {
  console.log('\n🧪 Testing require() for thumbnail...');
  const testRequire = require('./assets/exercise-thumbnails/back/pull-up.jpg');
  console.log('   Result:', typeof testRequire);
  console.log('   Success: Thumbnail can be required!');
} catch (error) {
  console.log('   ❌ Error:', error.message);
}