#!/bin/bash

echo "Improving thumbnail quality by extracting cleaner frames..."
echo "This script extracts frames at 0.5 seconds into the GIF to avoid start/end artifacts"

# Create temp directory
mkdir -p temp_gifs
mkdir -p improved_thumbnails

# Function to download and extract better thumbnail
extract_better_thumbnail() {
    local muscle_group=$1
    local exercise_name=$2
    local output_name=$3
    
    echo "Processing: $exercise_name"
    
    # Download GIF
    local gif_url="https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/$muscle_group/$exercise_name.gif"
    curl -s "$gif_url" -o "temp_gifs/$exercise_name.gif"
    
    if [ -f "temp_gifs/$exercise_name.gif" ]; then
        # Try different time positions to find the cleanest frame
        # 0.5s - Usually past any initial motion blur
        ffmpeg -ss 00:00:00.500 -i "temp_gifs/$exercise_name.gif" -vframes 1 -q:v 2 "improved_thumbnails/${output_name}_0.5s.jpg" -y 2>/dev/null
        
        # 0.3s - Alternative if 0.5s is too far
        ffmpeg -ss 00:00:00.300 -i "temp_gifs/$exercise_name.gif" -vframes 1 -q:v 2 "improved_thumbnails/${output_name}_0.3s.jpg" -y 2>/dev/null
        
        # 0.1s - Closer to start but past initial artifacts
        ffmpeg -ss 00:00:00.100 -i "temp_gifs/$exercise_name.gif" -vframes 1 -q:v 2 "improved_thumbnails/${output_name}_0.1s.jpg" -y 2>/dev/null
        
        echo "  ✅ Created 3 versions for comparison"
    else
        echo "  ❌ Failed to download GIF"
    fi
}

# Test with a few exercises that might have issues
echo ""
echo "Testing with exercises that commonly have motion artifacts..."
echo ""

# Abdominals - these often have motion throughout
extract_better_thumbnail "abdominals" "alternate-heel-touches" "alternate-heel-touches"
extract_better_thumbnail "abdominals" "bicycle-crunch" "bicycle-crunch"
extract_better_thumbnail "abdominals" "knee-touch-crunch" "knee-touch-crunch"

# Back exercises - pulldowns often have cable motion
extract_better_thumbnail "back" "lat-pulldown" "lat-pulldown"
extract_better_thumbnail "back" "pull-up" "pull-up"

# Chest - bench press at wrong position looks odd
extract_better_thumbnail "chest" "barbell-bench-press" "barbell-bench-press"
extract_better_thumbnail "chest" "push-up" "push-up"

# Quadriceps - squats need proper starting position
extract_better_thumbnail "quadriceps" "barbell-squat" "barbell-squat"
extract_better_thumbnail "quadriceps" "leg-press" "leg-press"

echo ""
echo "Extraction complete! Check the 'improved_thumbnails' folder."
echo "Compare the different time positions (0.1s, 0.3s, 0.5s) to see which looks cleanest."
echo ""
echo "Once you identify the best timing, we can regenerate all thumbnails with that setting."

# Clean up temp GIFs but keep improved thumbnails for comparison
rm -rf temp_gifs