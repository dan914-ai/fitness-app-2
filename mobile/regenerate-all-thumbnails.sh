#!/bin/bash

echo "========================================="
echo "Regenerating ALL Exercise Thumbnails"
echo "Using 0.3s offset for cleaner frames"
echo "========================================="

# Configuration
FRAME_TIME="00:00:00.300"  # 0.3 seconds - good balance for most exercises
BACKUP_DIR="assets/exercise-thumbnails-backup-$(date +%Y%m%d-%H%M%S)"
TEMP_DIR="temp_gifs"
SUPABASE_URL="https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs"

# Create backup of existing thumbnails
echo ""
echo "Step 1: Backing up existing thumbnails..."
cp -r assets/exercise-thumbnails "$BACKUP_DIR"
echo "✅ Backed up to: $BACKUP_DIR"

# Create temp directory
mkdir -p "$TEMP_DIR"

# Counter for statistics
TOTAL=0
SUCCESS=0
FAILED=0

# Function to process a single exercise
process_exercise() {
    local muscle_group=$1
    local gif_name=$2
    local jpg_name=$3
    
    TOTAL=$((TOTAL + 1))
    
    # Download GIF
    local gif_url="$SUPABASE_URL/$muscle_group/$gif_name"
    local temp_gif="$TEMP_DIR/${gif_name}"
    local output_jpg="assets/exercise-thumbnails/$muscle_group/$jpg_name"
    
    # Download quietly
    curl -s "$gif_url" -o "$temp_gif" 2>/dev/null
    
    if [ -f "$temp_gif" ] && [ -s "$temp_gif" ]; then
        # Extract frame at specified time
        ffmpeg -ss "$FRAME_TIME" -i "$temp_gif" -vframes 1 -q:v 2 "$output_jpg" -y 2>/dev/null
        
        if [ $? -eq 0 ]; then
            SUCCESS=$((SUCCESS + 1))
            echo "  ✅ $jpg_name"
        else
            # Fallback to first frame if timestamp fails
            ffmpeg -i "$temp_gif" -vframes 1 -q:v 2 "$output_jpg" -y 2>/dev/null
            if [ $? -eq 0 ]; then
                SUCCESS=$((SUCCESS + 1))
                echo "  ⚠️  $jpg_name (used first frame as fallback)"
            else
                FAILED=$((FAILED + 1))
                echo "  ❌ $jpg_name (failed)"
            fi
        fi
        
        # Clean up temp file
        rm -f "$temp_gif"
    else
        FAILED=$((FAILED + 1))
        echo "  ❌ $jpg_name (download failed)"
    fi
}

echo ""
echo "Step 2: Processing exercises by muscle group..."
echo ""

# ABDOMINALS
echo "Processing ABDOMINALS..."
process_exercise "abdominals" "alternate-heel-touches.gif" "alternate-heel-touches.jpg"
process_exercise "abdominals" "bicycle-crunch.gif" "bicycle-crunch.jpg"
process_exercise "abdominals" "knee-touch-crunch.gif" "knee-touch-crunch.jpg"
process_exercise "abdominals" "ab-roller.gif" "ab-roller.jpg"
process_exercise "abdominals" "captains-chair-knee-raise.gif" "captains-chair-knee-raise.jpg"
process_exercise "abdominals" "captains-chair-leg-raise.gif" "captains-chair-leg-raise.jpg"
process_exercise "abdominals" "decline-crunch.gif" "decline-crunch.jpg"
process_exercise "abdominals" "flat-bench-leg-pull-in.gif" "flat-bench-leg-pull-in.jpg"
process_exercise "abdominals" "hanging-knee-raise.gif" "hanging-knee-raise.jpg"
process_exercise "abdominals" "hanging-leg-raise.gif" "hanging-leg-raise.jpg"
process_exercise "abdominals" "lying-leg-raise.gif" "lying-leg-raise.jpg"
process_exercise "abdominals" "plank.gif" "plank.jpg"
process_exercise "abdominals" "reverse-crunch.gif" "reverse-crunch.jpg"
process_exercise "abdominals" "russian-twist.gif" "russian-twist.jpg"
process_exercise "abdominals" "sit-up.gif" "sit-up.jpg"
process_exercise "abdominals" "v-up.gif" "v-up.jpg"
process_exercise "abdominals" "weighted-crunch.gif" "weighted-crunch.jpg"

# BACK
echo ""
echo "Processing BACK..."
process_exercise "back" "lat-pulldown.gif" "lat-pulldown.jpg"
process_exercise "back" "pull-up.gif" "pull-up.jpg"
process_exercise "back" "barbell-row.gif" "barbell-row.jpg"
process_exercise "back" "cable-row.gif" "cable-row.jpg"
process_exercise "back" "chin-up.gif" "chin-up.jpg"
process_exercise "back" "close-grip-lat-pulldown.gif" "close-grip-lat-pulldown.jpg"
process_exercise "back" "deadlift.gif" "deadlift.jpg"
process_exercise "back" "dumbbell-row.gif" "dumbbell-row.jpg"
process_exercise "back" "inverted-row.gif" "inverted-row.jpg"
process_exercise "back" "rack-pull.gif" "rack-pull.jpg"
process_exercise "back" "reverse-grip-lat-pulldown.gif" "reverse-grip-lat-pulldown.jpg"
process_exercise "back" "romanian-deadlift.gif" "romanian-deadlift.jpg"
process_exercise "back" "rope-straight-arm-pulldown.gif" "rope-straight-arm-pulldown.jpg"
process_exercise "back" "shrug.gif" "shrug.jpg"
process_exercise "back" "straight-arm-pulldown.gif" "straight-arm-pulldown.jpg"
process_exercise "back" "t-bar-row.gif" "t-bar-row.jpg"
process_exercise "back" "wide-grip-lat-pulldown.gif" "wide-grip-lat-pulldown.jpg"

