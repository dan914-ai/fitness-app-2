@echo off
echo ========================================
echo     FFmpeg Simple Downloader
echo ========================================
echo.

:: Clean up any previous attempts
if exist ffmpeg rmdir /s /q ffmpeg
if exist temp rmdir /s /q temp
mkdir temp
mkdir ffmpeg

echo [1/3] Downloading FFmpeg...
echo This may take a minute...
curl -L -o temp\ffmpeg.zip https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip

if not exist temp\ffmpeg.zip (
    echo ERROR: Download failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Extracting FFmpeg...
echo Using Windows built-in tar command...

:: Use tar to extract (Windows 10+ has this built-in)
tar -xf temp\ffmpeg.zip -C temp

:: Find the extracted folder and move contents
for /d %%i in (temp\ffmpeg-*) do (
    echo Found: %%i
    xcopy "%%i\bin\*" "ffmpeg\" /e /y >nul
)

:: Check if extraction succeeded
if not exist ffmpeg\ffmpeg.exe (
    echo.
    echo ERROR: ffmpeg.exe not found!
    echo Trying PowerShell extraction...
    
    :: Fallback to PowerShell
    powershell -Command "$zipPath = 'temp\ffmpeg.zip'; $extractPath = 'temp'; Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $extractPath)"
    
    :: Try again to find ffmpeg
    for /d %%i in (temp\ffmpeg-*) do (
        echo Found after PowerShell: %%i
        xcopy "%%i\bin\*" "ffmpeg\" /e /y >nul
    )
)

:: Final check
if exist ffmpeg\ffmpeg.exe (
    echo.
    echo [3/3] Creating wrapper script...
    
    :: Create wrapper batch file
    (
    echo @echo off
    echo "%CD%\ffmpeg\ffmpeg.exe" %%*
    ) > ffmpeg.bat
    
    echo.
    echo ========================================
    echo      FFmpeg Installed Successfully!
    echo ========================================
    echo.
    
    :: Test ffmpeg
    ffmpeg\ffmpeg.exe -version | findstr /i "version"
    
    echo.
    echo You can now run: generate-thumbnails-ffmpeg.bat
    echo.
    
    :: Clean up temp files
    rmdir /s /q temp
) else (
    echo.
    echo ========================================
    echo      ERROR: Installation Failed!
    echo ========================================
    echo.
    echo Please try manual installation:
    echo 1. Download: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
    echo 2. Extract the zip file
    echo 3. Copy the contents of the 'bin' folder to: %CD%\ffmpeg\
    echo.
)

pause