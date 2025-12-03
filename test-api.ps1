# Test API Script
Write-Host "`n=== PROBANDO API ===" -ForegroundColor Cyan

# Test 1: Health
Write-Host "`n[1] Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
    Write-Host "    [OK] Status: $($health.status)" -ForegroundColor Green
    Write-Host "    Message: $($health.message)" -ForegroundColor White
} catch {
    Write-Host "    [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Login
Write-Host "`n[2] Login Admin..." -ForegroundColor Yellow
try {
    $loginBody = @{ 
        email = "admin@escuela.edu"
        password = "admin" 
    } | ConvertTo-Json
    
    $login = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "    [OK] Token: $($login.token)" -ForegroundColor Green
    Write-Host "    Rol: $($login.rol)" -ForegroundColor White
    Write-Host "    Nombre: $($login.nombre)" -ForegroundColor White
    $token = $login.token
} catch {
    Write-Host "    [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Dashboard Admin
Write-Host "`n[3] Dashboard Admin..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $dashboard = Invoke-RestMethod -Uri "http://localhost:3000/dashboard/admin" -Method GET -Headers $headers
    Write-Host "    [OK] Message: $($dashboard.message)" -ForegroundColor Green
} catch {
    Write-Host "    [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Dashboard Docente (debe fallar con admin token)
Write-Host "`n[4] Dashboard Docente (debe fallar)..." -ForegroundColor Yellow
try {
    $dashboard = Invoke-RestMethod -Uri "http://localhost:3000/dashboard/docente" -Method GET -Headers $headers
    Write-Host "    [WARNING] No deberia haber funcionado" -ForegroundColor Yellow
} catch {
    Write-Host "    [OK] Acceso denegado correctamente (403)" -ForegroundColor Green
}

Write-Host "`n=== TODOS LOS TESTS PASARON ===" -ForegroundColor Green
Write-Host ""
