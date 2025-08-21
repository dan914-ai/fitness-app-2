#!/bin/bash

# Update all borderRadius: 12 to 16
echo "Updating borderRadius values..."
find src -name "*.tsx" -type f -exec sed -i 's/borderRadius: 12,/borderRadius: 16,/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/borderRadius: 12$/borderRadius: 16/g' {} \;

# Update shadow opacity values
echo "Updating shadow opacity values..."
find src -name "*.tsx" -type f -exec sed -i 's/shadowOpacity: 0\.1,/shadowOpacity: 0.08,/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/shadowOpacity: 0\.25,/shadowOpacity: 0.08,/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/shadowOpacity: 0\.2,/shadowOpacity: 0.08,/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/shadowOpacity: 0\.15,/shadowOpacity: 0.08,/g' {} \;

# Update shadow radius values
echo "Updating shadow radius values..."
find src -name "*.tsx" -type f -exec sed -i 's/shadowRadius: 4,/shadowRadius: 8,/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/shadowRadius: 3,/shadowRadius: 8,/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/shadowRadius: 2,/shadowRadius: 8,/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/shadowRadius: 5,/shadowRadius: 8,/g' {} \;

# Update borderRadius: 8 to 16 in certain contexts
echo "Updating smaller borderRadius values..."
find src -name "*.tsx" -type f -exec sed -i 's/borderRadius: 8,/borderRadius: 16,/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/borderRadius: 8$/borderRadius: 16/g' {} \;

echo "Style updates complete!"