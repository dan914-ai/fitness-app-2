@echo off
echo Building MCP Servers...
echo.

echo [1/2] Building TaskMaster Server...
cd /d "C:\Users\danny\.vscode\new finess app\mcp-servers\taskmaster"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install taskmaster dependencies
    pause
    exit /b 1
)
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build taskmaster
    pause
    exit /b 1
)
echo TaskMaster built successfully!
echo.

echo [2/2] Building Context7 Server...
cd /d "C:\Users\danny\.vscode\new finess app\mcp-servers\context7"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install context7 dependencies
    pause
    exit /b 1
)
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build context7
    pause
    exit /b 1
)
echo Context7 built successfully!
echo.

echo All MCP servers built successfully!
echo.
echo Creating data directories for persistent storage...
mkdir "C:\Users\danny\.vscode\new finess app\mcp-servers\taskmaster\data" 2>nul
mkdir "C:\Users\danny\.vscode\new finess app\mcp-servers\context7\data" 2>nul

if not exist "C:\Users\danny\.vscode\new finess app\mcp-servers\taskmaster\data\tasks.json" (
    echo [] > "C:\Users\danny\.vscode\new finess app\mcp-servers\taskmaster\data\tasks.json"
)
if not exist "C:\Users\danny\.vscode\new finess app\mcp-servers\context7\data\contexts.json" (
    echo [] > "C:\Users\danny\.vscode\new finess app\mcp-servers\context7\data\contexts.json"
)

echo.
echo Setup complete! All MCP servers are ready to use.
pause