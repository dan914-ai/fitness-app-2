@echo off
title Fixing MCP Server Issues
color 0E

echo ========================================
echo     MCP SERVER ISSUE FIXER
echo     New Fitness App Project
echo ========================================
echo.

REM Create persistent storage for servers
echo [1/5] Creating persistent storage directories...
mkdir "%~dp0mcp-servers\taskmaster\data" 2>nul
mkdir "%~dp0mcp-servers\context7\data" 2>nul

REM Create initial data files
echo [2/5] Creating initial data files...
if not exist "%~dp0mcp-servers\taskmaster\data\tasks.json" (
    echo [] > "%~dp0mcp-servers\taskmaster\data\tasks.json"
)
if not exist "%~dp0mcp-servers\context7\data\contexts.json" (
    echo [] > "%~dp0mcp-servers\context7\data\contexts.json"
)

REM Set execute permissions in WSL
echo [3/5] Setting execute permissions for WSL...
wsl chmod +x "/mnt/c/Users/danny/.vscode/new finess app/mcp-servers/taskmaster/dist/index.js" 2>nul
wsl chmod +x "/mnt/c/Users/danny/.vscode/new finess app/mcp-servers/context7/dist/index.js" 2>nul

REM Create startup test script
echo [4/5] Creating MCP startup test script...
echo const fs = require('fs'); > "%~dp0test-mcp-startup.js"
echo const path = require('path'); >> "%~dp0test-mcp-startup.js"
echo. >> "%~dp0test-mcp-startup.js"
echo console.log('Testing MCP server paths...'); >> "%~dp0test-mcp-startup.js"
echo. >> "%~dp0test-mcp-startup.js"
echo const servers = [ >> "%~dp0test-mcp-startup.js"
echo   { name: 'taskmaster', path: './mcp-servers/taskmaster/dist/index.js' }, >> "%~dp0test-mcp-startup.js"
echo   { name: 'context7', path: './mcp-servers/context7/dist/index.js' } >> "%~dp0test-mcp-startup.js"
echo ]; >> "%~dp0test-mcp-startup.js"
echo. >> "%~dp0test-mcp-startup.js"
echo servers.forEach(server =^> { >> "%~dp0test-mcp-startup.js"
echo   const fullPath = path.resolve(server.path); >> "%~dp0test-mcp-startup.js"
echo   if (fs.existsSync(fullPath)) { >> "%~dp0test-mcp-startup.js"
echo     console.log(`✓ ${server.name}: Found at ${fullPath}`); >> "%~dp0test-mcp-startup.js"
echo   } else { >> "%~dp0test-mcp-startup.js"
echo     console.log(`✗ ${server.name}: NOT FOUND at ${fullPath}`); >> "%~dp0test-mcp-startup.js"
echo   } >> "%~dp0test-mcp-startup.js"
echo }); >> "%~dp0test-mcp-startup.js"

REM Test the servers
echo [5/5] Testing MCP server availability...
cd /d "%~dp0"
node test-mcp-startup.js

echo.
echo ========================================
echo     FIXES APPLIED!
echo ========================================
echo.
echo Applied fixes:
echo ✓ Created persistent storage directories
echo ✓ Initialized data files
echo ✓ Set execute permissions for WSL
echo ✓ Created startup test script
echo.
echo To ensure MCP servers work properly:
echo 1. Always use VS Code with WSL terminal
echo 2. Run this script after any VS Code restart if issues occur
echo 3. Check the test output above for any missing files
echo.
pause