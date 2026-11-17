@echo off
title PostgreSQL Server (Port 5433) - ASMA UIN
color 0a

echo Menyalakan database PostgreSQL port 5433...
set "PATH=%LOCALAPPDATA%\Programs\nodejs;C:\Program Files\PostgreSQL\18\bin;%PATH%"
"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "%~dp0.pgdata" -o "-p 5433" -l "%~dp0.pgdata\server.log" start
"C:\Program Files\PostgreSQL\18\bin\pg_isready.exe" -p 5433 -h 127.0.0.1
echo Database siap digunakan!
pause
