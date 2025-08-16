#!/bin/bash

echo "=== CLEANING ORPHANED THUMBNAILS ==="
echo ""

# Find orphaned files (thumbnails not referenced in staticThumbnails.ts)
echo "Finding orphaned thumbnail files..."

# Get all thumbnails referenced in staticThumbnails.ts
grep -o "assets/exercise-thumbnails/[^']*\.jpg" src/constants/staticThumbnails.ts | sort -u > /tmp/referenced_thumbs.txt

# Get all actual thumbnail files
find assets/exercise-thumbnails -name "*.jpg" -type f | sort > /tmp/actual_thumbs.txt

# Find orphaned files
comm -13 /tmp/referenced_thumbs.txt /tmp/actual_thumbs.txt > /tmp/orphaned_thumbs.txt

orphaned_count=$(wc -l < /tmp/orphaned_thumbs.txt)

if [ $orphaned_count -eq 0 ]; then
  echo "✅ No orphaned thumbnails found!"
else
  echo "Found $orphaned_count orphaned thumbnails:"
  echo ""
  
  # Show first 10 orphaned files
  head -10 /tmp/orphaned_thumbs.txt | while read file; do
    size=$(du -h "$file" 2>/dev/null | cut -f1)
    echo "  - $file ($size)"
  done
  
  if [ $orphaned_count -gt 10 ]; then
    echo "  ... and $((orphaned_count - 10)) more"
  fi
  
  # Calculate total size of orphaned files
  total_size=0
  while read file; do
    if [ -f "$file" ]; then
      size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
      total_size=$((total_size + size))
    fi
  done < /tmp/orphaned_thumbs.txt
  
  # Convert to MB
  total_mb=$(echo "scale=2; $total_size / 1048576" | bc 2>/dev/null || echo "unknown")
  echo ""
  echo "Total size of orphaned files: ${total_mb}MB"
  
  # Ask for confirmation before deleting
  echo ""
  echo "These files are not referenced in the app and can be safely deleted."
  echo "Delete orphaned thumbnails? (y/n)"
  read -r confirm
  
  if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    while read file; do
      rm -f "$file"
      echo "  Deleted: $file"
    done < /tmp/orphaned_thumbs.txt
    echo ""
    echo "✅ Cleaned up $orphaned_count orphaned thumbnails"
  else
    echo "Skipped deletion."
  fi
fi

# Clean up temp files
rm -f /tmp/referenced_thumbs.txt /tmp/actual_thumbs.txt /tmp/orphaned_thumbs.txt

echo ""
echo "=== CLEANUP COMPLETE ===