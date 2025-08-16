@echo off
title MCP Server Validation
color 0B

echo ========================================
echo     MCP SERVER VALIDATION
echo     New Fitness App Project
echo ========================================
echo.

set ERRORS=0

echo [1] Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo    X Node.js NOT FOUND - Install from https://nodejs.org/
    set /a ERRORS+=1
) else (
    echo    ✓ Node.js found
)

echo.
echo [2] Checking MCP server build files...

REM Check taskmaster
if exist "%~dp0mcp-servers\taskmaster\dist\index.js" (
    echo    ✓ TaskMaster built
) else (
    echo    X TaskMaster NOT BUILT - Run RUN_THIS_TO_BUILD.bat
    set /a ERRORS+=1
)

REM Check context7
if exist "%~dp0mcp-servers\context7\dist\index.js" (
    echo    ✓ Context7 built
) else (
    echo    X Context7 NOT BUILT - Run RUN_THIS_TO_BUILD.bat
    set /a ERRORS+=1
)

echo.
echo [3] Checking data directories...

REM Check taskmaster data
if exist "%~dp0mcp-servers\taskmaster\data\tasks.json" (
    echo    ✓ TaskMaster data directory ready
) else (
    echo    X TaskMaster data missing - Run FIX_MCP_ISSUES.bat
    set /a ERRORS+=1
)

REM Check context7 data
if exist "%~dp0mcp-servers\context7\data\contexts.json" (
    echo    ✓ Context7 data directory ready
) else (
    echo    X Context7 data missing - Run FIX_MCP_ISSUES.bat
    set /a ERRORS+=1
)

echo.
echo [4] Checking Claude configuration...

if exist "%USERPROFILE%\.claude.json" (
    echo    ✓ Claude configuration found
    findstr /C:"new finess app" "%USERPROFILE%\.claude.json" >nul
    if %errorlevel% equ 0 (
        echo    ✓ Project configured in Claude
    ) else (
        echo    X Project not found in Claude config
        set /a ERRORS+=1
    )
) else (
    echo    X Claude configuration missing
    set /a ERRORS+=1
)

echo.
echo [5] Testing MCP server paths...
echo const path = require('path'); > "%~dp0test-validation.js"
echo const fs = require('fs'); >> "%~dp0test-validation.js"
echo console.log('Testing server executability...'); >> "%~dp0test-validation.js"
echo const servers = [ >> "%~dp0test-validation.js"
echo   { name: 'taskmaster', path: './mcp-servers/taskmaster/dist/index.js' }, >> "%~dp0test-validation.js"
echo   { name: 'context7', path: './mcp-servers/context7/dist/index.js' } >> "%~dp0test-validation.js"
echo ]; >> "%~dp0test-validation.js"
echo servers.forEach(server =^> { >> "%~dp0test-validation.js"
echo   const fullPath = path.resolve(server.path); >> "%~dp0test-validation.js"
echo   try { >> "%~dp0test-validation.js"
echo     const stats = fs.statSync(fullPath); >> "%~dp0test-validation.js"
echo     console.log(`   ✓ ${server.name}: ${stats.size} bytes`); >> "%~dp0test-validation.js"
echo   } catch (e) { >> "%~dp0test-validation.js"
echo     console.log(`   X ${server.name}: ${e.message}`); >> "%~dp0test-validation.js"
echo   } >> "%~dp0test-validation.js"
echo }); >> "%~dp0test-validation.js"

cd /d "%~dp0"
node test-validation.js
del /f /q test-validation.js 2>nul

echo.
echo ========================================
if %ERRORS% equ 0 (
    echo     ALL CHECKS PASSED!
    echo     Your MCP servers are ready to use
) else (
    echo     FOUND %ERRORS% ISSUE(S)!
    echo     Please fix the issues above
)
echo ========================================
echo.

if %ERRORS% neq 0 (
    echo Recommended actions:
    echo 1. Run RUN_THIS_TO_BUILD.bat to build servers
    echo 2. Run FIX_MCP_ISSUES.bat if data is missing
    echo 3. Restart VS Code after fixing issues
    echo.
)

pause