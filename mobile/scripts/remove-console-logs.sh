#!/bin/bash

# Script to remove console.log statements from production code
# Preserves console.error and console.warn for error handling

echo "🧹 Removing console.log statements from production code..."

# Count initial console.log statements
initial_count=$(grep -r "console\.log" src --include="*.ts" --include="*.tsx" | wc -l)
echo "Found $initial_count console.log statements"

# Remove console.log statements but keep console.error and console.warn
find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/debug/*" ! -path "*/__tests__/*" -exec sed -i '/console\.log/d' {} \;

# Count remaining console.log statements
final_count=$(grep -r "console\.log" src --include="*.ts" --include="*.tsx" | wc -l)
removed=$((initial_count - final_count))

echo "✅ Removed $removed console.log statements"
echo "📊 Remaining: $final_count (in debug/test files)"

# Create a production logger utility
cat > src/utils/logger.ts << 'EOF'
/**
 * Production-safe logger utility
 * Only logs in development mode
 */

const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors
    console.error(...args);
  },
  warn: (...args: any[]) => {
    // Always log warnings
    console.warn(...args);
  },
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },
};

export default logger;
EOF

echo "✅ Created production logger utility at src/utils/logger.ts"
echo "📝 Use 'logger.log()' instead of 'console.log()' for development logging"