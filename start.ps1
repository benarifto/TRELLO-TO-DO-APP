Write-Host "Starting Trello TODO Application..." -ForegroundColor Green
Write-Host ""

Write-Host "1. Installing dependencies..." -ForegroundColor Yellow
npm run install:all

Write-Host ""
Write-Host "2. Starting the application..." -ForegroundColor Yellow
npm run dev

Read-Host "Press Enter to continue"
