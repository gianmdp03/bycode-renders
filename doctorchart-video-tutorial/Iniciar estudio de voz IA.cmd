@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -File "%~dp0automation\start-ai-narration-studio.ps1"
if errorlevel 1 pause
