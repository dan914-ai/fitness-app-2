#!/bin/bash
# Upload GIFs using Supabase CLI
# This script uploads files one by one using the local Supabase CLI

SUPABASE_CLI="/mnt/c/Users/danny/.vscode/new finess app/backend/supabase.exe"
PROJECT_REF="ayttqsgttuvdhvbvbnsk"
BUCKET="exercise-gifs"

echo "Starting upload using Supabase CLI..."
echo "Project: $PROJECT_REF"
echo "Bucket: $BUCKET"

# Change to the mobile directory
cd "/mnt/c/Users/danny/.vscode/new finess app/mobile"

# Counter for tracking
SUCCESS=0
FAILED=0

# Function to upload a single file
upload_file() {
    local source="$1"
    local target="$2"
    
    echo -n "Uploading $target... "
    
    # Use the Supabase CLI to upload
    if "$SUPABASE_CLI" storage cp "$source" "sb://$BUCKET/$target" --project-ref "$PROJECT_REF" 2>/dev/null; then
        echo "✅"
        ((SUCCESS++))
    else
        echo "❌"
        ((FAILED++))
    fi
}

# Upload shoulders/traps exercises
echo -e "\n=== Shoulders/Traps (11 files) ==="
upload_file "assets/exercise-gifs/shoulders/덤벨 리어 델트 레이즈.gif" "dumbbell_rear_delt_raise.gif"
upload_file "assets/exercise-gifs/shoulders/덤벨 슈러그.gif" "dumbbell_shrug.gif"
upload_file "assets/exercise-gifs/shoulders/덤벨 업라이트 로우.gif" "dumbbell_upright_row.gif"
upload_file "assets/exercise-gifs/shoulders/바벨 슈러그.gif" "barbell_shrug.gif"
upload_file "assets/exercise-gifs/shoulders/바벨 업라이트 로우.gif" "barbell_upright_row.gif"
upload_file "assets/exercise-gifs/shoulders/스미스 머신 슈러그.gif" "smith_machine_shrug.gif"
upload_file "assets/exercise-gifs/shoulders/원 암 덤벨 업라이트 로우.gif" "one_arm_dumbbell_upright_row.gif"
upload_file "assets/exercise-gifs/shoulders/이지바 업라이트 로우.gif" "ez_bar_upright_row.gif"
upload_file "assets/exercise-gifs/shoulders/체스트 서포티드 덤벨 슈러그.gif" "chest_supported_dumbbell_shrug.gif"
upload_file "assets/exercise-gifs/shoulders/케이블 슈러그.gif" "cable_shrug.gif"
upload_file "assets/exercise-gifs/shoulders/케이블 업라이트 로우.gif" "cable_upright_row.gif"

echo -e "\n=== Summary ==="
echo "✅ Successful uploads: $SUCCESS"
echo "❌ Failed uploads: $FAILED"
echo "Total: $((SUCCESS + FAILED))"

if [ $SUCCESS -gt 0 ]; then
    echo -e "\nVerify uploads at:"
    echo "https://ayttqsgttuvdhvbvbnsk.supabase.co/storage/v1/object/public/exercise-gifs/dumbbell_rear_delt_raise.gif"
fi