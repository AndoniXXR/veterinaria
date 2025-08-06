@echo off
echo Deteniendo servicios existentes...

:: Terminar procesos de Node.js relacionados con el proyecto (excepto Claude Code)
for /f "tokens=2" %%i in ('wmic process where "name='node.exe' and CommandLine like '%%react-scripts%%'" get ProcessId /format:table ^| findstr /r "[0-9]"') do (
    echo Terminando frontend React PID: %%i
    taskkill /PID %%i /F >nul 2>&1
)

for /f "tokens=2" %%i in ('wmic process where "name='node.exe' and CommandLine like '%%server.js%%'" get ProcessId /format:table ^| findstr /r "[0-9]"') do (
    echo Terminando backend Node PID: %%i
    taskkill /PID %%i /F >nul 2>&1
)

echo Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo Iniciando servicios...

echo Iniciando Backend en puerto 3001...
start "VetCare Backend" cmd /k "cd /d D:\veterinaria\backend && npm start"

echo Esperando 5 segundos para que inicie el backend...
timeout /t 5 /nobreak >nul

echo Iniciando Frontend en puerto 3002...
start "VetCare Frontend" cmd /k "cd /d D:\veterinaria\frontend && npm start"

echo.
echo ================================
echo  SERVICIOS INICIADOS
echo ================================
echo  Backend:  http://localhost:3001
echo  Frontend: http://localhost:3002
echo ================================
echo.

pause