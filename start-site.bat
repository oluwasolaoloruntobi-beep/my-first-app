@echo off
cd /d %~dp0
echo Starting local site at http://localhost:8000
node local-server.js
