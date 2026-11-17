@echo off
title Sistem Aspirasi Mahasiswa (ASMA) UIN Jakarta
color 0b

echo ========================================================
echo   SISTEM ASPIRASI MAHASISWA (ASMA) - UIN JAKARTA
echo ========================================================
echo.

set "PATH=%LOCALAPPDATA%\Programs\nodejs;C:\Program Files\PostgreSQL\18\bin;%PATH%"

echo [1/3] Menyalakan PostgreSQL Database (Port 5433)...
"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "%~dp0.pgdata" -o "-p 5433" -l "%~dp0.pgdata\server.log" start
timeout /t 2 /nobreak >nul

echo [2/3] Membuka browser ke http://localhost:3000 ...
start http://localhost:3000

echo [3/3] Menjalankan server aplikasi Next.js...
echo.
echo Website dapat diakses di: http://localhost:3000
echo Tekan Ctrl+C untuk menghentikan server.
echo ========================================================
echo.

npm run start
pause