# BICEPS
echo ""
echo "Processing BICEPS..."
process_exercise "biceps" "barbell-curl.gif" "barbell-curl.jpg"
process_exercise "biceps" "cable-curl.gif" "cable-curl.jpg"
process_exercise "biceps" "concentration-curl.gif" "concentration-curl.jpg"
process_exercise "biceps" "dumbbell-curl.gif" "dumbbell-curl.jpg"
process_exercise "biceps" "ez-bar-curl.gif" "ez-bar-curl.jpg"
process_exercise "biceps" "hammer-curl.gif" "hammer-curl.jpg"
process_exercise "biceps" "incline-dumbbell-curl.gif" "incline-dumbbell-curl.jpg"
process_exercise "biceps" "preacher-curl.gif" "preacher-curl.jpg"
process_exercise "biceps" "reverse-curl.gif" "reverse-curl.jpg"
process_exercise "biceps" "rope-hammer-curl.gif" "rope-hammer-curl.jpg"
process_exercise "biceps" "spider-curl.gif" "spider-curl.jpg"
process_exercise "biceps" "wide-grip-barbell-curl.gif" "wide-grip-barbell-curl.jpg"

# CHEST
echo ""
echo "Processing CHEST..."
process_exercise "chest" "barbell-bench-press.gif" "barbell-bench-press.jpg"
process_exercise "chest" "cable-crossover.gif" "cable-crossover.jpg"
process_exercise "chest" "chest-dip.gif" "chest-dip.jpg"
process_exercise "chest" "chest-fly.gif" "chest-fly.jpg"
process_exercise "chest" "decline-barbell-bench-press.gif" "decline-barbell-bench-press.jpg"
process_exercise "chest" "decline-dumbbell-bench-press.gif" "decline-dumbbell-bench-press.jpg"
process_exercise "chest" "dumbbell-bench-press.gif" "dumbbell-bench-press.jpg"
process_exercise "chest" "dumbbell-fly.gif" "dumbbell-fly.jpg"
process_exercise "chest" "incline-barbell-bench-press.gif" "incline-barbell-bench-press.jpg"
process_exercise "chest" "incline-dumbbell-bench-press.gif" "incline-dumbbell-bench-press.jpg"
process_exercise "chest" "incline-dumbbell-fly.gif" "incline-dumbbell-fly.jpg"
process_exercise "chest" "low-cable-crossover.gif" "low-cable-crossover.jpg"
process_exercise "chest" "machine-fly.gif" "machine-fly.jpg"
process_exercise "chest" "push-up.gif" "push-up.jpg"
process_exercise "chest" "smith-machine-bench-press.gif" "smith-machine-bench-press.jpg"

# QUADRICEPS
echo ""
echo "Processing QUADRICEPS..."
process_exercise "quadriceps" "barbell-squat.gif" "barbell-squat.jpg"
process_exercise "quadriceps" "box-squat.gif" "box-squat.jpg"
process_exercise "quadriceps" "bulgarian-split-squat.gif" "bulgarian-split-squat.jpg"
process_exercise "quadriceps" "front-squat.gif" "front-squat.jpg"
process_exercise "quadriceps" "goblet-squat.gif" "goblet-squat.jpg"
process_exercise "quadriceps" "hack-squat.gif" "hack-squat.jpg"
process_exercise "quadriceps" "leg-extension.gif" "leg-extension.jpg"
process_exercise "quadriceps" "leg-press.gif" "leg-press.jpg"
process_exercise "quadriceps" "lunge.gif" "lunge.jpg"
process_exercise "quadriceps" "pistol-squat.gif" "pistol-squat.jpg"
process_exercise "quadriceps" "sissy-squat.gif" "sissy-squat.jpg"
process_exercise "quadriceps" "smith-machine-squat.gif" "smith-machine-squat.jpg"
process_exercise "quadriceps" "split-squat.gif" "split-squat.jpg"
process_exercise "quadriceps" "step-up.gif" "step-up.jpg"
process_exercise "quadriceps" "wall-sit.gif" "wall-sit.jpg"

# Add more muscle groups as needed...

echo ""
echo "========================================="
echo "Thumbnail Regeneration Complete!"
echo "========================================="
echo "Total: $TOTAL"
echo "Success: $SUCCESS"
echo "Failed: $FAILED"
echo ""
echo "Backup saved to: $BACKUP_DIR"
echo ""
echo "If thumbnails look worse, restore with:"
echo "  rm -rf assets/exercise-thumbnails"
echo "  mv $BACKUP_DIR assets/exercise-thumbnails"
echo "========================================="

# Clean up
rm -rf "$TEMP_DIR"
rm -rf improved_thumbnails