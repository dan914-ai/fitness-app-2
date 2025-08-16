@echo off
echo ================================
echo MCP Server Validation for Korean Fitness App
echo ================================
echo.

echo Checking MCP Configuration...
if exist ".mcp.json" (
    echo ✓ MCP configuration file found
) else (
    echo ✗ MCP configuration file missing
    goto :error
)

echo.
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Node.js is installed
    node --version
) else (
    echo ✗ Node.js not found - install from https://nodejs.org/
    goto :error
)

echo.
echo Checking NPX availability...
npx --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ NPX is available
) else (
    echo ✗ NPX not available
    goto :error
)

echo.
echo Checking project directory access...
if exist "backend" (
    echo ✓ Backend directory found
) else (
    echo ⚠ Backend directory not found
)

if exist "mobile" (
    echo ✓ Mobile directory found
) else (
    echo ⚠ Mobile directory not found
)

if exist "README.md" (
    echo ✓ README.md found
) else (
    echo ⚠ README.md not found
)

echo.
echo ================================
echo MCP SERVER STATUS
echo ================================

echo Testing MCP Server installations...
echo.

echo [1/9] Filesystem MCP...
npx -y @modelcontextprotocol/server-filesystem --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Filesystem MCP available
) else (
    echo ⚠ Filesystem MCP needs installation
)

echo [2/9] Memory MCP...
npx -y @modelcontextprotocol/server-memory --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Memory MCP available
) else (
    echo ⚠ Memory MCP needs installation
)

echo [3/9] Sequential Thinking MCP...
npx -y @modelcontextprotocol/server-sequential-thinking --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Sequential Thinking MCP available
) else (
    echo ⚠ Sequential Thinking MCP needs installation
)

echo [4/9] Time MCP...
npx -y @modelcontextprotocol/server-time --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Time MCP available
) else (
    echo ⚠ Time MCP needs installation
)

echo [5/9] Fetch MCP...
npx -y @modelcontextprotocol/server-fetch --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Fetch MCP available
) else (
    echo ⚠ Fetch MCP needs installation
)

echo [6/9] GitHub MCP...
npx -y @modelcontextprotocol/server-github --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ GitHub MCP available
) else (
    echo ⚠ GitHub MCP needs installation
)

echo [7/9] Puppeteer MCP...
npx -y @modelcontextprotocol/server-puppeteer --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Puppeteer MCP available
) else (
    echo ⚠ Puppeteer MCP needs installation
)

echo [8/9] Grep MCP...
npx -y @modelcontextprotocol/server-grep --version >nul 2>&1
if %errorlevel_ == 0 (
    echo ✓ Grep MCP available
) else (
    echo ⚠ Grep MCP needs installation
)

echo [9/9] Playwright MCP...
npx @playwright/mcp@latest --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Playwright MCP available
) else (
    echo ⚠ Playwright MCP needs installation
    echo   Run: npx playwright install
)

echo.
echo ================================
echo RECOMMENDATIONS
echo ================================

echo 📝 Next Steps:
echo   1. Restart Claude Code to load MCP configuration
echo   2. Run 'npx playwright install' for browser testing
echo   3. Test MCP functionality in Claude Code
echo.
echo 🎯 Korean Fitness App MCP Features:
echo   ✓ File navigation and code analysis
echo   ✓ API endpoint testing
echo   ✓ Browser automation for UI testing  
echo   ✓ GitHub integration for project management
echo   ✓ Persistent memory across development sessions
echo.
echo 🚀 Ready for enhanced development workflow!

goto :end

:error
echo.
echo ❌ Setup incomplete. Please fix the issues above.
pause
exit /b 1

:end
echo.
echo ✅ MCP setup validation complete!
pause
