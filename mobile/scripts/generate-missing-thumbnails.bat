@echo off
echo ==========================================
echo    Generate Missing Thumbnails
echo ==========================================
echo.

set FFMPEG=ffmpeg\ffmpeg.exe
set COUNT=0


echo Processing reverse_nordic_curl...
if not exist "/mnt/c/Users/PW1234/.vscode/new finess app/mobile/assets/exercise-thumbnails/hamstrings" mkdir "/mnt/c/Users/PW1234/.vscode/new finess app/mobile/assets/exercise-thumbnails/hamstrings"
%FFMPEG% -i "/mnt/c/Users/PW1234/.vscode/new finess app/mobile/assets/exercise-gifs/hamstrings/reverse_nordic_curl.gif" -vframes 1 -vf "scale=120:120:force_original_aspect_ratio=decrease,pad=120:120:(ow-iw)/2:(oh-ih)/2:color=white" -q:v 2 "/mnt/c/Users/PW1234/.vscode/new finess app/mobile/assets/exercise-thumbnails/hamstrings/reverse_nordic_curl.jpg" -y >nul 2>&1
if exist "/mnt/c/Users/PW1234/.vscode/new finess app/mobile/assets/exercise-thumbnails/hamstrings/reverse_nordic_curl.jpg" (
  echo   [OK] reverse_nordic_curl.jpg
  set /a COUNT+=1
) else (
  echo   [ERROR] reverse_nordic_curl.jpg
)

echo.
echo ==========================================
echo Complete! Generated %COUNT% thumbnails
echo ==========================================
pause
