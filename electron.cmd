@echo off
set "NODE_PATH="
cd /d "%~dp0"
node_modules\electron\dist\electron.exe "%~1"
