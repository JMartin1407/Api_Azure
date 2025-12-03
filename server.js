// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
require('dotenv').config();

const { Usuario, AlumnoDB, NotaDB, AnalisisResultadoDB, initDbUser, testConnection } = require('./database');
const { runAnalysisLogic, MATERIAS } = require('./analisis');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
// Configuración CORS para permitir frontend de Azure Static Web Apps
const allowedOrigins = [
  'https://gray-beach-0cdc4470f.3.azurestaticapps.net',
  'https://blue-sea-02785951e3.azurestaticapps.net',
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server
  'http://localhost:4200', // Angular dev server
  'http://localhost:3001'  // React dev server alternativo
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman, o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Multer para subida de archivos
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// --- MIDDLEWARE DE AUTENTICACIÓN ---
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Token inválido' });
  }
  
  const token = authHeader.split(' ')[1]; // El token es el email
  
  try {
    const user = await Usuario.findOne({ where: { email: token } });
    
    if (!user) {
      return res.status(401).json({ detail: 'Token inválido' });
    }
    
    req.user = {
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
      id: user.id
    };
    
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).json({ detail: 'Error en autenticación' });
  }
}

// --- MIDDLEWARE DE PERMISOS ---
function checkPermission(requiredRole) {
  return (req, res, next) => {
    if (req.user.rol !== requiredRole) {
      return res.status(403).json({ detail: 'Acceso denegado' });
    }
    next();
  };
}

// --- RUTAS ---

// Ruta principal
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Análisis Académico - Express/Node.js',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      login: '/auth/login',
      upload: '/admin/upload-and-analyze/',
      dashboards: {
        admin: '/admin/dashboard/',
        docente: '/docente/dashboard/'
      }
    },
    status: 'running'
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend API is running' });
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ detail: 'Email y password son requeridos' });
    }
    
    const user = await Usuario.findOne({ where: { email } });
    
    if (!user || user.password_hash !== password) {
      return res.status(400).json({ detail: 'Credenciales incorrectas' });
    }
    
    res.json({
      token: user.email,
      rol: user.rol,
      nombre: user.nombre,
      id: user.id
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
});

// Upload y análisis (Solo Admin)
app.post('/admin/upload-and-analyze/', authenticateToken, checkPermission('Admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'No se proporcionó ningún archivo' });
    }
    
    // Leer archivo Excel desde el buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (!data || data.length === 0) {
      return res.status(400).json({ detail: 'El archivo está vacío o no tiene el formato correcto' });
    }
    
    // Ejecutar análisis
    const resultados = runAnalysisLogic(data);
    const df_procesado = resultados.df_procesado;
    
    // Preparar datos de preview (primeros 10)
    const alumnos = df_procesado.slice(0, 10).map(row => {
      // Calcular detalle de promedios por materia
      const detalle_promedios_por_materia = {};
      MATERIAS.forEach(materia => {
        const promedio_key = `${materia.toLowerCase()}_promedio`;
        detalle_promedios_por_materia[materia] = parseFloat(row[promedio_key]) || 0;
      });
      
      return {
        id: row.id,
        nombre: row.nombre || 'Sin nombre',
        promedio_gral_calificacion: parseFloat(row.promedio_gral_calificacion) || 0,
        promedio_gral_asistencia: parseFloat(row.promedio_gral_asistencia) || 0,
        promedio_gral_conducta: parseFloat(row.promedio_gral_conducta) || 0,
        detalle_promedios_por_materia,
        area_de_progreso: parseFloat(row.area_de_progreso) || 0,
        probabilidad_riesgo: parseFloat(row.probabilidad_riesgo) || 0,
        vector_magnitud: parseFloat(row.vector_magnitud) || 0,
        recomendacion_pedagogica: row.recomendacion_pedagogica || 'N/A',
        materia_critica_temprana: row.materia_critica_temprana || 'N/A'
      };
    });
    
    // Calcular promedio de área de progreso
    const area_de_progreso_promedio = df_procesado.reduce((acc, row) => acc + (row.area_de_progreso || 0), 0) / df_procesado.length;
    
    res.json({
      message: 'Análisis completado exitosamente',
      promedio_general: resultados.promedio_general,
      area_de_progreso_grupo: parseFloat(area_de_progreso_promedio.toFixed(2)),
      correlaciones: resultados.correlaciones,
      estadistica_grupal: resultados.estadistica_grupal,
      data_preview: alumnos
    });
    
  } catch (error) {
    console.error('Error en upload-and-analyze:', error);
    res.status(500).json({ detail: error.message });
  }
});

// Dashboard Admin
app.get('/dashboard/admin', authenticateToken, checkPermission('Admin'), async (req, res) => {
  try {
    res.json({
      message: `Bienvenido ${req.user.nombre}`,
      data: {}
    });
  } catch (error) {
    console.error('Error en dashboard admin:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
});

// Dashboard Docente
app.get('/dashboard/docente', authenticateToken, checkPermission('Docente'), async (req, res) => {
  try {
    res.json({
      message: `Bienvenido ${req.user.nombre}`,
      data: {}
    });
  } catch (error) {
    console.error('Error en dashboard docente:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
});

// --- INICIALIZACIÓN DEL SERVIDOR ---
async function startServer() {
  try {
    // Probar conexión a la base de datos
    const connected = await testConnection();
    
    if (connected) {
      // Inicializar usuarios de prueba
      await initDbUser();
    } else {
      console.warn('⚠️ No se pudo conectar a la base de datos. El servidor continuará sin BD.');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor Express corriendo en http://localhost:${PORT}`);
      console.log(`📊 Smart Analytics API v1.0`);
      console.log(`\n✅ Endpoints disponibles:`);
      console.log(`   GET  /health`);
      console.log(`   POST /auth/login`);
      console.log(`   POST /admin/upload-and-analyze/`);
      console.log(`   GET  /dashboard/admin`);
      console.log(`   GET  /dashboard/docente\n`);
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
startServer();

module.exports = app;
