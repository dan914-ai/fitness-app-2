const fs = require('fs');
const path = require('path');

// Complete list of chest exercises from the Downloads folder
const chestExercisesToAdd = [
  {
    id: 'dumbbell_bench_press',
    filename: '덤벨 벤치프레스.gif',
    korean: '덤벨 벤치프레스',
    equipment: ['덤벨', '플랫 벤치']
  },
  {
    id: 'dumbbell_incline_bench_press',
    filename: '덤벨 인클라인 벤치 프레스.gif',
    korean: '덤벨 인클라인 벤치 프레스',
    equipment: ['덤벨', '인클라인 벤치']
  },
  {
    id: 'dumbbell_chest_fly',
    filename: '덤벨 체스트 플라이.gif',
    korean: '덤벨 체스트 플라이',
    equipment: ['덤벨', '플랫 벤치']
  },
  {
    id: 'decline_dumbbell_fly',
    filename: '디클라인 덤벨 플라이.gif',
    korean: '디클라인 덤벨 플라이',
    equipment: ['덤벨', '디클라인 벤치']
  },
  {
    id: 'decline_barbell_bench_press',
    filename: '디클라인 바벨 벤치프레스.gif',
    korean: '디클라인 바벨 벤치프레스',
    equipment: ['바벨', '디클라인 벤치', '중량 플레이트']
  },
  {
    id: 'decline_cable_fly',
    filename: '디클라인 케이블 플라이.gif',
    korean: '디클라인 케이블 플라이',
    equipment: ['케이블 머신', '케이블 핸들', '디클라인 벤치']
  },
  {
    id: 'decline_plate_chest_press',
    filename: '디클라인 플레이트 체스트 프레스.gif',
    korean: '디클라인 플레이트 체스트 프레스',
    equipment: ['중량 플레이트', '디클라인 벤치']
  },
  {
    id: 'dips',
    filename: '딥스.gif',
    korean: '딥스',
    equipment: ['딥스 바']
  },
  {
    id: 'machine_decline_chest_press',
    filename: '머신 디클라인 체스트 프레스.gif',
    korean: '머신 디클라인 체스트 프레스',
    equipment: ['체스트 프레스 머신']
  },
  {
    id: 'machine_chest_press',
    filename: '머신 체스트 프레스.gif',
    korean: '머신 체스트 프레스',
    equipment: ['체스트 프레스 머신']
  },
  {
    id: 'machine_chest_fly',
    filename: '머신 체스트 플라이.gif',
    korean: '머신 체스트 플라이',
    equipment: ['펙덱 머신']
  },
  {
    id: 'barbell_bench_press',
    filename: '바벨 벤치프레스.gif',
    korean: '바벨 벤치프레스',
    equipment: ['바벨', '플랫 벤치', '중량 플레이트']
  },
  {
    id: 'barbell_incline_bench_press',
    filename: '바벨 인클라인 벤치 프레스.gif',
    korean: '바벨 인클라인 벤치 프레스',
    equipment: ['바벨', '인클라인 벤치', '중량 플레이트']
  },
  {
    id: 'smith_decline_bench_press',
    filename: '스미스 디클라인 벤치 프레스.gif',
    korean: '스미스 디클라인 벤치 프레스',
    equipment: ['스미스 머신', '디클라인 벤치']
  },
  {
    id: 'smith_bench_press',
    filename: '스미스 벤치 프레스.gif',
    korean: '스미스 벤치 프레스',
    equipment: ['스미스 머신', '플랫 벤치']
  },
  {
    id: 'smith_incline_bench_press',
    filename: '스미스 인클라인 벤치프레스.gif',
    korean: '스미스 인클라인 벤치프레스',
    equipment: ['스미스 머신', '인클라인 벤치']
  },
  {
    id: 'assisted_dips',
    filename: '어시스트 딥스.gif',
    korean: '어시스트 딥스',
    equipment: ['어시스트 딥스 머신']
  },
  {
    id: 'one_arm_cable_fly',
    filename: '원 암 케이블 플라이.gif',
    korean: '원 암 케이블 플라이',
    equipment: ['케이블 머신', '싱글 핸들']
  },
  {
    id: 'one_arm_plate_chest_press',
    filename: '원 암 플레이트 체스트 프레스.gif',
    korean: '원 암 플레이트 체스트 프레스',
    equipment: ['중량 플레이트', '벤치']
  },
  {
    id: 'incline_dumbbell_fly',
    filename: '인클라인 덤벨 플라이.gif',
    korean: '인클라인 덤벨 플라이',
    equipment: ['덤벨', '인클라인 벤치']
  },
  {
    id: 'incline_cable_fly',
    filename: '인클라인 케이블 플라이.gif',
    korean: '인클라인 케이블 플라이',
    equipment: ['케이블 머신', '케이블 핸들', '인클라인 벤치']
  },
  {
    id: 'cable_incline_chest_press',
    filename: '케이블 인클라인 체스트 프레스.gif',
    korean: '케이블 인클라인 체스트 프레스',
    equipment: ['케이블 머신', '케이블 핸들', '인클라인 벤치']
  },
  {
    id: 'cable_chest_press',
    filename: '케이블 체스트 프레스.gif',
    korean: '케이블 체스트 프레스',
    equipment: ['케이블 머신', '케이블 핸들']
  },
  {
    id: 'cable_crossover',
    filename: '케이블 크로스오버.gif',
    korean: '케이블 크로스오버',
    equipment: ['케이블 머신', '케이블 핸들']
  },
  {
    id: 'plate_decline_chest_press',
    filename: '플레이트 디클라인 체스트 프레스.gif',
    korean: '플레이트 디클라인 체스트 프레스',
    equipment: ['중량 플레이트', '디클라인 벤치']
  },
  {
    id: 'plate_incline_chest_press',
    filename: '플레이트 인클라인 체스트 프레스.gif',
    korean: '플레이트 인클라인 체스트 프레스',
    equipment: ['중량 플레이트', '인클라인 벤치']
  },
  {
    id: 'plate_chest_press',
    filename: '플레이트 체스트 프레스.gif',
    korean: '플레이트 체스트 프레스',
    equipment: ['중량 플레이트', '플랫 벤치']
  },
  {
    id: 'plate_chest_fly',
    filename: '플레이트 체스트 플라이.gif',
    korean: '플레이트 체스트 플라이',
    equipment: ['중량 플레이트', '플랫 벤치']
  }
];

// Check which ones already exist
const databasePath = path.join(__dirname, '../src/data/exerciseDatabase.ts');
const databaseContent = fs.readFileSync(databasePath, 'utf-8');

const existingIds = new Set();
const idMatches = databaseContent.matchAll(/id:\s*['"]([^'"]+)['"]/g);
for (const match of idMatches) {
  existingIds.add(match[1]);
}

const newExercises = chestExercisesToAdd.filter(ex => !existingIds.has(ex.id));
const existingToUpdate = chestExercisesToAdd.filter(ex => existingIds.has(ex.id));

console.log(`Total chest exercises: ${chestExercisesToAdd.length}`);
console.log(`New exercises to add: ${newExercises.length}`);
console.log(`Existing exercises to update: ${existingToUpdate.length}`);

console.log('\nNew exercises:', newExercises.map(e => e.id).join(', '));
console.log('\nExisting to update:', existingToUpdate.map(e => e.id).join(', '));

module.exports = { newExercises, existingToUpdate, chestExercisesToAdd };