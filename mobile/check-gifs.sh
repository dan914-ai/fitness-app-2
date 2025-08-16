#!/bin/bash

urls=(
  "https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/back/58_wide-grip-lat-pulldown.gif"
  "https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/back/back-extension.gif"
  "https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/quadriceps/300_smith-machine-squat-2.gif"
  "https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/quadriceps/barbell-squat.gif"
  "https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/quadriceps/leg-press.gif"
)

for url in "${urls[@]}"; do
  filename=$(basename "$url")
  echo "Checking: $filename"
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" = "200" ]; then
    echo "  ✅ EXISTS (HTTP $status)"
  else
    echo "  ❌ MISSING (HTTP $status)"
  fi
done