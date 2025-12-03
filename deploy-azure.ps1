# Script de despliegue rápido a Azure
# Ejecutar: .\deploy-azure.ps1

Write-Host "🚀 Iniciando despliegue a Azure App Service..." -ForegroundColor Cyan

# Verificar Azure CLI
Write-Host "`n📋 Verificando Azure CLI..." -ForegroundColor Yellow
$azCliInstalled = Get-Command az -ErrorAction SilentlyContinue

if (-not $azCliInstalled) {
    Write-Host "❌ Azure CLI no está instalado." -ForegroundColor Red
    Write-Host "Por favor, instala Azure CLI desde: https://aka.ms/installazurecliwindows" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Azure CLI está instalado" -ForegroundColor Green

# Login a Azure (si no está logueado)
Write-Host "`n🔐 Verificando sesión de Azure..." -ForegroundColor Yellow
$account = az account show 2>$null

if (-not $account) {
    Write-Host "Iniciando sesión en Azure..." -ForegroundColor Yellow
    az login
} else {
    Write-Host "✅ Ya estás logueado en Azure" -ForegroundColor Green
}

# Configuración
$resourceGroup = Read-Host "`nIngresa el nombre del grupo de recursos (o presiona Enter para 'smart-analytics-rg')"
if ([string]::IsNullOrWhiteSpace($resourceGroup)) {
    $resourceGroup = "smart-analytics-rg"
}

$appName = Read-Host "Ingresa el nombre de tu Web App (o presiona Enter para 'smart-analytics-api')"
if ([string]::IsNullOrWhiteSpace($appName)) {
    $appName = "smart-analytics-api"
}

$location = Read-Host "Ingresa la ubicación (o presiona Enter para 'eastus')"
if ([string]::IsNullOrWhiteSpace($location)) {
    $location = "eastus"
}

Write-Host "`n📦 Configuración:" -ForegroundColor Cyan
Write-Host "  Grupo de recursos: $resourceGroup" -ForegroundColor White
Write-Host "  Nombre de la app: $appName" -ForegroundColor White
Write-Host "  Ubicación: $location" -ForegroundColor White

$confirm = Read-Host "`n¿Continuar con el despliegue? (s/n)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Despliegue cancelado" -ForegroundColor Red
    exit 0
}

# Crear grupo de recursos
Write-Host "`n📁 Creando grupo de recursos..." -ForegroundColor Yellow
az group create --name $resourceGroup --location $location
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Grupo de recursos creado/verificado" -ForegroundColor Green
}

# Crear App Service Plan
Write-Host "`n📊 Creando App Service Plan..." -ForegroundColor Yellow
$planName = "$appName-plan"
az appservice plan create --name $planName --resource-group $resourceGroup --sku B1 --is-linux
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ App Service Plan creado/verificado" -ForegroundColor Green
}

# Crear Web App
Write-Host "`n🌐 Creando Web App..." -ForegroundColor Yellow
az webapp create --resource-group $resourceGroup --plan $planName --name $appName --runtime "NODE:18-lts"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Web App creada/verificada" -ForegroundColor Green
}

# Configurar variables de entorno
Write-Host "`n⚙️ Configurando variables de entorno..." -ForegroundColor Yellow
az webapp config appsettings set --resource-group $resourceGroup --name $appName --settings `
    DB_HOST="mysqlingles.mysql.database.azure.com" `
    DB_USER="admin_ingles" `
    DB_PASSWORD="Gui11ermo1" `
    DB_NAME="proyectoIngles" `
    DB_PORT="3306" `
    JWT_SECRET="tu_clave_secreta_super_segura_2024_produccion" `
    NODE_ENV="production" `
    WEBSITE_NODE_DEFAULT_VERSION="18-lts"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Variables de entorno configuradas" -ForegroundColor Green
}

# Crear archivo ZIP para despliegue
Write-Host "`n📦 Creando paquete de despliegue..." -ForegroundColor Yellow
$zipPath = "deploy.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$filesToInclude = @(
    "server.js",
    "database.js",
    "analisis.js",
    "package.json",
    "package-lock.json",
    "web.config",
    "ecosystem.config.js",
    ".deployment"
)

Compress-Archive -Path $filesToInclude -DestinationPath $zipPath -Force
Write-Host "✅ Paquete creado: $zipPath" -ForegroundColor Green

# Desplegar
Write-Host "`n🚀 Desplegando aplicación..." -ForegroundColor Yellow
az webapp deployment source config-zip --resource-group $resourceGroup --name $appName --src $zipPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ ¡Despliegue completado exitosamente!" -ForegroundColor Green
    Write-Host "`n🌐 Tu aplicación está disponible en:" -ForegroundColor Cyan
    Write-Host "   https://$appName.azurewebsites.net" -ForegroundColor White
    Write-Host "`n📊 Para ver los logs en tiempo real, ejecuta:" -ForegroundColor Yellow
    Write-Host "   az webapp log tail --name $appName --resource-group $resourceGroup" -ForegroundColor White
} else {
    Write-Host "`n❌ Error durante el despliegue" -ForegroundColor Red
}

# Limpiar
Write-Host "`n🧹 Limpiando archivos temporales..." -ForegroundColor Yellow
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Write-Host "`n✨ Proceso completado!" -ForegroundColor Green
