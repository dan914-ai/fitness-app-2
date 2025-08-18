# Supabase Storage Structure for Exercise GIFs

## Current Folder Organization

All exercise GIFs are stored in the `exercise-gifs` bucket with the following folder structure:

### Muscle Group Folders (311 total exercises)
- **`/back/`** - 48 exercises (등 운동)
- **`/quadriceps/`** - 44 exercises (대퇴사두근)
- **`/pectorals/`** - 42 exercises (가슴)
- **`/deltoids/`** - 38 exercises (어깨/삼각근)
- **`/triceps/`** - 26 exercises (삼두근)
- **`/biceps/`** - 24 exercises (이두근)
- **`/abdominals/`** - 24 exercises (복근)
- **`/glutes/`** - 16 exercises (둔근)
- **`/hamstrings/`** - 15 exercises (햄스트링)
- **`/traps/`** - 10 exercises (승모근)
- **`/compound/`** - 9 exercises (복합 운동)
- **`/forearms/`** - 5 exercises (전완근)
- **`/cardio/`** - 5 exercises (유산소)
- **`/calves/`** - 5 exercises (종아리)

## Naming Convention
All GIF files follow this pattern:
- Lowercase
- Hyphens instead of spaces
- English names
- `.gif` extension

Example: `incline-dumbbell-press.gif`

## Full URL Pattern
```
https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/{folder}/{exercise-name}.gif
```

## Notes on Folder Names
- **`deltoids`** is used instead of `shoulders`
- **`pectorals`** is used instead of `chest`
- **`compound`** folder contains multi-muscle exercises like deadlifts
- **`cardio`** folder contains cardio exercises
- **`forearms`** has its own category

## New Exercises to Upload
When adding new exercises like we did:
1. **Incline Dumbbell Press** → `/pectorals/incline-dumbbell-press.gif`
2. **Machine Bench Press** → `/pectorals/machine-bench-press.gif`

Always check the muscle group and use the existing folder structure!