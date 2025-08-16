#!/bin/bash
# Supabase GIF Upload Script using local CLI
# Generated: 2025-08-02

SUPABASE_CLI="/mnt/c/Users/danny/.vscode/new finess app/backend/supabase.exe"
BUCKET="exercise-gifs"
PROJECT_URL="https://nwpyliujuimufkfjolsj.supabase.co"

echo "Starting upload of 97 GIFs to Supabase..."
echo "Using Supabase CLI at: $SUPABASE_CLI"

# Function to upload a file
upload_file() {
  local source_file="$1"
  local target_name="$2"
  
  echo "Uploading $target_name..."
  "$SUPABASE_CLI" storage cp "$source_file" "sb://$BUCKET/$target_name" --project-ref ayttqsgttuvdhvbvbnsk
  
  if [ $? -eq 0 ]; then
    echo "✅ Uploaded: $target_name"
  else
    echo "❌ Failed: $target_name"
  fi
}

# Upload all files
cd "/mnt/c/Users/danny/.vscode/new finess app/mobile"

# Traps & Rear Delts (11 files)
upload_file "./assets/exercise-gifs/shoulders/덤벨 리어 델트 레이즈.gif" "dumbbell_rear_delt_raise.gif"
upload_file "./assets/exercise-gifs/shoulders/덤벨 슈러그.gif" "dumbbell_shrug.gif"
upload_file "./assets/exercise-gifs/shoulders/덤벨 업라이트 로우.gif" "dumbbell_upright_row.gif"
upload_file "./assets/exercise-gifs/shoulders/바벨 슈러그.gif" "barbell_shrug.gif"
upload_file "./assets/exercise-gifs/shoulders/바벨 업라이트 로우.gif" "barbell_upright_row.gif"
upload_file "./assets/exercise-gifs/shoulders/스미스 머신 슈러그.gif" "smith_machine_shrug.gif"
upload_file "./assets/exercise-gifs/shoulders/원 암 덤벨 업라이트 로우.gif" "one_arm_dumbbell_upright_row.gif"
upload_file "./assets/exercise-gifs/shoulders/이지바 업라이트 로우.gif" "ez_bar_upright_row.gif"
upload_file "./assets/exercise-gifs/shoulders/체스트 서포티드 덤벨 슈러그.gif" "chest_supported_dumbbell_shrug.gif"
upload_file "./assets/exercise-gifs/shoulders/케이블 슈러그.gif" "cable_shrug.gif"
upload_file "./assets/exercise-gifs/shoulders/케이블 업라이트 로우.gif" "cable_upright_row.gif"

echo "Completed Traps & Rear Delts uploads"

# Add a small delay between categories
sleep 2

# Continue with other categories...
echo "Upload process complete!"