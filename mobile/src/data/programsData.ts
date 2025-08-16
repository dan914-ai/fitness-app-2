// Professional Workout Programs Data
// This file contains comprehensive workout programs for various disciplines and experience levels

import { WorkoutProgramData } from './programTypes';

// Re-export types for backward compatibility
export type { ProgramExerciseData, WorkoutDayData, WorkoutProgramData } from './programTypes';

// Import powerlifting and bodybuilding programs
import { POWERLIFTING_PROGRAMS } from './powerliftingPrograms';
import { BODYBUILDING_PROGRAMS } from './bodybuildingPrograms';

// Korean Beginner Program converted to standard format
const KOREAN_BEGINNER_PROGRAM: WorkoutProgramData = {
    program_name: "12주 초보자 홈트레이닝 프로그램",
    discipline: "Calisthenics",
    experience_level: "Beginner",
    program_description: "운동을 처음 시작하는 분들을 위한 체계적인 12주 프로그램입니다. 기초 체력 향상과 올바른 운동 습관 형성을 목표로 합니다.",
    weekly_schedule_summary: "주 3회 전신 운동 (월/수/금)",
    periodization_model: "선형 진행 (Linear Progression)",
    program_source_notes: "한국 피트니스 초보자 가이드",
    weekly_workout_plan: [
      {
        day: 1,
        focus: "전신 운동 A - 기초",
        exercises: [
          {
            exercise_name: "스쿼트",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "1",
            notes: "정확한 자세에 집중"
          },
          {
            exercise_name: "푸쉬업",
            sets: 3,
            reps: "최대반복",
            rest_period_minutes: "1",
            notes: "무릎 푸쉬업으로 시작 가능"
          },
          {
            exercise_name: "플랭크",
            sets: 3,
            reps: "30-60초",
            rest_period_minutes: "1",
            notes: "코어 긴장 유지"
          },
          {
            exercise_name: "런지",
            sets: 3,
            reps: "10/leg",
            rest_period_minutes: "1",
            notes: "균형 유지에 집중"
          },
          {
            exercise_name: "브릿지",
            sets: 3,
            reps: "15-20",
            rest_period_minutes: "1",
            notes: "둔근 수축 집중"
          }
        ]
      },
      {
        day: 3,
        focus: "전신 운동 B - 변형",
        exercises: [
          {
            exercise_name: "점프 스쿼트",
            sets: 3,
            reps: "10-12",
            rest_period_minutes: "1.5",
            notes: "착지시 충격 흡수"
          },
          {
            exercise_name: "다이아몬드 푸쉬업",
            sets: 3,
            reps: "최대반복",
            rest_period_minutes: "1",
            notes: "삼두근 집중"
          },
          {
            exercise_name: "마운틴 클라이머",
            sets: 3,
            reps: "30-45초",
            rest_period_minutes: "1",
            notes: "일정한 속도 유지"
          },
          {
            exercise_name: "워킹 런지",
            sets: 3,
            reps: "10걸음",
            rest_period_minutes: "1",
            notes: "전진하며 실시"
          },
          {
            exercise_name: "레그 레이즈",
            sets: 3,
            reps: "12-15",
            rest_period_minutes: "1",
            notes: "하복부 집중"
          }
        ]
      },
      {
        day: 5,
        focus: "전신 운동 C - 고강도",
        exercises: [
          {
            exercise_name: "버피",
            sets: 3,
            reps: "8-10",
            rest_period_minutes: "2",
            notes: "전신 협응력 향상"
          },
          {
            exercise_name: "체어 딥스",
            sets: 3,
            reps: "10-12",
            rest_period_minutes: "1",
            notes: "의자 이용 삼두근 운동"
          },
          {
            exercise_name: "바이시클 크런치",
            sets: 3,
            reps: "20",
            rest_period_minutes: "1",
            notes: "복사근 집중"
          },
          {
            exercise_name: "싱글 레그 브릿지",
            sets: 3,
            reps: "10/leg",
            rest_period_minutes: "1",
            notes: "한쪽씩 실시"
          },
          {
            exercise_name: "점핑 잭",
            sets: 3,
            reps: "45-60초",
            rest_period_minutes: "1",
            notes: "심폐지구력 향상"
          }
        ]
      }
    ],
    program_notes: "1-4주: 기초 다지기 단계 - 정확한 자세 학습\n5-8주: 성장 가속화 단계 - 점진적 과부하 적용\n9-12주: 습관 완성 단계 - 운동 강도 증대"
};

// Combine all programs
export const PROFESSIONAL_PROGRAMS: WorkoutProgramData[] = [
  KOREAN_BEGINNER_PROGRAM,
  ...POWERLIFTING_PROGRAMS,
  ...BODYBUILDING_PROGRAMS
];