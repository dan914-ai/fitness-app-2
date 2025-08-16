@echo off
echo ========================================
echo Exercise GIF Bulk Upload Tool
echo ========================================
echo.
echo This will upload all exercise GIFs to Supabase
echo.
echo IMPORTANT: Make sure you have created the "exercise-gifs" bucket first!
echo Go to: https://supabase.com/dashboard/project/nwpyliujuimufkfjolsj/storage/buckets
echo.
pause

REM Get the directory of this batch file
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%mobile"

echo.
echo Current directory: %CD%
echo.

echo Starting bulk upload...
echo This will take several minutes as it downloads and uploads 160+ GIFs
echo.

REM Use the JavaScript version instead of TypeScript
node bulk-upload-all-gifs.js

echo.
echo ========================================
echo Upload process complete!
echo ========================================
echo.
pause