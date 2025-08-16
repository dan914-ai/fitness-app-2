@echo off
echo ==========================================
echo    Generate Thumbnails for Downloaded GIFs
echo ==========================================
echo.

set FFMPEG=ffmpeg\ffmpeg.exe
set SOURCE_DIR=..\assets\exercise-gifs
set TARGET_DIR=..\assets\exercise-thumbnails
set COUNT=0
set FAILED=0

echo Processing downloaded GIFs...
echo.

:: Process each folder
for /d %%D in (%SOURCE_DIR%\*) do (
    set FOLDER=%%~nD
    echo Processing !FOLDER! folder...
    
    :: Create thumbnail folder if needed
    if not exist "%TARGET_DIR%\%%~nD" mkdir "%TARGET_DIR%\%%~nD"
    
    :: Process each GIF in folder
    for %%F in ("%%D\*.gif") do (
        set GIF_NAME=%%~nF
        set THUMB_PATH=%TARGET_DIR%\%%~nD\%%~nF.jpg
        
        :: Check if thumbnail already exists
        if not exist "!THUMB_PATH!" (
            :: Generate thumbnail
            %FFMPEG% -i "%%F" -vframes 1 -vf "scale=120:120:force_original_aspect_ratio=decrease,pad=120:120:(ow-iw)/2:(oh-ih)/2:color=white" -q:v 2 "!THUMB_PATH!" -y >nul 2>&1
            
            if exist "!THUMB_PATH!" (
                echo   [OK] %%~nF.jpg
                set /a COUNT+=1
            ) else (
                echo   [ERROR] %%~nF.jpg
                set /a FAILED+=1
            )
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