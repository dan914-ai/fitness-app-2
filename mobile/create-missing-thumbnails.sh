#!/bin/bash

echo "Creating missing thumbnails from Supabase GIFs..."

# Create temp directory
mkdir -p temp_gifs

# Download GIFs and create thumbnails
echo "1. 58_wide-grip-lat-pulldown"
curl -s "https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/back/58_wide-grip-lat-pulldown.gif" -o temp_gifs/58_wide-grip-lat-pulldown.gif
ffmpeg -i temp_gifs/58_wide-grip-lat-pulldown.gif -vframes 1 -q:v 2 assets/exercise-thumbnails/back/58_wide-grip-lat-pulldown.jpg -y 2>/dev/null
echo "  ✅ Created assets/exercise-thumbnails/back/58_wide-grip-lat-pulldown.jpg"

echo "2. back-extension"
curl -s "https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/back/back-extension.gif" -o temp_gifs/back-extension.gif
ffmpeg -i temp_gifs/back-extension.gif -vframes 1 -q:v 2 assets/exercise-thumbnails/back/back-extension.jpg -y 2>/dev/null
echo "  ✅ Created assets/exercise-thumbnails/back/back-extension.jpg"

echo "3. 300_smith-machine-squat-2"
curl -s "https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/quadriceps/300_smith-machine-squat-2.gif" -o temp_gifs/300_smith-machine-squat-2.gif
ffmpeg -i temp_gifs/300_smith-machine-squat-2.gif -vframes 1 -q:v 2 assets/exercise-thumbnails/quadriceps/300_smith-machine-squat-2.jpg -y 2>/dev/null
echo "  ✅ Created assets/exercise-thumbnails/quadriceps/300_smith-machine-squat-2.jpg"

echo "4. barbell-squat"
curl -s "https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/quadriceps/barbell-squat.gif" -o temp_gifs/barbell-squat.gif
ffmpeg -i temp_gifs/barbell-squat.gif -vframes 1 -q:v 2 assets/exercise-thumbnails/quadriceps/barbell-squat.jpg -y 2>/dev/null
echo "  ✅ Created assets/exercise-thumbnails/quadriceps/barbell-squat.jpg"

echo "5. leg-press"
curl -s "https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/quadriceps/leg-press.gif" -o temp_gifs/leg-press.gif
ffmpeg -i temp_gifs/leg-press.gif -vframes 1 -q:v 2 assets/exercise-thumbnails/quadriceps/leg-press.jpg -y 2>/dev/null
echo "  ✅ Created assets/exercise-thumbnails/quadriceps/leg-press.jpg"

# Clean up
rm -rf temp_gifs

echo "Done! All 5 missing thumbnails have been created."