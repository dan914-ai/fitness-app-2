// Korean Beginner 12-Week Progressive Workout Program
// 12주 초보자 점진적 운동 프로그램

export interface KoreanProgramExercise {
  name: string;
  sets: number;
  reps?: number | string;
  duration_seconds?: number;
  rest_seconds: number;
  description?: string;
}

export interface KoreanRoutine {
  routine_name: string;
  exercises: KoreanProgramExercise[];
}

export interface KoreanProgramStage {
  stage_number: number;
  stage_name: string;
  duration_weeks: string;
  goal: string;
  weekly_frequency: string;
  daily_routines: Record<string, KoreanRoutine>;
  weekly_schedule: Record<string, string>;
}

export const KOREAN_BEGINNER_PROGRAM = {
  program_name: "12주 초보자 홈트레이닝 프로그램",
  program_description: "운동을 처음 시작하는 분들을 위한 체계적인 12주 프로그램입니다. 기초 체력 향상과 올바른 운동 습관 형성을 목표로 합니다.",
  total_duration_weeks: 12,
  difficulty: "beginner" as const,
  stages: [
    {
      stage_number: 1,
      stage_name: "기초 다지기 (Foundation)",
      duration_weeks: "1-4주",
      goal: "정확한 자세 학습, 근신경계 활성화, 운동 습관 형성",
      weekly_frequency: "주 3회",
      daily_routines: {
        "A": {
          routine_name: "전신 운동 (Full Body Workout)",
          exercises: [
            {
              name: "스쿼트",
              english_name: "Squat",
              sets: 3,
              reps: 12,
              rest_seconds: 60,
              description: "어깨너비로 발을 벌리고 서서 허리를 곧게 펴고 무릎을 굽혀 허벅지가 지면과 수평이 될 때까지 앉았다 일어섭니다."
            },
            {
              name: "푸쉬업",
              english_name: "Push-up",
              sets: 3,
              reps: "최대 반복",
              rest_seconds: 60,
              description: "엎드린 자세에서 어깨너비보다 넓게 손을 짚고, 가슴이 바닥에 닿기 직전까지 몸을 내렸다가 올라옵니다. 무릎을 대고 실시하여 난이도를 조절할 수 있습니다."
            },
            {
              name: "플랭크",
              english_name: "Plank",
              sets: 3,
              duration_seconds: 30,
              rest_seconds: 60,
              description: "팔꿈치를 바닥에 대고 엎드려 머리부터 발끝까지 일직선을 유지하며 버팁니다."
            },
            {
              name: "런지",
              english_name: "Lunge",
              sets: 3,
              reps: "10/leg",
              rest_seconds: 60,
              description: "한 발을 앞으로 내딛으며 무릎을 굽혀 앉았다가 원래 자세로 돌아옵니다. 양쪽 다리를 번갈아 가며 실시합니다."
            },
            {
              name: "브릿지",
              english_name: "Bridge",
              sets: 3,
              reps: 15,
              rest_seconds: 60,
              description: "바닥에 누워 무릎을 세우고 엉덩이를 들어 올려 어깨부터 무릎까지 일직선이 되도록 합니다."
            }
          ]
        }
      },
      weekly_schedule: {
        "월요일": "A",
        "화요일": "휴식",
        "수요일": "A",
        "목요일": "휴식",
        "금요일": "A",
        "토요일": "휴식",
        "일요일": "휴식"
      }
    },
    {
      stage_number: 2,
      stage_name: "성장 가속화 (Acceleration)",
      duration_weeks: "5-8주",
      goal: "근지구력 향상, 점진적 과부하 적용, 운동 다양성 확보",
      weekly_frequency: "주 3회",
      daily_routines: {
        "A": {
          routine_name: "전신 운동 A (Full Body Workout A)",
          exercises: [
            {
              name: "스쿼트",
              english_name: "Squat",
              sets: 3,
              reps: 15,
              rest_seconds: 60
            },
            {
              name: "푸쉬업",
              english_name: "Push-up",
              sets: 3,
              reps: "최대 반복",
              rest_seconds: 60
            },
            {
              name: "플랭크",
              english_name: "Plank",
              sets: 3,
              duration_seconds: 45,
              rest_seconds: 60
            },
            {
              name: "버피",
              english_name: "Burpee",
              sets: 3,
              reps: 10,
              rest_seconds: 90
            }
          ]
        },
        "B": {
          routine_name: "전신 운동 B (Full Body Workout B)",
          exercises: [
            {
              name: "런지",
              english_name: "Lunge",
              sets: 3,
              reps: "12/leg",
              rest_seconds: 60
            },
            {
              name: "브릿지",
              english_name: "Bridge",
              sets: 3,
              reps: 20,
              rest_seconds: 60
            },
            {
              name: "레그 레이즈",
              english_name: "Leg Raise",
              sets: 3,
              reps: 15,
              rest_seconds: 60
            },
            {
              name: "마운틴 클라이머",
              english_name: "Mountain Climber",
              sets: 3,
              duration_seconds: 30,
              rest_seconds: 60
            }
          ]
        }
      },
      weekly_schedule: {
        "월요일": "A",
        "화요일": "휴식",
        "수요일": "B",
        "목요일": "휴식",
        "금요일": "A",
        "토요일": "휴식",
        "일요일": "휴식"
      }
    },
    {
      stage_number: 3,
      stage_name: "습관 완성 (Consolidation)",
      duration_weeks: "9-12주",
      goal: "운동 강도 증대, 실질적 체력 향상, 자신감 구축",
      weekly_frequency: "주 3-4회 (선택)",
      daily_routines: {
        "A": {
          routine_name: "상체 중심 운동 (Upper Body Focus)",
          exercises: [
            {
              name: "다이아몬드 푸쉬업",
              english_name: "Diamond Push-up",
              sets: 4,
              reps: "최대 반복",
              rest_seconds: 60
            },
            {
              name: "플랭크 팔 들기",
              english_name: "Plank with Arm Lift",
              sets: 4,
              duration_seconds: 60,
              rest_seconds: 60
            },
            {
              name: "체어 딥스",
              english_name: "Chair Dips",
              sets: 3,
              reps: 12,
              rest_seconds: 60
            },
            {
              name: "슈퍼맨",
              english_name: "Superman",
              sets: 3,
              reps: 15,
              rest_seconds: 60
            }
          ]
        },
        "B": {
          routine_name: "하체 중심 운동 (Lower Body Focus)",
          exercises: [
            {
              name: "점프 스쿼트",
              english_name: "Jump Squat",
              sets: 4,
              reps: 12,
              rest_seconds: 90
            },
            {
              name: "워킹 런지",
              english_name: "Walking Lunge",
              sets: 3,
              reps: "10 steps/direction",
              rest_seconds: 60
            },
            {
              name: "싱글 레그 브릿지",
              english_name: "Single Leg Bridge",
              sets: 3,
              reps: "12/leg",
              rest_seconds: 60
            },
            {
              name: "카프 레이즈",
              english_name: "Calf Raise",
              sets: 3,
              reps: 20,
              rest_seconds: 45
            }
          ]
        },
        "C": {
          routine_name: "전신 고강도 운동 (Full Body High Intensity)",
          exercises: [
            {
              name: "버피",
              english_name: "Burpee",
              sets: 4,
              reps: 12,
              rest_seconds: 90
            },
            {
              name: "마운틴 클라이머",
              english_name: "Mountain Climber",
              sets: 4,
              duration_seconds: 45,
              rest_seconds: 60
            },
            {
              name: "바이시클 크런치",
              english_name: "Bicycle Crunch",
              sets: 3,
              reps: 20,
              rest_seconds: 60
            },
            {
              name: "점핑 잭",
              english_name: "Jumping Jacks",
              sets: 3,
              duration_seconds: 60,
              rest_seconds: 60
            }
          ]
        }
      },
      weekly_schedule: {
        "월요일": "A",
        "화요일": "휴식",
        "수요일": "B",
        "목요일": "휴식",
        "금요일": "C",
        "토요일": "휴식 또는 가벼운 활동",
        "일요일": "휴식"
      }
    }
  ]
};