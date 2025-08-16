@echo off
cd /d "%~dp0mcp-servers\taskmaster\src"
move index.ts index-backup.ts
move index-fixed.ts index.ts
echo Fixed taskmaster index.ts with persistent storage support