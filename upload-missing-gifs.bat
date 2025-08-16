@echo off
echo ========================================
echo Upload Missing Exercise GIFs to Supabase
echo ========================================
echo.
echo This will only upload GIFs that are not already in Supabase
echo.
pause

REM Get the directory of this batch file
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%mobile"

echo.
echo Current directory: %CD%
echo.

echo Checking and uploading missing GIFs...
node upload-missing-gifs.js

echo.
echo ========================================
echo Upload process complete!
echo ========================================
echo.
pause