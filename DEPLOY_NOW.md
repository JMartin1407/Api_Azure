# 🎯 GUÍA RÁPIDA DE DESPLIEGUE

## ✅ Estado Actual
Tu proyecto está **100% listo** para desplegarse en Azure App Service.

## 🚀 3 Formas de Desplegar

### 1️⃣ FORMA MÁS RÁPIDA - Script Automatizado

```powershell
.\deploy-azure.ps1
```

Este script hace TODO por ti:
- ✅ Verifica Azure CLI
- ✅ Inicia sesión en Azure
- ✅ Crea el grupo de recursos
- ✅ Crea el App Service Plan
- ✅ Crea la Web App
- ✅ Configura las variables de entorno
- ✅ Empaqueta y despliega el código
- ✅ Te da la URL final

---

### 2️⃣ Desde VS Code (Visual)

1. Instalar extensión: **Azure App Service**
2. Click derecho en la carpeta → **Deploy to Web App...**
3. Seguir el asistente
4. ¡Listo!

---

### 3️⃣ Manual con Azure CLI

```powershell
# 1. Login
az login

# 2. Crear recursos
az group create --name smart-analytics-rg --location eastus

az appservice plan create --name smart-analytics-plan --resource-group smart-analytics-rg --sku B1 --is-linux

az webapp create --resource-group smart-analytics-rg --plan smart-analytics-plan --name TU-NOMBRE-UNICO --runtime "NODE:18-lts"

# 3. Configurar variables
az webapp config appsettings set --resource-group smart-analytics-rg --name TU-NOMBRE-UNICO --settings DB_HOST="cosa-analizador.mysql.database.azure.com" DB_USER="Martin" DB_PASSWORD="FILOMENO.2025" DB_NAME="cosa-analizador" DB_PORT="3306" NODE_ENV="production"

# 4. Crear ZIP y desplegar
Compress-Archive -Path server.js,database.js,analisis.js,package.json,package-lock.json,web.config,ecosystem.config.js,.deployment -DestinationPath deploy.zip -Force

az webapp deployment source config-zip --resource-group smart-analytics-rg --name TU-NOMBRE-UNICO --src deploy.zip
```

---

## 📋 Checklist Pre-Despliegue

- [x] Código migrado de Python a Node.js
- [x] Base de datos Azure MySQL configurada
- [x] Variables de entorno en `.env`
- [x] SSL configurado para Azure MySQL
- [x] `web.config` para IIS
- [x] `package.json` con engines de Node.js
- [x] Archivos Python eliminados
- [x] Servidor probado localmente ✅
- [x] GitHub Actions workflow creado
- [ ] **PENDIENTE: Ejecutar despliegue**

---

## 🎬 Próximos Pasos

### AHORA:
```powershell
# Opción A: Script automático (RECOMENDADO)
.\deploy-azure.ps1

# Opción B: VS Code
# 1. Instalar extensión Azure App Service
# 2. Click derecho → Deploy to Web App
```

### DESPUÉS DEL DESPLIEGUE:

```powershell
# 1. Probar el endpoint de salud
curl https://tu-app.azurewebsites.net/health

# 2. Ver logs en tiempo real
az webapp log tail --name tu-app --resource-group smart-analytics-rg

# 3. Abrir en el navegador
start https://tu-app.azurewebsites.net
```

---

## 🔍 Verificación Post-Despliegue

### ✅ Endpoints a probar:

```bash
# Health Check
GET https://tu-app.azurewebsites.net/health

# Login
POST https://tu-app.azurewebsites.net/auth/login
{
  "email": "admin@escuela.edu",
  "password": "pass123"
}

# Upload (con token)
POST https://tu-app.azurewebsites.net/admin/upload-and-analyze/
Authorization: Bearer admin@escuela.edu
Content-Type: multipart/form-data
```

---

## 🆘 Solución de Problemas

### ❌ Error: "App name already exists"
El nombre debe ser único globalmente. Cambia el nombre en el script o usa:
```powershell
$appName = "smart-analytics-$(Get-Random -Maximum 9999)"
```

### ❌ Error: "Cannot connect to MySQL"
1. Ve a Azure Portal → MySQL Server
2. Connection security
3. Activar: **"Allow access to Azure services"**
4. Guardar

### ❌ Error: "503 Service Unavailable"
```powershell
# Ver logs
az webapp log tail --name tu-app --resource-group smart-analytics-rg

# Reiniciar app
az webapp restart --name tu-app --resource-group smart-analytics-rg
```

---

## 💡 Consejos

✅ **Nombres únicos**: El nombre de la Web App debe ser único en todo Azure
✅ **Firewall MySQL**: Debe permitir conexiones desde Azure Services
✅ **SSL**: Ya está configurado automáticamente
✅ **Logs**: Siempre revisa los logs después del despliegue
✅ **Costo**: Plan B1 cuesta ~$13/mes

---

## 📞 Recursos Adicionales

- 📄 Guía completa: `AZURE_DEPLOYMENT.md`
- 📖 README: `README.md`
- 🔧 Configuración: `.env` (ya configurado)
- 🤖 CI/CD: `.github/workflows/azure-deploy.yml`

---

## 🎉 ¡Listo para despegar!

**Ejecuta ahora:**
```powershell
.\deploy-azure.ps1
```

**O desde VS Code:**
1. Instalar extensión "Azure App Service"
2. Click derecho → Deploy to Web App
3. ¡A producción! 🚀
