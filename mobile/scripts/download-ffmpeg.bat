@echo off
echo ========================================
echo     FFmpeg Automatic Downloader
echo ========================================
echo.

:: Set download URL and paths
set FFMPEG_URL=https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
set DOWNLOAD_PATH=%TEMP%\ffmpeg.zip
set EXTRACT_PATH=%CD%\ffmpeg
set SCRIPT_DIR=%CD%

echo [1/4] Downloading FFmpeg...
powershell -Command "Invoke-WebRequest -Uri '%FFMPEG_URL%' -OutFile '%DOWNLOAD_PATH%'"

if not exist "%DOWNLOAD_PATH%" (
    echo ERROR: Download failed!
    echo.
    echo Please download manually from:
    echo https://www.gyan.dev/ffmpeg/builds/
    pause
    exit /b 1
)

echo [2/4] Extracting FFmpeg...
:: First, make sure the extract directory exists
if not exist "%EXTRACT_PATH%" mkdir "%EXTRACT_PATH%"

:: Extract using PowerShell with proper error handling
echo Extracting to: %EXTRACT_PATH%
powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('%DOWNLOAD_PATH%', '%EXTRACT_PATH%')"

:: If extraction failed, try alternative method
if %errorlevel% neq 0 (
    echo Trying alternative extraction method...
    powershell -Command "Expand-Archive -Path '%DOWNLOAD_PATH%' -DestinationPath '%EXTRACT_PATH%' -Force"
)

:: Wait a moment for extraction to complete
timeout /t 2 /nobreak >nul

:: Find the extracted folder (it has a version number)
set FFMPEG_DIR=
for /d %%i in ("%EXTRACT_PATH%\ffmpeg-*") do set "FFMPEG_DIR=%%i"

:: Debug: Show what we found
echo Looking for ffmpeg in: %EXTRACT_PATH%
dir "%EXTRACT_PATH%" /b

:: If no versioned folder found, check if ffmpeg.exe is directly in extract path
if "%FFMPEG_DIR%"=="" (
    if exist "%EXTRACT_PATH%\bin\ffmpeg.exe" (
        set "FFMPEG_DIR=%EXTRACT_PATH%"
        echo Found ffmpeg in: %EXTRACT_PATH%\bin
    ) else (
        echo Checking for versioned folder...
        :: Try to find any folder starting with ffmpeg
        for /d %%i in ("%EXTRACT_PATH%\*") do (
            if exist "%%i\bin\ffmpeg.exe" (
                set "FFMPEG_DIR=%%i"
                echo Found ffmpeg in: %%i\bin
                goto :found
            )
        )
    )
)
:found

if not exist "%FFMPEG_DIR%\bin\ffmpeg.exe" (
    echo ERROR: ffmpeg.exe not found in expected location!
    echo.
    echo Checking extract directory contents...
    dir "%EXTRACT_PATH%" /s /b | findstr /i "ffmpeg.exe"
    echo.
    echo Please check the structure above and update the script accordingly.
    pause
    exit /b 1
)

echo [3/4] FFmpeg extracted successfully to: %FFMPEG_DIR%
echo.

:: Create a local runner script
echo [4/4] Creating local runner script...
(
echo @echo off
echo "%FFMPEG_DIR%\bin\ffmpeg.exe" %%*
) > "%SCRIPT_DIR%\ffmpeg.bat"

echo.
echo ========================================
echo      FFmpeg Installed Successfully!
echo ========================================
echo.
echo FFmpeg is ready to use in this project!
echo You can now run the thumbnail generation.
echo.
echo To test, run: ffmpeg.bat -version
echo.
pause