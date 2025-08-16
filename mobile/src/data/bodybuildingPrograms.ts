// Bodybuilding Programs - 보디빌딩 프로그램
// CBUM Split, PPL, Upper/Lower

import { WorkoutProgramData } from './programTypes';

export const BODYBUILDING_PROGRAMS: WorkoutProgramData[] = [
  {
    program_name: "CBUM의 5일 보디빌딩 분할",
    discipline: "Bodybuilding",
    experience_level: "Advanced",
    program_description: "크리스 범스테드(CBUM)의 클래식 피지크 챔피언십 루틴. 균형잡힌 발달과 미적 비율에 초점을 맞춘 고볼륨 프로그램입니다.",
    weekly_schedule_summary: "주 5회 부위별 분할",
    periodization_model: "볼륨 진행 (Volume Progression)",
    program_source_notes: "Chris Bumstead Classic Physique Training",
    weekly_workout_plan: [
      {
        day: 1,
        focus: "가슴 & 삼두",
        exercises: [
          {
            exercise_name: "Incline Barbell Press",
            sets: 4,
            reps: "8-10",
            rest_period_minutes: "2-3",
            notes: "45도 각도, 가슴 상부 집중"
          },
          {
            exercise_name: "Flat Dumbbell Press",
            sets: 4,
            reps: "10-12",
            rest_period_minutes: "2",
            notes: "전체 가동 범위"
          },
          {
            exercise_name: "Cable Crossover",
            sets: 4,
            reps: "12-15",
            rest_period_minutes: "1.5",
            notes: "피크 수축 집중"
          },
          {
            exercise_name: "Incline Dumbbell Press",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "1.5",
            notes: "30도 각도"
          },
          {
            exercise_name: "Close-Grip Bench Press",
            sets: 4,
            reps: "10-12",
            rest_period_minutes: "2",
            notes: "삼두 집중"
          },
          {
            exercise_name: "Overhead Triceps Extension",
            sets: 4,
            reps: "12-15",
            rest_period_minutes: "1.5",
            notes: "스트레치 포지션"
          },
          {
            exercise_name: "Triceps Pushdown",
            sets: 4,
            reps: "15-20",
            rest_period_minutes: "1",
            notes: "수축 집중"
          }
        ]
      },
      {
        day: 2,
        focus: "등 & 이두",
        exercises: [
          {
            exercise_name: "Bent-Over Row",
            sets: 4,
            reps: "8-10",
            rest_period_minutes: "2-3",
            notes: "등 전체 두께"
          },
          {
            exercise_name: "Lat Pulldown",
            sets: 4,
            reps: "10-12",
            rest_period_minutes: "2",
            notes: "넓은 그립, 광배근 집중"
          },
          {
            exercise_name: "T-Bar Row",
            sets: 4,
            reps: "10-12",
            rest_period_minutes: "2",
            notes: "등 중앙부 집중"
          },
          {
            exercise_name: "Seated Cable Row",
            sets: 4,
            reps: "12-15",
            rest_period_minutes: "1.5",
            notes: "근육 수축 유지"
          },
          {
            exercise_name: "Barbell Curl",
            sets: 4,
            reps: "10-12",
            rest_period_minutes: "2",
            notes: "이두근 전체"
          },
          {
            exercise_name: "Incline Dumbbell Curl",
            sets: 4,
            reps: "12-15",
            rest_period_minutes: "1.5",
            notes: "스트레치 포지션"
          },
          {
            exercise_name: "Hammer Curl",
            sets: 3,
            reps: "15-20",
            rest_period_minutes: "1",
            notes: "전완근 포함"
          }
        ]
      },
      {
        day: 3,
        focus: "다리",
        exercises: [
          {
            exercise_name: "Barbell Squat",
            sets: 5,
            reps: "8-10",
            rest_period_minutes: "3",
            notes: "대퇴사두근 집중"
          },
          {
            exercise_name: "Romanian Deadlift",
            sets: 4,
            reps: "10-12",
            rest_period_minutes: "2-3",
            notes: "햄스트링 집중"
          },
          {
            exercise_name: "Leg Press",
            sets: 4,
            reps: "12-15",
            rest_period_minutes: "2",
            notes: "높은 볼륨"
          },
          {
            exercise_name: "Bulgarian Split Squat",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "2",
            notes: "각 다리별"
          },
          {
            exercise_name: "Leg Curl",
            sets: 4,
            reps: "12-15",
            rest_period_minutes: "1.5",
            notes: "햄스트링 고립"
          },
          {
            exercise_name: "Leg Extension",
            sets: 4,
            reps: "15-20",
            rest_period_minutes: "1.5",
            notes: "대퇴사두근 마무리"
          },
          {
            exercise_name: "Calf Raise",
            sets: 4,
            reps: "15-20",
            rest_period_minutes: "1",
            notes: "종아리"
          }
        ]
      },
      {
        day: 5,
        focus: "어깨 & 승모근",
        exercises: [
          {
            exercise_name: "Overhead Press",
            sets: 4,
            reps: "8-10",
            rest_period_minutes: "2-3",
            notes: "전면 삼각근"
          },
          {
            exercise_name: "Dumbbell Shoulder Press",
            sets: 4,
            reps: "10-12",
            rest_period_minutes: "2",
            notes: "균형 발달"
          },
          {
            exercise_name: "Lateral Raise",
            sets: 5,
            reps: "12-15",
            rest_period_minutes: "1.5",
            notes: "측면 삼각근"
          },
          {
            exercise_name: "Cable Rear Delt Fly",
            sets: 4,
            reps: "15-20",
            rest_period_minutes: "1",
            notes: "후면 삼각근"
          },
          {
            exercise_name: "Arnold Press",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "1.5",
            notes: "전체 삼각근"
          },
          {
            exercise_name: "Dumbbell Shrug",
            sets: 4,
            reps: "12-15",
            rest_period_minutes: "1.5",
            notes: "승모근"
          },
          {
            exercise_name: "Face Pulls",
            sets: 3,
            reps: "15-20",
            rest_period_minutes: "1",
            notes: "후면 삼각근 마무리"
          }
        ]
      },
      {
        day: 6,
        focus: "팔 집중",
        exercises: [
          {
            exercise_name: "Barbell Curl",
            sets: 4,
            reps: "8-10",
            rest_period_minutes: "2",
            notes: "이두근 질량"
          },
          {
            exercise_name: "Close-Grip Bench Press",
            sets: 4,
            reps: "8-10",
            rest_period_minutes: "2",
            notes: "삼두근 질량"
          },
          {
            exercise_name: "Hammer Curl",
            sets: 4,
            reps: "10-12",
            rest_period_minutes: "1.5",
            notes: "이두근 & 전완근"
          },
          {
            exercise_name: "Skull Crusher",
            sets: 4,
            reps: "10-12",
            rest_period_minutes: "1.5",
            notes: "삼두근 장두"
          },
          {
            exercise_name: "Incline Dumbbell Curl",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "1",
            notes: "이두근 스트레치"
          },
          {
            exercise_name: "Overhead Triceps Extension",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "1",
            notes: "삼두근 스트레치"
          },
          {
            exercise_name: "Triceps Pushdown",
            sets: 3,
            reps: "15-20",
            rest_period_minutes: "1",
            notes: "마무리 펌핑"
          }
        ]
      }
    ],
    program_notes: "볼륨과 강도를 점진적으로 증가시키며, 각 부위별 2-3일 휴식 확보. 영양과 수면이 매우 중요!"
  },
  {
    program_name: "Push-Pull-Legs (PPL) 6일 분할",
    discipline: "Bodybuilding",
    experience_level: "Intermediate",
    program_description: "가장 인기 있는 보디빌딩 분할 중 하나. 주 2회씩 각 근육군을 자극하여 최적의 성장을 도모합니다.",
    weekly_schedule_summary: "주 6회 (Push/Pull/Legs x2)",
    periodization_model: "선형 진행 + 주기적 디로드",
    program_source_notes: "Classic PPL Split",
    weekly_workout_plan: [
      {
        day: 1,
        focus: "Push A (가슴, 어깨, 삼두)",
        exercises: [
          {
            exercise_name: "Bench Press",
            sets: 4,
            reps: "6-8",
            rest_period_minutes: "3",
            notes: "헤비 데이"
          },
          {
            exercise_name: "Overhead Press",
            sets: 4,
            reps: "8-10",
            rest_period_minutes: "2-3",
            notes: "어깨 복합운동"
          },
          {
            exercise_name: "Incline Dumbbell Press",
            sets: 3,
            reps: "10-12",
            rest_period_minutes: "2",
            notes: "상부 가슴"
          },
          {
            exercise_name: "Lateral Raise",
            sets: 4,
            reps: "12-15",
            rest_period_minutes: "1.5",
            notes: "측면 삼각근"
          },
          {
            exercise_name: "Cable Crossover",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "1.5",
            notes: "가슴 고립"
          },
          {
            exercise_name: "Triceps Pushdown",
            sets: 4,
            reps: "12-15",
            rest_period_minutes: "1",
            notes: "삼두 마무리"
          }
        ]
      },
      {
        day: 2,
        focus: "Pull A (등, 이두)",
        exercises: [
          {
            exercise_name: "Deadlift",
            sets: 4,
            reps: "5-6",
            rest_period_minutes: "3-4",
            notes: "헤비 데이"
          },
          {
            exercise_name: "Pull-Ups",
            sets: 4,
            reps: "8-12",
            rest_period_minutes: "2",
            notes: "가중 가능"
          },
          {
            exercise_name: "Barbell Row",
            sets: 4,
            reps: "8-10",
            rest_period_minutes: "2",
            notes: "등 두께"
          },
          {
            exercise_name: "Lat Pulldown",
            sets: 3,
            reps: "10-12",
            rest_period_minutes: "1.5",
            notes: "광배근 너비"
          },
          {
            exercise_name: "Barbell Curl",
            sets: 4,
            reps: "10-12",
            rest_period_minutes: "1.5",
            notes: "이두근"
          },
          {
            exercise_name: "Hammer Curl",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "1",
            notes: "이두 & 전완"
          }
        ]
      },
      {
        day: 3,
        focus: "Legs A (대퇴사두근 중심)",
        exercises: [
          {
            exercise_name: "Barbell Squat",
            sets: 4,
            reps: "6-8",
            rest_period_minutes: "3",
            notes: "헤비 데이"
          },
          {
            exercise_name: "Front Squat",
            sets: 3,
            reps: "8-10",
            rest_period_minutes: "2-3",
            notes: "대퇴사두근 집중"
          },
          {
            exercise_name: "Leg Press",
            sets: 4,
            reps: "12-15",
            rest_period_minutes: "2",
            notes: "높은 볼륨"
          },
          {
            exercise_name: "Walking Lunge",
            sets: 3,
            reps: "10-12",
            rest_period_minutes: "2",
            notes: "각 다리별"
          },
          {
            exercise_name: "Leg Extension",
            sets: 4,
            reps: "15-20",
            rest_period_minutes: "1",
            notes: "대퇴사두근 고립"
          },
          {
            exercise_name: "Calf Raise",
            sets: 4,
            reps: "12-15",
            rest_period_minutes: "1",
            notes: "종아리"
          }
        ]
      },
      {
        day: 4,
        focus: "Push B (어깨, 가슴, 삼두)",
        exercises: [
          {
            exercise_name: "Dumbbell Shoulder Press",
            sets: 4,
            reps: "8-10",
            rest_period_minutes: "2",
            notes: "어깨 중심"
          },
          {
            exercise_name: "Incline Barbell Press",
            sets: 4,
            reps: "8-10",
            rest_period_minutes: "2",
            notes: "상부 가슴"
          },
          {
            exercise_name: "Machine Shoulder Press",
            sets: 3,
            reps: "10-12",
            rest_period_minutes: "1.5",
            notes: "어깨 볼륨"
          },
          {
            exercise_name: "Dips",
            sets: 3,
            reps: "10-12",
            rest_period_minutes: "2",
            notes: "가슴/삼두"
          },
          {
            exercise_name: "Lateral Raise",
            sets: 4,
            reps: "15-20",
            rest_period_minutes: "1",
            notes: "측면 삼각근"
          },
          {
            exercise_name: "Overhead Triceps Extension",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "1",
            notes: "삼두 스트레치"
          }
        ]
      },
      {
        day: 5,
        focus: "Pull B (등, 이두)",
        exercises: [
          {
            exercise_name: "T-Bar Row",
            sets: 4,
            reps: "8-10",
            rest_period_minutes: "2",
            notes: "등 중앙부"
          },
          {
            exercise_name: "Chin-Ups",
            sets: 4,
            reps: "8-12",
            rest_period_minutes: "2",
            notes: "이두 포함"
          },
          {
            exercise_name: "Dumbbell Row",
            sets: 4,
            reps: "10-12",
            rest_period_minutes: "1.5",
            notes: "일측성"
          },
          {
            exercise_name: "Straight Arm Pulldown",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "1.5",
            notes: "광배근 고립"
          },
          {
            exercise_name: "Incline Dumbbell Curl",
            sets: 4,
            reps: "10-12",
            rest_period_minutes: "1.5",
            notes: "이두 스트레치"
          },
          {
            exercise_name: "Bicep Curls (variation)",
            sets: 3,
            reps: "15-20",
            rest_period_minutes: "1",
            notes: "이두 펌핑"
          }
        ]
      },
      {
        day: 6,
        focus: "Legs B (햄스트링 & 둔근)",
        exercises: [
          {
            exercise_name: "Romanian Deadlift",
            sets: 4,
            reps: "8-10",
            rest_period_minutes: "2-3",
            notes: "햄스트링 중심"
          },
          {
            exercise_name: "Bulgarian Split Squat",
            sets: 4,
            reps: "10-12",
            rest_period_minutes: "2",
            notes: "각 다리별"
          },
          {
            exercise_name: "Leg Curl",
            sets: 4,
            reps: "12-15",
            rest_period_minutes: "1.5",
            notes: "햄스트링 고립"
          },
          {
            exercise_name: "Stiff-Legged Deadlift",
            sets: 3,
            reps: "10-12",
            rest_period_minutes: "2",
            notes: "햄스트링 스트레치"
          },
          {
            exercise_name: "Glute Kickback Machine",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "1",
            notes: "둔근 고립"
          },
          {
            exercise_name: "Seated Calf Raise",
            sets: 4,
            reps: "15-20",
            rest_period_minutes: "1",
            notes: "종아리"
          }
        ]
      }
    ],
    program_notes: "Push A/B, Pull A/B, Legs A/B로 변형을 주어 지루함 방지. 4주마다 디로드 주간 권장."
  },
  {
    program_name: "Upper-Lower 4일 분할",
    discipline: "Bodybuilding",
    experience_level: "Intermediate",
    program_description: "상체와 하체를 번갈아가며 훈련하는 효율적인 4일 프로그램. 근력과 근비대를 동시에 추구합니다.",
    weekly_schedule_summary: "주 4회 (상체/하체/휴식/상체/하체)",
    periodization_model: "DUP (Daily Undulating Periodization)",
    program_source_notes: "Upper-Lower Split Template",
    weekly_workout_plan: [
      {
        day: 1,
        focus: "상체 A (근력)",
        exercises: [
          {
            exercise_name: "Bench Press",
            sets: 5,
            reps: "3-5",
            rest_period_minutes: "3",
            notes: "헤비 데이"
          },
          {
            exercise_name: "Bent-Over Row",
            sets: 5,
            reps: "3-5",
            rest_period_minutes: "3",
            notes: "헤비 데이"
          },
          {
            exercise_name: "Overhead Press",
            sets: 4,
            reps: "5-6",
            rest_period_minutes: "2-3",
            notes: "어깨 근력"
          },
          {
            exercise_name: "Pull-Ups",
            sets: 4,
            reps: "6-8",
            rest_period_minutes: "2",
            notes: "가중 풀업"
          },
          {
            exercise_name: "Barbell Curl",
            sets: 3,
            reps: "8-10",
            rest_period_minutes: "1.5",
            notes: "이두근"
          },
          {
            exercise_name: "Close-Grip Bench Press",
            sets: 3,
            reps: "8-10",
            rest_period_minutes: "1.5",
            notes: "삼두근"
          }
        ]
      },
      {
        day: 2,
        focus: "하체 A (근력)",
        exercises: [
          {
            exercise_name: "Barbell Squat",
            sets: 5,
            reps: "3-5",
            rest_period_minutes: "3",
            notes: "헤비 데이"
          },
          {
            exercise_name: "Romanian Deadlift",
            sets: 4,
            reps: "5-6",
            rest_period_minutes: "2-3",
            notes: "햄스트링 근력"
          },
          {
            exercise_name: "Front Squat",
            sets: 3,
            reps: "6-8",
            rest_period_minutes: "2",
            notes: "대퇴사두근"
          },
          {
            exercise_name: "Leg Press",
            sets: 3,
            reps: "8-10",
            rest_period_minutes: "2",
            notes: "다리 전체"
          },
          {
            exercise_name: "Leg Curl",
            sets: 3,
            reps: "10-12",
            rest_period_minutes: "1.5",
            notes: "햄스트링"
          },
          {
            exercise_name: "Calf Raise",
            sets: 4,
            reps: "10-12",
            rest_period_minutes: "1",
            notes: "종아리"
          }
        ]
      },
      {
        day: 4,
        focus: "상체 B (볼륨)",
        exercises: [
          {
            exercise_name: "Incline Dumbbell Press",
            sets: 4,
            reps: "8-12",
            rest_period_minutes: "2",
            notes: "볼륨 데이"
          },
          {
            exercise_name: "Seated Cable Row",
            sets: 4,
            reps: "8-12",
            rest_period_minutes: "2",
            notes: "등 볼륨"
          },
          {
            exercise_name: "Dumbbell Shoulder Press",
            sets: 3,
            reps: "10-12",
            rest_period_minutes: "1.5",
            notes: "어깨 볼륨"
          },
          {
            exercise_name: "Lat Pulldown",
            sets: 3,
            reps: "10-12",
            rest_period_minutes: "1.5",
            notes: "광배근"
          },
          {
            exercise_name: "Cable Crossover",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "1",
            notes: "가슴 고립"
          },
          {
            exercise_name: "Lateral Raise",
            sets: 4,
            reps: "12-15",
            rest_period_minutes: "1",
            notes: "측면 삼각근"
          },
          {
            exercise_name: "Triceps Extension (variation)",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "1",
            notes: "삼두 고립"
          }
        ]
      },
      {
        day: 5,
        focus: "하체 B (볼륨)",
        exercises: [
          {
            exercise_name: "Leg Press",
            sets: 4,
            reps: "10-15",
            rest_period_minutes: "2",
            notes: "볼륨 데이"
          },
          {
            exercise_name: "Bulgarian Split Squat",
            sets: 3,
            reps: "10-12",
            rest_period_minutes: "2",
            notes: "각 다리별"
          },
          {
            exercise_name: "Stiff-Legged Deadlift",
            sets: 3,
            reps: "10-12",
            rest_period_minutes: "2",
            notes: "햄스트링"
          },
          {
            exercise_name: "Walking Lunge",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "1.5",
            notes: "다리 전체"
          },
          {
            exercise_name: "Leg Extension",
            sets: 3,
            reps: "15-20",
            rest_period_minutes: "1",
            notes: "대퇴사두근"
          },
          {
            exercise_name: "Leg Curl",
            sets: 3,
            reps: "15-20",
            rest_period_minutes: "1",
            notes: "햄스트링"
          },
          {
            exercise_name: "Seated Calf Raise",
            sets: 4,
            reps: "15-20",
            rest_period_minutes: "1",
            notes: "종아리"
          }
        ]
      }
    ],
    program_notes: "A 세션은 근력(3-6회), B 세션은 볼륨(8-15회) 중심. 매주 무게를 점진적으로 증가."
  }
];