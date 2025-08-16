@echo off
echo ==========================================
echo     Simple FFmpeg Setup for Windows
echo ==========================================
echo.
echo This will download a standalone FFmpeg executable.
echo.

:: Create ffmpeg folder
if not exist "ffmpeg" mkdir "ffmpeg"

echo Please download FFmpeg manually:
echo.
echo 1. Go to: https://www.gyan.dev/ffmpeg/builds/
echo 2. Click on "release builds" link
echo 3. Download: ffmpeg-release-essentials.zip
echo 4. Extract the ZIP file
echo 5. Copy the 'bin' folder contents to: %CD%\ffmpeg\
echo.
echo Or try this direct link:
echo https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
echo.
echo After copying ffmpeg.exe to the ffmpeg folder, press any key...
pause >nul

:: Check if ffmpeg.exe exists
if exist "ffmpeg\ffmpeg.exe" (
    echo.
    echo ✅ FFmpeg found! Creating wrapper script...
    
    :: Create wrapper
    (
    echo @echo off
    echo "%CD%\ffmpeg\ffmpeg.exe" %%*
    ) > ffmpeg.bat
    
    echo ✅ Setup complete! Testing FFmpeg...
    echo.
    ffmpeg\ffmpeg.exe -version | findstr /i "version"
    echo.
    echo ==========================================
    echo FFmpeg is ready! You can now run:
    echo   generate-thumbnails-ffmpeg.bat
    echo ==========================================
) else (
    echo.
    echo ❌ ffmpeg.exe not found in ffmpeg folder!
    echo Please ensure you copied ffmpeg.exe to: %CD%\ffmpeg\
)

echo.
pause