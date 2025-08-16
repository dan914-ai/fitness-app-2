#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Translation map for English names to Korean
const translations = {
  // Compound/Full body
  "Clean And Press": "클린 앤 프레스",
  "Crossfit Cluster": "크로스핏 클러스터",
  "Dumbbell Devils Press": "덤벨 데빌스 프레스",
  "Dumbbell Push Jerk": "덤벨 푸시 저크",
  "Muscle Up": "머슬업",
  "Push Jerk": "푸시 저크",
  "Ring Muscle Up": "링 머슬업",
  "Sled Push": "슬레드 푸시",
  "Tire Flip": "타이어 플립",
  
  // Back
  "Back Extension": "백 익스텐션",
  "Lat Pulldown": "랫 풀다운",
  "Wide Grip Lat Pulldown": "와이드 그립 랫 풀다운",
  "Weighted Pull Up": "웨이티드 풀업",
  "Yates Row": "예이츠 로우",
  "Jumping Pull Ups": "점핑 풀업",
  "Negative Pull Up": "네거티브 풀업",
  "Rowing Machine": "로잉 머신",
  
  // Biceps
  "Dumbbell Bicep Curl": "덤벨 바이셉 컬",
  "Hammer Curls": "해머 컬",
  "High Pulley Cable Curl": "하이 풀리 케이블 컬",
  "Preacher Curls": "프리처 컬",
  "Spider Bicep Curl": "스파이더 바이셉 컬",
  "Wide Grip Barbell Curl": "와이드 그립 바벨 컬",
  "Zottman Curl": "조트만 컬",
  
  // Triceps
  "Cobra Push Up": "코브라 푸시업",
  "Dive Bomber Push Ups": "다이브 바머 푸시업",
  "Overhead Tricep Stretch": "오버헤드 트라이셉 스트레치",
  "Triceps Pushdown": "트라이셉 푸시다운",
  "Underhand Tricep Pushdown": "언더핸드 트라이셉 푸시다운",
  
  // Abs
  "Sit Up": "싯업",
  "Toes To Bar": "토즈 투 바",
  
  // Cardio
  "Bike": "바이크",
  "Duck Walk": "덕 워크",
  "Elliptical Machine": "일립티컬 머신",
  "Step Mill": "스텝 밀",
  "Treadmill": "트레드밀",
  
  // Legs
  "Anderson Squat": "앤더슨 스쿼트",
  "Barbell Squat": "바벨 스쿼트",
  "Bulgarian Split Squat": "불가리안 스플릿 스쿼트",
  "Deficit Reverse Lunge": "데피싯 리버스 런지",
  "Frog Squat": "프로그 스쿼트",
  "Front Squat": "프론트 스쿼트",
  "Goblet Squat": "고블릿 스쿼트",
  "Gym Ball Squat": "짐볼 스쿼트",
  "Hack Squat": "핵 스쿼트",
  "Half Knee Bends": "하프 니 벤드",
  "Kettlebell Squat": "케틀벨 스쿼트",
  "Kettlebell Squat Clean": "케틀벨 스쿼트 클린",
  "Leg Press": "레그 프레스",
  "Low Bar Squat": "로우 바 스쿼트",
  "Lunges": "런지",
  "Machine Leg Press": "머신 레그 프레스",
  "Negative Squat": "네거티브 스쿼트",
  "Overhead Squat": "오버헤드 스쿼트",
  "Pistol Squat": "피스톨 스쿼트",
  "Resistance Band Lunge": "레지스턴스 밴드 런지",
  "Reverse Squat": "리버스 스쿼트",
  "Reverse V Squat": "리버스 V 스쿼트",
  "Seated Knee Extension": "시티드 니 익스텐션",
  "Shrimp Squat": "쉬림프 스쿼트",
  "Single Leg Extension": "싱글 레그 익스텐션",
  "Single Leg Press": "싱글 레그 프레스",
  "Smith Machine Lunge": "스미스 머신 런지",
  "Smith Machine Squat 2": "스미스 머신 스쿼트 2",
  "Step Ups": "스텝업",
  "Tempo Squats": "템포 스쿼트",
  "Trap Bar Deadlift": "트랩 바 데드리프트",
  "Zercher Squat": "저처 스쿼트",
  
  // Shoulders
  "Arnold Press": "아놀드 프레스",
  "Handstand Push Up": "핸드스탠드 푸시업",
  "Incline Leaning Dumbbell Lateral Raise": "인클라인 리닝 덤벨 래터럴 레이즈",
  "Landmine Press": "랜드마인 프레스",
  "Leaning Single Arm Dumbbell Lateral Raise": "리닝 싱글 암 덤벨 래터럴 레이즈",
  "Military Press": "밀리터리 프레스",
  "Pike Push Up": "파이크 푸시업",
  "Plate Front Raise": "플레이트 프론트 레이즈",
  "Prone Y Raises": "프론 Y 레이즈",
  "Shoulder Push Up": "숄더 푸시업",
  "Upright Row": "업라이트 로우",
  
  // Chest
  "Assisted Dips": "어시스티드 딥스",
  "Bench Dips": "벤치 딥스",
  "Board Bench Press": "보드 벤치 프레스",
  "Deficit Push Ups": "데피싯 푸시업",
  "Dips": "딥스",
  "Finger Pushups": "핑거 푸시업",
  "Floor Press": "플로어 프레스",
  "Hex Press": "헥스 프레스",
  "Incline Push Up": "인클라인 푸시업",
  "Knee Push Up": "니 푸시업",
  "Knuckle Pushups": "너클 푸시업",
  "Machine Dips": "머신 딥스",
  "Parallel Dips": "패러렐 딥스",
  "Pec Dec Fly": "펙 덱 플라이",
  "Pin Press": "핀 프레스",
  "Plate Chest Press": "플레이트 체스트 프레스",
  "Plyometric Push Up": "플라이오메트릭 푸시업",
  "Push Up": "푸시업",
  "Push Ups With Rotation": "푸시업 위드 로테이션",
  "Resistance Band Push Up": "레지스턴스 밴드 푸시업",
  "Sphinx Push Up": "스핑크스 푸시업",
  "Svend Press": "스벤드 프레스",
  "Weighted Push Up": "웨이티드 푸시업",
  "Wide Grip Bench Press": "와이드 그립 벤치 프레스",
  
  // Calves
  "Single Leg Calf Raise": "싱글 레그 카프 레이즈",
  "Standing Calf Raise": "스탠딩 카프 레이즈",
  
  // Glutes
  "Elevated Glute Bridge": "엘리베이티드 글루트 브릿지",
  "Frog Hip Thrust": "프로그 힙 쓰러스트",
  "Resistance Band Glute Bridge": "레지스턴스 밴드 글루트 브릿지",
  "Single Leg Hip Thrust": "싱글 레그 힙 쓰러스트",
  
  // Hamstrings
  "Barbell Deadlift": "바벨 데드리프트",
  "Deficit Deadlift": "데피싯 데드리프트",
  "Kneeling Leg Curl": "닐링 레그 컬",
  "Landmine Deadlift": "랜드마인 데드리프트",
  "Lying Leg Curl": "라잉 레그 컬",
  "Nordic Curl": "노르딕 컬",
  "Romanian Deadlift": "루마니안 데드리프트",
  "Seated Leg Curl": "시티드 레그 컬",
  "Single Leg Curl": "싱글 레그 컬",
  "Stiff Leg Deadlift": "스티프 레그 데드리프트",
  "Suitcase Deadlift": "슈트케이스 데드리프트",
  "Sumo Deadlift": "스모 데드리프트",
  
  // Traps
  "Barbell Shrug": "바벨 슈러그",
  "Barbell Upright Row": "바벨 업라이트 로우",
  "Cable Shrug": "케이블 슈러그",
  "Cable Upright Row": "케이블 업라이트 로우",
  "Chest Supported Dumbbell Shrug": "체스트 서포티드 덤벨 슈러그",
  "Dumbbell Shrug": "덤벨 슈러그",
  "Dumbbell Upright Row": "덤벨 업라이트 로우",
  "Ez Bar Upright Row": "이지바 업라이트 로우",
  "Single Arm Dumbbell Upright Row": "싱글 암 덤벨 업라이트 로우",
  "Smith Machine Shrug": "스미스 머신 슈러그",
  "Close Grip Bench Press": "클로즈 그립 벤치 프레스",
  
  // Forearms
  "Wrist Push Up": "리스트 푸시업"
};

// Read the database file
const dbPath = path.join(__dirname, '..', 'src', 'data', 'exerciseDatabase.ts');
let dbContent = fs.readFileSync(dbPath, 'utf8');

let fixedCount = 0;

// Replace each English name with Korean
Object.entries(translations).forEach(([english, korean]) => {
  const pattern = new RegExp(`"name":\\s*"${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
  const replacement = `"name": "${korean}"`;
  
  const beforeLength = dbContent.length;
  dbContent = dbContent.replace(pattern, replacement);
  const afterLength = dbContent.length;
  
  if (beforeLength !== afterLength) {
    fixedCount++;
    console.log(`✓ Fixed: ${english} → ${korean}`);
  }
});

// Write the updated content back
fs.writeFileSync(dbPath, dbContent);

console.log(`\n✅ Fixed ${fixedCount} exercise names from English to Korean`);
console.log('Database updated successfully!');