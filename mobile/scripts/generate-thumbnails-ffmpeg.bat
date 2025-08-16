@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo    Generate JPEG Thumbnails from GIFs
echo ==========================================
echo.

:: Check if ffmpeg is available
where ffmpeg >nul 2>&1
if %errorlevel% neq 0 (
    :: Try local ffmpeg.bat
    if not exist "ffmpeg.bat" (
        echo ERROR: FFmpeg not found!
        echo.
        echo Please run download-ffmpeg.bat first
        echo Or install FFmpeg manually
        pause
        exit /b 1
    )
    set FFMPEG=ffmpeg.bat
) else (
    set FFMPEG=ffmpeg
)

:: Set directories
set SOURCE_DIR=..\assets\exercise-gifs
set TARGET_DIR=..\assets\exercise-thumbnails
set TOTAL=0
set PROCESSED=0

echo Using FFmpeg: %FFMPEG%
echo.

:: Create target directory
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

:: Process each muscle group
for /d %%G in (%SOURCE_DIR%\*) do (
    set GROUP_NAME=%%~nG
    echo Processing !GROUP_NAME!...
    
    :: Create subdirectory
    if not exist "%TARGET_DIR%\!GROUP_NAME!" mkdir "%TARGET_DIR%\!GROUP_NAME!"
    
    :: Process each GIF
    for %%F in ("%%G\*.gif") do (
        set /a TOTAL+=1
        set GIF_NAME=%%~nF
        set JPEG_PATH=%TARGET_DIR%\!GROUP_NAME!\!GIF_NAME!.jpg
        
        :: Skip if already exists
        if exist "!JPEG_PATH!" (
            echo   [SKIP] !GIF_NAME!.jpg already exists
        ) else (
            :: Extract first frame and save as JPEG
            %FFMPEG% -i "%%F" -vframes 1 -vf "scale=120:120:force_original_aspect_ratio=decrease,pad=120:120:(ow-iw)/2:(oh-ih)/2:color=white" -q:v 2 "!JPEG_PATH!" -y >nul 2>&1
            
            if exist "!JPEG_PATH!" (
                set /a PROCESSED+=1
                echo   [OK] Generated !GIF_NAME!.jpg
            ) else (
                echo   [ERROR] Failed to generate !GIF_NAME!.jpg
            )
        )
    )
    echo.
)

:: Calculate size
set SIZE=0
for /r "%TARGET_DIR%" %%F in (*.jpg) do (
    set /a SIZE+=%%~zF
)
set /a SIZE_MB=SIZE/1048576

echo ==========================================
echo         THUMBNAIL GENERATION COMPLETE
echo ==========================================
echo Total GIFs found: %TOTAL%
echo New thumbnails generated: %PROCESSED%
echo Thumbnail folder size: ~%SIZE_MB% MB
echo Space saved: ~900+ MB vs full GIFs
echo ==========================================
echo.
echo Thumbnails saved to: %TARGET_DIR%
echo.
pause