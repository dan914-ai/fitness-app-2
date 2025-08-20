#!/bin/bash

echo "🔧 Fixing syntax errors from broken console.log removals..."

# Fix WorkoutContext.tsx
sed -i '/^\s*isActive:/d' src/contexts/WorkoutContext.tsx
sed -i '/^\s*exerciseCount:/d' src/contexts/WorkoutContext.tsx
sed -i '/^\s*});$/d' src/contexts/WorkoutContext.tsx | head -1

# Fix useNetworkStatus.ts
sed -i '/^\s*status:/d' src/hooks/useNetworkStatus.ts
sed -i '/^\s*isConnected:/d' src/hooks/useNetworkStatus.ts
sed -i '/^\s*lastSync:/d' src/hooks/useNetworkStatus.ts

# Fix ExerciseTrackScreen.tsx
sed -i '/^\s*exerciseId:/d' src/screens/home/ExerciseTrackScreen.tsx
sed -i '/^\s*currentSet:/d' src/screens/home/ExerciseTrackScreen.tsx
sed -i '/^\s*reps:/d' src/screens/home/ExerciseTrackScreen.tsx
sed -i '/^\s*weight:/d' src/screens/home/ExerciseTrackScreen.tsx

# Fix WorkoutCompleteScreen.tsx files
for file in src/screens/home/WorkoutCompleteScreen.tsx src/screens/record/WorkoutCompleteScreen.tsx; do
  if [ -f "$file" ]; then
    sed -i '/^\s*exercises:/d' "$file"
    sed -i '/^\s*duration:/d' "$file"
    sed -i '/^\s*totalSets:/d' "$file"
    sed -i '/^\s*totalVolume:/d' "$file"
  fi
done

# Remove orphaned closing braces and parentheses
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '/^\s*}\);$/d' {} \;

echo "✅ Syntax fixes applied"