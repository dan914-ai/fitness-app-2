#!/bin/bash

# Remove console.log, console.debug, and console.warn statements from src files
echo "Removing console statements from source files..."

find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read file; do
  # Remove console.log, console.debug, console.warn lines
  sed -i '/console\.\(log\|debug\|warn\)/d' "$file"
done

echo "Console statements removed successfully!"