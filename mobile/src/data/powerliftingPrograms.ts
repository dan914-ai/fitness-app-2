// Powerlifting Programs - 파워리프팅 프로그램
// StrongLifts 5x5 and Starting Strength

import { WorkoutProgramData } from './programTypes';

export const POWERLIFTING_PROGRAMS: WorkoutProgramData[] = [
  {
    program_name: "스트롱리프트 5x5 (StrongLifts 5x5)",
    discipline: "Powerlifting" as const,
    experience_level: "Beginner" as const,
    program_description: "가장 유명한 초급자 파워리프팅 프로그램. 5가지 핵심 운동을 주 3회, 5회씩 5세트 수행하여 빠른 근력 향상을 목표로 합니다.",
    weekly_schedule_summary: "주 3회 (월/수/금) A/B 교대",
    periodization_model: "선형 증량 (Linear Progression)",
    program_source_notes: "Mehdi의 StrongLifts 5x5",
    weekly_workout_plan: [
      {
        day: 1,
        focus: "Workout A - 스쿼트/벤치/로우",
        exercises: [
          {
            exercise_name: "스쿼트",
            sets: 5,
            reps: "5",
            rest_period_minutes: "3-5",
            notes: "매 세션 2.5kg 증량"
          },
          {
            exercise_name: "벤치프레스",
            sets: 5,
            reps: "5",
            rest_period_minutes: "3-5",
            notes: "매 세션 2.5kg 증량"
          },
          {
            exercise_name: "바벨 로우",
            sets: 5,
            reps: "5",
            rest_period_minutes: "3-5",
            notes: "매 세션 2.5kg 증량"
          }
        ]
      },
      {
        day: 3,
        focus: "Workout B - 스쿼트/오버헤드/데드리프트",
        exercises: [
          {
            exercise_name: "스쿼트",
            sets: 5,
            reps: "5",
            rest_period_minutes: "3-5",
            notes: "매 세션 2.5kg 증량"
          },
          {
            exercise_name: "오버헤드 프레스",
            sets: 5,
            reps: "5",
            rest_period_minutes: "3-5",
            notes: "매 세션 2.5kg 증량"
          },
          {
            exercise_name: "데드리프트",
            sets: 1,
            reps: "5",
            rest_period_minutes: "N/A",
            notes: "매 세션 5kg 증량"
          }
        ]
      },
      {
        day: 5,
        focus: "Workout A - 스쿼트/벤치/로우",
        exercises: [
          {
            exercise_name: "스쿼트",
            sets: 5,
            reps: "5",
            rest_period_minutes: "3-5",
            notes: "매 세션 2.5kg 증량"
          },
          {
            exercise_name: "벤치프레스",
            sets: 5,
            reps: "5",
            rest_period_minutes: "3-5",
            notes: "매 세션 2.5kg 증량"
          },
          {
            exercise_name: "바벨 로우",
            sets: 5,
            reps: "5",
            rest_period_minutes: "3-5",
            notes: "매 세션 2.5kg 증량"
          }
        ]
      }
    ],
    program_notes: "초보자용 선형 증량 프로그램. 실패 시 같은 무게 3회 시도 후 10% 디로드. 워밍업 필수!"
  },
  {
    program_name: "스타팅 스트렝스 (Starting Strength)",
    discipline: "Powerlifting" as const,
    experience_level: "Beginner" as const,
    program_description: "마크 리피토의 3x5 기반 파워리프팅 프로그램. 극도로 단순하면서도 효과적인 근력 증가에 집중합니다.",
    weekly_schedule_summary: "주 3회 (월/수/금) A/B 교대",
    periodization_model: "선형 증량 (Linear Progression)",
    program_source_notes: "Mark Rippetoe's Starting Strength",
    weekly_workout_plan: [
      {
        day: 1,
        focus: "Phase 1 - Workout A",
        exercises: [
          {
            exercise_name: "스쿼트",
            sets: 3,
            reps: "5",
            rest_period_minutes: "3-5",
            notes: "매 세션 2.5-5kg 증량"
          },
          {
            exercise_name: "벤치프레스",
            sets: 3,
            reps: "5",
            rest_period_minutes: "3-5",
            notes: "매 세션 1.25-2.5kg 증량"
          },
          {
            exercise_name: "데드리프트",
            sets: 1,
            reps: "5",
            rest_period_minutes: "N/A",
            notes: "매 세션 5-10kg 증량"
          }
        ]
      },
      {
        day: 3,
        focus: "Phase 1 - Workout B",
        exercises: [
          {
            exercise_name: "스쿼트",
            sets: 3,
            reps: "5",
            rest_period_minutes: "3-5",
            notes: "매 세션 2.5-5kg 증량"
          },
          {
            exercise_name: "오버헤드 프레스",
            sets: 3,
            reps: "5",
            rest_period_minutes: "3-5",
            notes: "매 세션 1.25-2.5kg 증량"
          },
          {
            exercise_name: "데드리프트",
            sets: 1,
            reps: "5",
            rest_period_minutes: "N/A",
            notes: "매 세션 5-10kg 증량"
          }
        ]
      },
      {
        day: 5,
        focus: "Phase 1 - Workout A",
        exercises: [
          {
            exercise_name: "스쿼트",
            sets: 3,
            reps: "5",
            rest_period_minutes: "3-5",
            notes: "매 세션 2.5-5kg 증량"
          },
          {
            exercise_name: "벤치프레스",
            sets: 3,
            reps: "5",
            rest_period_minutes: "3-5",
            notes: "매 세션 1.25-2.5kg 증량"
          },
          {
            exercise_name: "데드리프트",
            sets: 1,
            reps: "5",
            rest_period_minutes: "N/A",
            notes: "매 세션 5-10kg 증량"
          }
        ]
      }
    ],
    program_notes: "Phase 2에서는 파워 클린 추가 가능. 친업을 보조 운동으로 권장. 프로그램의 단순성 유지가 핵심!"
  },
  {
    program_name: "상급자 블록 주기화 프로그램",
    discipline: "Powerlifting" as const,
    experience_level: "Advanced" as const,
    program_description: "12주 대회 준비를 위한 블록 주기화 프로그램. 근비대, 근력, 피킹 단계로 구성됩니다.",
    weekly_schedule_summary: "주 4회 상/하체 분할",
    periodization_model: "블록 주기화 (Block Periodization)",
    program_source_notes: "일반적인 파워리프팅 대회 준비 템플릿",
    weekly_workout_plan: [
      {
        day: 1,
        focus: "상체 근력 (스쿼트/벤치)",
        exercises: [
          {
            exercise_name: "스쿼트",
            sets: 5,
            reps: "3-5",
            rest_period_minutes: "3-5",
            notes: "RPE 8-9"
          },
          {
            exercise_name: "벤치프레스",
            sets: 5,
            reps: "3-5",
            rest_period_minutes: "3-5",
            notes: "RPE 8-9"
          },
          {
            exercise_name: "클로즈그립 벤치프레스",
            sets: 3,
            reps: "6-8",
            rest_period_minutes: "2-3",
            notes: "보조 운동"
          },
          {
            exercise_name: "바벨 로우",
            sets: 4,
            reps: "8-10",
            rest_period_minutes: "2",
            notes: "보조 운동"
          }
        ]
      },
      {
        day: 2,
        focus: "하체 근력 (데드리프트)",
        exercises: [
          {
            exercise_name: "데드리프트",
            sets: 5,
            reps: "3-5",
            rest_period_minutes: "3-5",
            notes: "RPE 8-9"
          },
          {
            exercise_name: "프론트 스쿼트",
            sets: 3,
            reps: "5-8",
            rest_period_minutes: "2-3",
            notes: "보조 운동"
          },
          {
            exercise_name: "루마니안 데드리프트",
            sets: 3,
            reps: "8-10",
            rest_period_minutes: "2",
            notes: "보조 운동"
          },
          {
            exercise_name: "레그 컬",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "1.5",
            notes: "고립 운동"
          }
        ]
      },
      {
        day: 4,
        focus: "상체 볼륨 (벤치 변형)",
        exercises: [
          {
            exercise_name: "인클라인 벤치프레스",
            sets: 4,
            reps: "8-10",
            rest_period_minutes: "2-3",
            notes: "변형 운동"
          },
          {
            exercise_name: "덤벨 벤치프레스",
            sets: 3,
            reps: "10-12",
            rest_period_minutes: "2",
            notes: "볼륨 작업"
          },
          {
            exercise_name: "오버헤드 프레스",
            sets: 3,
            reps: "6-8",
            rest_period_minutes: "2-3",
            notes: "보조 운동"
          },
          {
            exercise_name: "풀업",
            sets: 4,
            reps: "6-10",
            rest_period_minutes: "2",
            notes: "보조 운동"
          }
        ]
      },
      {
        day: 6,
        focus: "하체 볼륨 (스쿼트 변형)",
        exercises: [
          {
            exercise_name: "백 스쿼트",
            sets: 4,
            reps: "6-8",
            rest_period_minutes: "3",
            notes: "볼륨 작업"
          },
          {
            exercise_name: "레그 프레스",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "2",
            notes: "보조 운동"
          },
          {
            exercise_name: "불가리안 스플릿 스쿼트",
            sets: 3,
            reps: "10-12/leg",
            rest_period_minutes: "2",
            notes: "일측성 운동"
          },
          {
            exercise_name: "카프 레이즈",
            sets: 4,
            reps: "15-20",
            rest_period_minutes: "1",
            notes: "고립 운동"
          }
        ]
      }
    ],
    program_notes: "블록 1(1-4주): 근비대 집중, 높은 볼륨\n블록 2(5-8주): 근력 집중, 중간 볼륨, 높은 강도\n블록 3(9-11주): 피킹, 낮은 볼륨, 매우 높은 강도\n블록 4(12주): 테이퍼링 및 대회"
  }
];