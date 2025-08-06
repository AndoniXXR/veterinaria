@echo off
echo 🚀 Iniciando aplicación veterinaria...
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado o no está en el PATH
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Ejecutar el script de desarrollo
node start-dev.js

pause