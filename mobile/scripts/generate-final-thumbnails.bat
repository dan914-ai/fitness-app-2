@echo off
echo ==========================================
echo    Generate Final Missing Thumbnails
echo ==========================================
echo.

set FFMPEG=ffmpeg\ffmpeg.exe
set COUNT=0
set FAILED=0

echo Processing hamstrings...
if not exist "..\assets\exercise-thumbnails\hamstrings\reverse_nordic_curl.jpg" (
  %FFMPEG% -i "..\assets\exercise-gifs\hamstrings\reverse_nordic_curl.gif" -vframes 1 -vf "scale=120:120:force_original_aspect_ratio=decrease,pad=120:120:(ow-iw)/2:(oh-ih)/2:color=white" -q:v 2 "..\assets\exercise-thumbnails\hamstrings\reverse_nordic_curl.jpg" -y >nul 2>&1
  if exist "..\assets\exercise-thumbnails\hamstrings\reverse_nordic_curl.jpg" (
    echo   [OK] reverse_nordic_curl.jpg
    set /a COUNT+=1
  ) else (
    echo   [ERROR] reverse_nordic_curl.jpg
    set /a FAILED+=1
  )
)

echo.
echo Processing pectorals...
for %%F in (cable-crossover-2 dumbbell-close-grip-press finger_pushups hex_press knuckle_pushups pec-dec-fly tempo_bench_press wide_grip_bench_press) do (
  if not exist "..\assets\exercise-thumbnails\pectorals\%%F.jpg" (
    %FFMPEG% -i "..\assets\exercise-gifs\pectorals\%%F.gif" -vframes 1 -vf "scale=120:120:force_original_aspect_ratio=decrease,pad=120:120:(ow-iw)/2:(oh-ih)/2:color=white" -q:v 2 "..\assets\exercise-thumbnails\pectorals\%%F.jpg" -y >nul 2>&1
    if exist "..\assets\exercise-thumbnails\pectorals\%%F.jpg" (
      echo   [OK] %%F.jpg
      set /a COUNT+=1
    ) else (
      echo   [ERROR] %%F.jpg
      set /a FAILED+=1
    )
  )
)

echo.
echo Processing quadriceps...
for %%F in (anderson_squat bulgarian-split-squat-2 dumbbell-squat-2 frog-squat landmine-squat-2 leg-extension-2 lunges negative_squat resistance-band-lunge shrimp-squat smith-machine-squat-2 tempo_squat tempo_squats) do (
  if not exist "..\assets\exercise-thumbnails\quadriceps\%%F.jpg" (
    %FFMPEG% -i "..\assets\exercise-gifs\quadriceps\%%F.gif" -vframes 1 -vf "scale=120:120:force_original_aspect_ratio=decrease,pad=120:120:(ow-iw)/2:(oh-ih)/2:color=white" -q:v 2 "..\assets\exercise-thumbnails\quadriceps\%%F.jpg" -y >nul 2>&1
    if exist "..\assets\exercise-thumbnails\quadriceps\%%F.jpg" (
      echo   [OK] %%F.jpg
      set /a COUNT+=1
    ) else (
      echo   [ERROR] %%F.jpg
      set /a FAILED+=1
    )
  )
)

echo.
echo Processing triceps...
for %%F in (cable-pushdown cobra-push-up dive-bomber-push-ups dumbbell-tricep-extension-2 dumbbell-tricep-kickback-2 machine-tricep-extension-2 underhand-tricep-pushdown) do (
  if not exist "..\assets\exercise-thumbnails\triceps\%%F.jpg" (
    %FFMPEG% -i "..\assets\exercise-gifs\triceps\%%F.gif" -vframes 1 -vf "scale=120:120:force_original_aspect_ratio=decrease,pad=120:120:(ow-iw)/2:(oh-ih)/2:color=white" -q:v 2 "..\assets\exercise-thumbnails\triceps\%%F.jpg" -y >nul 2>&1
    if exist "..\assets\exercise-thumbnails\triceps\%%F.jpg" (
      echo   [OK] %%F.jpg
      set /a COUNT+=1
    ) else (
      echo   [ERROR] %%F.jpg
      set /a FAILED+=1
    )
  )
)

echo.
echo ==========================================
echo              COMPLETE!
echo ==========================================
echo Thumbnails created: %COUNT%
if %FAILED% GTR 0 echo Failed: %FAILED%
echo ==========================================
pause