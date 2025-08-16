#!/bin/bash
# Check for missing thumbnail files

echo "Checking for missing thumbnail files..."

grep "require.*exercise-thumbnails" src/constants/staticThumbnails.ts | while read -r line; do
  # Extract the file path
  file=$(echo "$line" | sed -n "s/.*require('\.\.\/\.\.\/(assets\/exercise-thumbnails[^']*).*/\1/p")
  
  if [ ! -z "$file" ] && [ ! -f "$file" ]; then
    # Extract the ID number from the line
    id=$(echo "$line" | sed -n "s/.*'\\([0-9]*\\)'.*/\1/p")
    echo "Missing ID $id: $file"
  fi
done