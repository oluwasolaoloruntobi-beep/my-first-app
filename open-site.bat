@echo off
cd /d %~dp0
start "Personal Website Server" cmd /k node local-server.js
timeout /t 2 /nobreak >nul
start "" http://localhost:8000/
