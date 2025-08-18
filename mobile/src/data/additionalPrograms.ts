// Additional Popular Workout Programs
import { WorkoutProgramData } from './programTypes';

const additionalPrograms: WorkoutProgramData[] = [
  {
    program_name: 'Jeff Nippard Upper/Lower',
    description: '과학적 접근의 상하체 분할 프로그램',
    discipline: 'Bodybuilding',
    difficulty: 'intermediate',
    duration: 4,
    frequency: 4,
    category: 'Hypertrophy',
    targetAudience: '중급자 근비대',
    weeks: [
      {
        weekNumber: 1,
        name: 'Week 1',
        days: [
          {
            day: 1,
            focus: 'Upper Power',
            exercises: [
              { exercise_name: 'Bench Press', sets: 4, reps: '3-5', rest_period_minutes: '3' },
              { exercise_name: 'Bent-Over Row', sets: 4, reps: '3-5', rest_period_minutes: '3' },
              { exercise_name: 'Overhead Press', sets: 3, reps: '5-8', rest_period_minutes: '2.5' },
              { exercise_name: 'Pull-Ups', sets: 3, reps: '5-8', rest_period_minutes: '2.5' },
              { exercise_name: 'Barbell Curl', sets: 3, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'Overhead Triceps Extension', sets: 3, reps: '8-10', rest_period_minutes: '2' },
            ]
          },
          {
            day: 2,
            focus: 'Lower Power',
            exercises: [
              { exercise_name: 'Barbell Squat', sets: 4, reps: '3-5', rest_period_minutes: '3' },
              { exercise_name: 'Romanian Deadlift', sets: 3, reps: '5-8', rest_period_minutes: '3' },
              { exercise_name: 'Front Squat', sets: 3, reps: '8-10', rest_period_minutes: '2.5' },
              { exercise_name: 'Leg Curl', sets: 3, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'Calf Raise', sets: 4, reps: '10-12', rest_period_minutes: '1.5' },
            ]
          },
          {
            day: 3,
            focus: 'Rest',
            exercises: []
          },
          {
            day: 4,
            focus: 'Upper Hypertrophy',
            exercises: [
              { exercise_name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'Cable Row', sets: 4, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rest_period_minutes: '1.5' },
              { exercise_name: 'Lat Pulldown', sets: 3, reps: '10-12', rest_period_minutes: '1.5' },
              { exercise_name: 'Lateral Raise', sets: 4, reps: '12-15', rest_period_minutes: '1' },
              { exercise_name: 'Face Pull', sets: 4, reps: '15-20', rest_period_minutes: '1' },
            ]
          },
          {
            day: 5,
            focus: 'Lower Hypertrophy',
            exercises: [
              { exercise_name: 'Leg Press', sets: 4, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'Bulgarian Split Squat', sets: 3, reps: '10-12', rest_period_minutes: '1.5' },
              { exercise_name: 'Leg Curl', sets: 3, reps: '12-15', rest_period_minutes: '1.5' },
              { exercise_name: 'Leg Extension', sets: 3, reps: '12-15', rest_period_minutes: '1.5' },
              { exercise_name: 'Calf Raise', sets: 4, reps: '15-20', rest_period_minutes: '1' },
            ]
          }
        ]
      }
    ]
  },
  
  {
    program_name: 'Classic Bro Split',
    description: '전통적인 5일 분할 프로그램',
    discipline: 'Bodybuilding',
    difficulty: 'intermediate',
    duration: 4,
    frequency: 5,
    category: 'Hypertrophy',
    targetAudience: '중급자 근비대',
    weeks: [
      {
        weekNumber: 1,
        name: 'Week 1',
        days: [
          {
            day: 1,
            focus: 'Chest',
            exercises: [
              { exercise_name: 'Bench Press', sets: 4, reps: '6-8', rest_period_minutes: '2.5' },
              { exercise_name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'Cable Crossover', sets: 3, reps: '10-12', rest_period_minutes: '1.5' },
              { exercise_name: 'Dumbbell Fly', sets: 3, reps: '12-15', rest_period_minutes: '1.5' },
              { exercise_name: 'Machine Bench Press', sets: 3, reps: '12-15', rest_period_minutes: '1.5' },
            ]
          },
          {
            day: 2,
            focus: 'Back',
            exercises: [
              { exercise_name: 'Deadlift', sets: 4, reps: '5-6', rest_period_minutes: '3' },
              { exercise_name: 'Pull-Ups', sets: 4, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'Bent-Over Row', sets: 4, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'T-Bar Row', sets: 3, reps: '10-12', rest_period_minutes: '1.5' },
              { exercise_name: 'Cable Row', sets: 3, reps: '12-15', rest_period_minutes: '1.5' },
            ]
          },
          {
            day: 3,
            focus: 'Shoulders',
            exercises: [
              { exercise_name: 'Overhead Press', sets: 4, reps: '6-8', rest_period_minutes: '2.5' },
              { exercise_name: 'Dumbbell Shoulder Press', sets: 3, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'Lateral Raise', sets: 4, reps: '12-15', rest_period_minutes: '1' },
              { exercise_name: 'Face Pull', sets: 3, reps: '15-20', rest_period_minutes: '1' },
              { exercise_name: 'Rear Delt Fly', sets: 3, reps: '15-20', rest_period_minutes: '1' },
            ]
          },
          {
            day: 4,
            focus: 'Arms',
            exercises: [
              { exercise_name: 'Barbell Curl', sets: 4, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'Close-Grip Bench Press', sets: 4, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'Hammer Curl', sets: 3, reps: '10-12', rest_period_minutes: '1.5' },
              { exercise_name: 'Overhead Triceps Extension', sets: 3, reps: '10-12', rest_period_minutes: '1.5' },
              { exercise_name: 'Cable Curl', sets: 3, reps: '12-15', rest_period_minutes: '1' },
              { exercise_name: 'Triceps Pushdown', sets: 3, reps: '12-15', rest_period_minutes: '1' },
            ]
          },
          {
            day: 5,
            focus: 'Legs',
            exercises: [
              { exercise_name: 'Barbell Squat', sets: 4, reps: '6-8', rest_period_minutes: '3' },
              { exercise_name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest_period_minutes: '2.5' },
              { exercise_name: 'Leg Press', sets: 3, reps: '10-12', rest_period_minutes: '2' },
              { exercise_name: 'Leg Curl', sets: 3, reps: '12-15', rest_period_minutes: '1.5' },
              { exercise_name: 'Leg Extension', sets: 3, reps: '12-15', rest_period_minutes: '1.5' },
              { exercise_name: 'Calf Raise', sets: 4, reps: '15-20', rest_period_minutes: '1' },
            ]
          }
        ]
      }
    ]
  },

  {
    program_name: 'Beginner Full Body',
    description: '초보자를 위한 전신 운동 프로그램',
    discipline: 'General Fitness',
    difficulty: 'beginner',
    duration: 4,
    frequency: 3,
    category: 'Beginner',
    targetAudience: '초보자',
    weeks: [
      {
        weekNumber: 1,
        name: 'Week 1',
        days: [
          {
            day: 1,
            focus: 'Full Body A',
            exercises: [
              { exercise_name: 'Barbell Squat', sets: 3, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'Bench Press', sets: 3, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'Bent-Over Row', sets: 3, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'Overhead Press', sets: 3, reps: '10-12', rest_period_minutes: '1.5' },
              { exercise_name: 'Romanian Deadlift', sets: 3, reps: '10-12', rest_period_minutes: '2' },
              { exercise_name: 'Plank', sets: 3, reps: '30-60s', rest_period_minutes: '1' },
            ]
          },
          {
            day: 2,
            focus: 'Rest',
            exercises: []
          },
          {
            day: 3,
            focus: 'Full Body B',
            exercises: [
              { exercise_name: 'Deadlift', sets: 3, reps: '5-6', rest_period_minutes: '3' },
              { exercise_name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest_period_minutes: '1.5' },
              { exercise_name: 'Lat Pulldown', sets: 3, reps: '10-12', rest_period_minutes: '1.5' },
              { exercise_name: 'Leg Press', sets: 3, reps: '12-15', rest_period_minutes: '1.5' },
              { exercise_name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', rest_period_minutes: '1.5' },
              { exercise_name: 'Face Pull', sets: 3, reps: '15-20', rest_period_minutes: '1' },
            ]
          },
          {
            day: 4,
            focus: 'Rest',
            exercises: []
          },
          {
            day: 5,
            focus: 'Full Body C',
            exercises: [
              { exercise_name: 'Front Squat', sets: 3, reps: '8-10', rest_period_minutes: '2' },
              { exercise_name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rest_period_minutes: '1.5' },
              { exercise_name: 'Cable Row', sets: 3, reps: '10-12', rest_period_minutes: '1.5' },
              { exercise_name: 'Walking Lunge', sets: 3, reps: '10-12', rest_period_minutes: '1.5' },
              { exercise_name: 'Lateral Raise', sets: 3, reps: '12-15', rest_period_minutes: '1' },
              { exercise_name: 'Barbell Curl', sets: 3, reps: '12-15', rest_period_minutes: '1' },
            ]
          }
        ]
      }
    ]
  }
];

export default additionalPrograms;