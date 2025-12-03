# Smart Analytics API - Express + Node.js

API de análisis académico migrada de FastAPI (Python) a Express (Node.js).
**✅ Listo para Azure App Service**

## 🚀 Características

- ✅ API REST con Express
- ✅ Autenticación basada en tokens
- ✅ Análisis de datos académicos desde archivos Excel
- ✅ Conexión a MySQL con Sequelize ORM
- ✅ Middleware de autenticación y autorización por roles
- ✅ Upload de archivos con Multer
- ✅ CORS habilitado
- ✅ **Configurado para Azure App Service**
- ✅ **SSL para Azure MySQL incluido**

## 📋 Requisitos Previos

- Node.js v16 o superior
- MySQL Server
- npm o yarn

## 🔧 Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear un archivo `.env` basado en `.env.example`:
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con tus credenciales:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=analisis_academico
   DB_PORT=3306
   PORT=8000
   ```

4. **Crear la base de datos**
   
   Ejecutar en MySQL:
   ```sql
   CREATE DATABASE analisis_academico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

## 🎯 Uso

### Modo Desarrollo (con auto-reinicio)
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

El servidor se iniciará en `http://localhost:8000`

## 📡 Endpoints Disponibles

### Salud del Servidor
```http
GET /health
```

### Autenticación
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@escuela.edu",
  "password": "pass123"
}
```

### Upload y Análisis (Solo Admin)
```http
POST /admin/upload-and-analyze/
Authorization: Bearer {email_token}
Content-Type: multipart/form-data

file: archivo.xlsx
```

### Dashboard Admin
```http
GET /dashboard/admin
Authorization: Bearer {email_token}
```

### Dashboard Docente
```http
GET /dashboard/docente
Authorization: Bearer {email_token}
```

## 👤 Usuarios de Prueba

Los usuarios en la base de datos de Azure MySQL:

| Email | Password | Rol |
|-------|----------|-----|
| admin@escuela.edu | admin | Admin |
| docente@escuela.edu | docente | Docente |

## 📁 Estructura del Proyecto

```
Api_azure/
├── server.js          # Servidor Express principal
├── database.js        # Configuración de Sequelize y modelos
├── analisis.js        # Lógica de análisis de datos
├── package.json       # Dependencias del proyecto
├── .env              # Variables de entorno (crear manualmente)
├── .env.example      # Ejemplo de variables de entorno
└── backend/          # Código Python original (legacy)
    ├── main.py
    ├── database.py
    └── analisis.py
```

## 🔄 Diferencias con la Versión Python

### Tecnologías Reemplazadas

| Python | Node.js |
|--------|---------|
| FastAPI | Express |
| SQLAlchemy | Sequelize |
| Pandas | Procesamiento manual con Arrays |
| NumPy | Math.js |
| Pydantic | Validación manual |
| Uvicorn | Node.js HTTP Server |

### Mejoras
- ✅ Mayor compatibilidad con ecosistema JavaScript
- ✅ Más simple de desplegar en servicios cloud modernos
- ✅ Mejor integración con frontends JavaScript/React

## 🛠️ Dependencias Principales

- **express** - Framework web
- **sequelize** - ORM para MySQL
- **mysql2** - Driver MySQL
- **multer** - Upload de archivos
- **xlsx** - Procesamiento de archivos Excel
- **cors** - Manejo de CORS
- **dotenv** - Variables de entorno

## 📝 Notas Importantes

1. **Autenticación**: El sistema usa el email como token. En producción, se recomienda usar JWT.

2. **Validación**: La validación de datos es más simple que en FastAPI/Pydantic. Se recomienda agregar una biblioteca como `joi` o `express-validator` para validaciones más robustas.

3. **TensorFlow**: La versión de Python usaba TensorFlow para predicciones. En esta versión, se simplificó con lógica básica. Si necesitas ML, considera usar `@tensorflow/tfjs-node`.

4. **Base de Datos**: Asegúrate de que las tablas en MySQL estén creadas antes de usar el sistema.

5. **Azure MySQL**: La configuración incluye SSL requerido por Azure MySQL Database.

## ☁️ Despliegue en Azure

### Opción 1: Script Automático (Recomendado)

```powershell
# Ejecutar el script de despliegue
.\deploy-azure.ps1
```

El script te guiará paso a paso y configurará todo automáticamente.

### Opción 2: Despliegue Manual

Ver instrucciones completas en `AZURE_DEPLOYMENT.md`

### Opción 3: Desde VS Code

1. Instalar extensión "Azure App Service"
2. Click derecho en el proyecto → "Deploy to Web App..."
3. Seguir las instrucciones

**Archivos de configuración para Azure:**
- ✅ `web.config` - Configuración IIS
- ✅ `ecosystem.config.js` - Configuración PM2
- ✅ `.deployment` - Scripts de despliegue
- ✅ `.github/workflows/azure-deploy.yml` - CI/CD con GitHub Actions
- ✅ `deploy-azure.ps1` - Script de despliegue automatizado

## 🔐 Configuración de Azure MySQL

La aplicación ya está configurada para conectarse a Azure MySQL con SSL:
- Host: `mysqlingles.mysql.database.azure.com`
- Usuario: `admin_ingles`
- Base de datos: `proyectoIngles`
- SSL: Habilitado automáticamente

## 🐛 Troubleshooting

### Error de conexión a MySQL
- Verificar que MySQL esté corriendo
- Verificar credenciales en `.env`
- Verificar que la base de datos exista

### Puerto en uso
- Cambiar el puerto en `.env`
- Matar el proceso que usa el puerto: `netstat -ano | findstr :8000`

## 📄 Licencia

ISC
