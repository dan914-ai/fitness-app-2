// Test the thumbnail service directly
const { thumbnailService } = require('./src/services/thumbnail.service.ts');

console.log('Testing thumbnail service...\n');

// Test some abdominal exercise IDs
const testIds = ['1', '2', '3', '348', '361', '365'];

testIds.forEach(id => {
  const url = thumbnailService.getStaticThumbnailUrl(id, 'fallback.gif');
  console.log(`ID ${id}: ${url}`);
  console.log(`  Is static? ${url.includes('-static.jpg') ? 'YES ✅' : 'NO ❌'}\n`);
});