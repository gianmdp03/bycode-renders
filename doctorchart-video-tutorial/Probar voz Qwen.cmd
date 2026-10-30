@echo off
setlocal
cd /d "%~dp0"
if not exist ".local\qwen-venv\Scripts\python.exe" (
  echo Primero hay que instalar Qwen con automation\setup-qwen.ps1.
  pause
  exit /b 1
)
".local\qwen-venv\Scripts\python.exe" -u automation\qwen-sample.py %*
if errorlevel 1 (
  echo No se completo la muestra. El montaje del tutorial se conserva.
) else (
  echo Muestra lista en la carpeta qa. Podes escucharla antes de cambiar el video.
)
pause
