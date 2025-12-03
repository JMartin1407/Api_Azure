# Script de Verificacion Pre-Despliegue
Write-Host "`n=== VERIFICACION PRE-DESPLIEGUE ===" -ForegroundColor Cyan

$allGood = $true

# 1. Node.js
Write-Host "`n[1] Node.js..." -ForegroundColor Yellow
if (node --version 2>$null) {
    Write-Host "    [OK] Instalado" -ForegroundColor Green
} else {
    Write-Host "    [ERROR] NO instalado" -ForegroundColor Red
    $allGood = $false
}

# 2. npm
Write-Host "`n[2] npm..." -ForegroundColor Yellow
if (npm --version 2>$null) {
    Write-Host "    [OK] Instalado" -ForegroundColor Green
} else {
    Write-Host "    [ERROR] NO instalado" -ForegroundColor Red
    $allGood = $false
}

# 3. Archivos
Write-Host "`n[3] Archivos esenciales..." -ForegroundColor Yellow
$files = @("server.js", "database.js", "analisis.js", "package.json", ".env")
foreach ($f in $files) {
    if (Test-Path $f) {
        Write-Host "    [OK] $f" -ForegroundColor Green
    } else {
        Write-Host "    [ERROR] $f faltante" -ForegroundColor Red
        $allGood = $false
    }
}

# 4. Dependencias
Write-Host "`n[4] Dependencias..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "    [OK] node_modules existe" -ForegroundColor Green
} else {
    Write-Host "    [WARNING] Ejecuta npm install" -ForegroundColor Yellow
}

# Resultado
Write-Host "`n===================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "[SUCCESS] Listo para desplegar!`n" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Hay problemas`n" -ForegroundColor Yellow
}
