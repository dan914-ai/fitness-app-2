@echo off
title Building MCP Servers for New Fitness App
color 0A

echo ========================================
echo     MCP SERVER BUILD SCRIPT
echo     New Fitness App Project
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

REM Navigate to taskmaster directory
echo [STEP 1/4] Installing TaskMaster dependencies...
echo ----------------------------------------
cd /d "%~dp0mcp-servers\taskmaster"
if not exist package.json (
    echo ERROR: Cannot find taskmaster package.json
    pause
    exit /b 1
)

call npm install --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ERROR: Failed to install taskmaster dependencies
    pause
    exit /b 1
)

echo.
echo [STEP 2/4] Building TaskMaster...
echo ----------------------------------------
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build taskmaster
    pause
    exit /b 1
)
echo SUCCESS: TaskMaster built!
echo.

REM Navigate to context7 directory
echo [STEP 3/4] Installing Context7 dependencies...
echo ----------------------------------------
cd /d "%~dp0mcp-servers\context7"
if not exist package.json (
    echo ERROR: Cannot find context7 package.json
    pause
    exit /b 1
)

call npm install --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ERROR: Failed to install context7 dependencies
    pause
    exit /b 1
)

echo.
echo [STEP 4/4] Building Context7...
echo ----------------------------------------
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build context7
    pause
    exit /b 1
)
echo SUCCESS: Context7 built!
echo.

REM Create data directories for persistent storage
echo Creating data directories...
mkdir "%~dp0mcp-servers\taskmaster\data" 2>nul
mkdir "%~dp0mcp-servers\context7\data" 2>nul

REM Initialize empty data files if they don't exist
if not exist "%~dp0mcp-servers\taskmaster\data\tasks.json" (
    echo [] > "%~dp0mcp-servers\taskmaster\data\tasks.json"
)
if not exist "%~dp0mcp-servers\context7\data\contexts.json" (
    echo [] > "%~dp0mcp-servers\context7\data\contexts.json"
)

echo.
echo ========================================
echo     BUILD COMPLETE!
echo ========================================
echo.
echo All MCP servers have been built successfully!
echo.
echo Your MCP servers are now ready to use:
echo - filesystem (file access)
echo - memory (persistent storage)
echo - github (GitHub integration)
echo - sequential-thinking (reasoning)
echo - puppeteer (browser automation)
echo - everything (search)
echo - supabase (database)
echo - taskmaster (task management)
echo - context7 (context management)
echo.
echo You can now close this window.
echo.
pause