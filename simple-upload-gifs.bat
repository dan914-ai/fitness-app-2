@echo off
echo ========================================
echo Simple GIF Uploader for Supabase
echo ========================================
echo.
echo This will upload the most common exercise GIFs
echo.
pause

cd /d "%~dp0mobile"

echo.
echo Uploading exercise GIFs...
echo.

node upload-exercise-gifs.js

echo.
echo Done! Check your app to see the uploaded GIFs.
echo.
echo To upload ALL missing GIFs, run: node upload-missing-gifs.js
echo.
pause