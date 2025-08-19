#!/bin/bash

cd /mnt/c/Users/PW1234/.vscode/new\ finess\ app/mobile/src/data

echo "==================================="
echo "EXERCISE MAPPING VALIDATION REPORT"
echo "==================================="
echo ""

# Extract all unique exercise names from programs
grep -o 'exercise_name: "[^"]*"' bodybuildingPrograms.ts powerliftingPrograms.ts additionalPrograms.ts 2>/dev/null | \
  cut -d'"' -f2 | sort -u > /tmp/all_exercises.txt

total=$(wc -l < /tmp/all_exercises.txt)
echo "Total unique exercises found: $total"
echo ""

# Check each exercise
echo "Checking mappings..."
echo ""

not_mapped=0
mapped=0

echo "❌ UNMAPPED EXERCISES:"
while IFS= read -r exercise; do
  if ! grep -q "\"$exercise\"" ../utils/programConverter.ts 2>/dev/null; then
    echo "  - $exercise"
    ((not_mapped++))
  else
    ((mapped++))
  fi
done < /tmp/all_exercises.txt

echo ""
echo "==================================="
echo "SUMMARY"
echo "==================================="
echo "✅ Mapped: $mapped"
echo "❌ Not Mapped: $not_mapped"
echo "📊 Total: $total"
echo ""

if [ $not_mapped -eq 0 ]; then
  echo "🎉 All exercises are properly mapped!"
else
  echo "⚠️  $not_mapped exercises need mapping!"
fi

echo ""
echo "==================================="
echo "CHECKING FOR DUPLICATE MAPPINGS"
echo "==================================="
echo ""

# Check for duplicate Korean names in mappings
grep 'koreanName:' ../utils/programConverter.ts | \
  sed 's/.*koreanName: "\([^"]*\)".*/\1/' | \
  sort | uniq -c | sort -rn | \
  awk '$1 > 1 {print "Duplicate (" $1 "x): " substr($0, index($0,$2))}'

echo ""
echo "Done!"