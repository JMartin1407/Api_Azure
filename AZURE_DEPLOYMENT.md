# Azure App Service Deployment Guide

## 📦 Preparación para Azure

Este proyecto está listo para desplegarse en Azure App Service.

## 🚀 Despliegue en Azure App Service

### Opción 1: Despliegue desde VS Code

1. **Instalar extensión Azure App Service**
   - Abrir VS Code
   - Ir a Extensions
   - Buscar "Azure App Service"
   - Instalar la extensión

2. **Iniciar sesión en Azure**
   - Presionar `Ctrl+Shift+P`
   - Escribir "Azure: Sign In"
   - Completar el proceso de autenticación

3. **Desplegar**
   - Click derecho en la carpeta del proyecto
   - Seleccionar "Deploy to Web App..."
   - Seguir las instrucciones:
     - Seleccionar suscripción
     - Crear nuevo Web App o seleccionar existente
     - Elegir Node.js como runtime
     - Confirmar despliegue

### Opción 2: Despliegue desde Azure CLI

```bash
# Iniciar sesión
az login

# Crear grupo de recursos (si no existe)
az group create --name mi-grupo-recursos --location eastus

# Crear App Service Plan
az appservice plan create --name mi-plan --resource-group mi-grupo-recursos --sku B1 --is-linux

# Crear Web App
az webapp create --resource-group mi-grupo-recursos --plan mi-plan --name smart-analytics-api --runtime "NODE|18-lts"

# Configurar variables de entorno
az webapp config appsettings set --resource-group mi-grupo-recursos --name smart-analytics-api --settings \
  DB_HOST="mysqlingles.mysql.database.azure.com" \
  DB_USER="admin_ingles" \
  DB_PASSWORD="Gui11ermo1" \
  DB_NAME="proyectoIngles" \
  DB_PORT="3306" \
  JWT_SECRET="tu_clave_secreta_super_segura_2024_produccion" \
  NODE_ENV="production"

# Desplegar código
az webapp deployment source config-zip --resource-group mi-grupo-recursos --name smart-analytics-api --src deploy.zip
```

### Opción 3: Despliegue desde GitHub Actions

```bash
# Crear un workflow en .github/workflows/azure-deploy.yml
# Ver ejemplo completo más abajo
```

### Opción 4: Despliegue desde el Portal de Azure

1. Ir a portal.azure.com
2. Crear nuevo "App Service"
3. Configurar:
   - Runtime Stack: Node 18 LTS
   - Sistema Operativo: Linux
4. En "Deployment Center":
   - Elegir GitHub, Local Git, o ZIP Deploy
5. Configurar variables de entorno en "Configuration"

## ⚙️ Configuración en Azure Portal

1. **Variables de Entorno**
   - Ir a App Service → Configuration → Application settings
   - Agregar:
     ```
     DB_HOST = cosa-analizador.mysql.database.azure.com
     DB_USER = Martin
     DB_PASSWORD = FILOMENO.2025
     DB_NAME = cosa-analizador
     DB_PORT = 3306
     NODE_ENV = production
     ```

2. **Comando de Inicio (Startup Command)**
   ```
   node server.js
   ```

3. **Configurar SSL de MySQL**
   - Azure MySQL requiere SSL por defecto
   - El código ya está preparado para manejar esto

## 🔐 Configuración de MySQL en Azure

Si tu base de datos MySQL está en Azure, asegúrate de:

1. **Permitir acceso desde Azure Services**
   - En el portal de Azure
   - Ir a tu MySQL Server
   - Firewall and virtual networks
   - Activar "Allow access to Azure services"

2. **SSL Connection**
   - Azure MySQL requiere SSL por defecto
   - Ya está configurado en `database.js`

## 📝 Archivos importantes para Azure

- ✅ `web.config` - Configuración IIS (para Windows App Service)
- ✅ `ecosystem.config.js` - Configuración PM2
- ✅ `package.json` - Configuración de Node.js con engines
- ✅ `.gitignore` - Archivos a excluir

## 🧪 Probar localmente antes de desplegar

```bash
# Establecer variables de entorno
$env:NODE_ENV="production"
$env:PORT="3000"

# Ejecutar
npm start
```

## 🔍 Verificar después del despliegue

```bash
# Health Check
curl https://tu-app.azurewebsites.net/health

# Logs en tiempo real
az webapp log tail --name smart-analytics-api --resource-group mi-grupo-recursos
```

## 🐛 Troubleshooting

### Error de conexión a MySQL
- Verificar firewall de Azure MySQL
- Verificar variables de entorno en Azure
- Habilitar "Allow access to Azure services"

### Error 503 Service Unavailable
- Verificar logs: `az webapp log tail`
- Verificar que Node.js se esté iniciando correctamente
- Verificar comando de inicio en Configuration

### Timeout en peticiones
- Aumentar timeout en Azure App Service settings
- Verificar que la base de datos responda

## 📊 Monitoreo

- Application Insights (opcional pero recomendado)
- Logs del App Service
- Métricas de rendimiento en Azure Portal

## 💰 Costos estimados

- **App Service**: Desde $13/mes (Basic B1)
- **MySQL**: Según plan seleccionado
- **Bandwidth**: Según uso

## 🔄 Actualización continua

Para actualizaciones futuras:

```bash
# Opción 1: Redeploy desde VS Code
# Click derecho → Deploy to Web App

# Opción 2: Git push (si configuraste Git deployment)
git push azure main

# Opción 3: Azure CLI
az webapp deployment source config-zip --src deploy.zip
```

## ✅ Checklist de Despliegue

- [ ] Variables de entorno configuradas en Azure
- [ ] Firewall de MySQL permite conexiones desde Azure
- [ ] SSL habilitado en MySQL
- [ ] Código subido/desplegado
- [ ] Health check responde correctamente
- [ ] Logs no muestran errores críticos
- [ ] Endpoints funcionan correctamente

## 🌐 URL de tu aplicación

Después del despliegue, tu API estará disponible en:
```
https://tu-app-name.azurewebsites.net
```
