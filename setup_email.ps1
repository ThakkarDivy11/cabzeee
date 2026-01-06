# PowerShell script to set up Gmail app password for Uber Clone

Write-Host "Uber Clone - Gmail App Password Setup" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Ask for the app password
$appPassword = Read-Host "Enter your Gmail app password (16 characters, no spaces)"

# Set the environment variable
$env:EMAIL_PASS = $appPassword
Write-Host "Environment variable EMAIL_PASS set successfully!" -ForegroundColor Green

# Change to backend directory and restart server
Write-Host "Restarting backend server..." -ForegroundColor Yellow
cd backend
npm start







