#!/usr/bin/env node

/**
 * Test script to verify static thumbnails are properly loaded
 */

const path = require('path');
const fs = require('fs');

// Import the static thumbnails
const staticThumbnails = require('../src/constants/staticThumbnails').staticThumbnails;

// Import exercise database
const exerciseDatabase = require('../src/data/exerciseDatabase').default;

console.log('🔍 Testing Static Thumbnails Configuration');
console.log('==========================================\n');

// Test 1: Check if static thumbnails are loaded
console.log('Test 1: Static thumbnails loaded');
const thumbnailCount = Object.keys(staticThumbnails).length;
console.log(`✅ Loaded ${thumbnailCount} static thumbnails\n`);

// Test 2: Check if all exercises have thumbnails
console.log('Test 2: Exercise thumbnail coverage');
let missingThumbnails = [];
let foundThumbnails = [];

exerciseDatabase.forEach(exercise => {
  const thumbnail = staticThumbnails[exercise.id.toString()];
  if (thumbnail) {
    foundThumbnails.push(exercise.id);
  } else {
    missingThumbnails.push({
      id: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup
    });
  }
});

console.log(`✅ Found thumbnails for ${foundThumbnails.length}/${exerciseDatabase.length} exercises`);
if (missingThumbnails.length > 0) {
  console.log(`⚠️  Missing thumbnails for ${missingThumbnails.length} exercises:`);
  missingThumbnails.slice(0, 10).forEach(ex => {
    console.log(`   - ID: ${ex.id} - ${ex.name} (${ex.muscleGroup})`);
  });
  if (missingThumbnails.length > 10) {
    console.log(`   ... and ${missingThumbnails.length - 10} more`);
  }
}
console.log();

// Test 3: Check routine exercises
console.log('Test 3: Routine exercise thumbnails');
const routineExerciseIds = [
  '204', // 바벨 벤치 프레스
  '225', // 인클라인 덤벨 플라이
  '46',  // 풀업
  '12',  // 바벨 로우
  '142', // 시티드 덤벨 숄더 프레스
  '122', // 덤벨 래터럴 레이즈
  '60',  // 바벨 컬
  '326', // 케이블 푸시다운
  '400', // 바벨 스쿼트
  '296', // 머신 레그 프레스
  '187', // 라잉 레그 컬
  '282', // 레그 익스텐션
  '95',  // 스탠딩 카프 레이즈
  '395', // 루마니안 데드리프트
];

let routineThumbnailStatus = [];
routineExerciseIds.forEach(id => {
  const exercise = exerciseDatabase.find(ex => ex.id.toString() === id);
  const thumbnail = staticThumbnails[id];
  routineThumbnailStatus.push({
    id,
    name: exercise?.name || 'Unknown',
    hasThumbnail: !!thumbnail
  });
});

const routineWithThumbnails = routineThumbnailStatus.filter(s => s.hasThumbnail).length;
console.log(`✅ Routine exercises with thumbnails: ${routineWithThumbnails}/${routineExerciseIds.length}`);
routineThumbnailStatus.forEach(status => {
  console.log(`   ${status.hasThumbnail ? '✅' : '❌'} ID: ${status.id} - ${status.name}`);
});
console.log();

// Test 4: Verify thumbnail file type
console.log('Test 4: Thumbnail types');
const sampleIds = ['204', '46', '12', '400', '95'];
sampleIds.forEach(id => {
  const thumbnail = staticThumbnails[id];
  if (thumbnail) {
    const type = typeof thumbnail;
    console.log(`   ID ${id}: ${type} (${type === 'number' ? 'Static require()' : 'Other'})`);
  }
});

console.log('\n==========================================');
console.log('📊 Summary:');
console.log(`Total Thumbnails: ${thumbnailCount}`);
console.log(`Exercise Coverage: ${((foundThumbnails.length / exerciseDatabase.length) * 100).toFixed(1)}%`);
console.log(`Routine Coverage: ${((routineWithThumbnails / routineExerciseIds.length) * 100).toFixed(1)}%`);
console.log('==========================================');