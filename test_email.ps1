# Test Gmail setup for Uber Clone

Write-Host "Uber Clone - Email Test" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

# Ask for Gmail app password
$appPassword = Read-Host "Enter your Gmail 16-character app password"

# Set environment variable
$env:EMAIL_PASS = $appPassword
Write-Host "App password set!" -ForegroundColor Green

# Test registration
Write-Host "Testing registration..." -ForegroundColor Yellow
$testEmail = "test$(Get-Random)@example.com"
$jsonBody = @{
    name = "Test User"
    email = $testEmail
    phone = "+1234567890"
    password = "password123"
    role = "rider"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body $jsonBody
    Write-Host "Registration successful!" -ForegroundColor Green
    Write-Host "Check your email for OTP code" -ForegroundColor Cyan
} catch {
    Write-Host "Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTo complete setup, restart the backend server:" -ForegroundColor Yellow
Write-Host "cd backend; npm start" -ForegroundColor White







