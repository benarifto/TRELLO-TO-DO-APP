@echo off
echo Starting Trello TODO Application...
echo.

echo 1. Installing dependencies...
call npm run install:all

echo.
echo 2. Starting the application...
call npm run dev

pause
