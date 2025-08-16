#!/bin/bash

echo "=== REMOVING CONSOLE.LOG STATEMENTS ==="
echo ""

# Count initial console.logs
initial_count=$(grep -r "console\.log" src --include="*.tsx" --include="*.ts" | wc -l)
echo "Found $initial_count console.log statements"

# Remove console.log statements but keep console.error and console.warn
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '/^\s*console\.log/d' {} \;

# Count remaining console.logs
final_count=$(grep -r "console\.log" src --include="*.tsx" --include="*.ts" | wc -l)
removed=$((initial_count - final_count))

echo "Removed $removed console.log statements"
echo "$final_count console.log statements remaining"

# Show any remaining console.logs (might be inline or complex)
if [ $final_count -gt 0 ]; then
  echo ""
  echo "Remaining console.logs (may need manual review):"
  grep -r "console\.log" src --include="*.tsx" --include="*.ts" | head -10
fi

echo ""
echo "=== COMPLETE ==="