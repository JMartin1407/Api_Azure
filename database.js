// database.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Configuración de la base de datos desde variables de entorno
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'analisis_academico';
const DB_PORT = process.env.DB_PORT || '3306';

// Crear instancia de Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Para Azure MySQL
    },
    connectTimeout: 60000
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// --- MODELOS ---

// Modelo Usuario
const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  rol: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'usuarios',
  timestamps: false
});

// Modelo Alumno
const AlumnoDB = sequelize.define('AlumnoDB', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  grupo_tag: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'alumnos',
  timestamps: false
});

// Modelo Nota
const NotaDB = sequelize.define('NotaDB', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  alumno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'alumnos',
      key: 'id'
    }
  },
  nombre_alumno: {
    type: DataTypes.STRING(50)
  },
  materia: {
    type: DataTypes.STRING(50)
  },
  tema: {
    type: DataTypes.STRING(100)
  },
  calificacion: {
    type: DataTypes.DECIMAL(5, 2)
  },
  asistencia_pct: {
    type: DataTypes.DECIMAL(5, 2)
  },
  conducta_pct: {
    type: DataTypes.DECIMAL(5, 2)
  },
  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'notas',
  timestamps: false
});

// Modelo AnalisisResultado
const AnalisisResultadoDB = sequelize.define('AnalisisResultadoDB', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  alumno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'alumnos',
      key: 'id'
    }
  },
  grupo_tag: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  nombre_alumno: {
    type: DataTypes.STRING(150)
  },
  probabilidad_riesgo: {
    type: DataTypes.DECIMAL(4, 3),
    allowNull: false
  },
  vector_magnitud: {
    type: DataTypes.DECIMAL(6, 3),
    allowNull: false
  },
  area_de_progreso: {
    type: DataTypes.DECIMAL(6, 3)
  },
  materia_critica_temprana: {
    type: DataTypes.STRING(100)
  },
  recomendacion_pedagogica: {
    type: DataTypes.STRING(500)
  },
  fecha_analisis: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'analisis_resultado',
  timestamps: false
});

// --- RELACIONES ---
AlumnoDB.hasMany(NotaDB, { foreignKey: 'alumno_id', as: 'notas' });
NotaDB.belongsTo(AlumnoDB, { foreignKey: 'alumno_id', as: 'alumno' });

AlumnoDB.hasMany(AnalisisResultadoDB, { foreignKey: 'alumno_id', as: 'resultados' });
AnalisisResultadoDB.belongsTo(AlumnoDB, { foreignKey: 'alumno_id', as: 'alumno' });

// --- FUNCIONES DE INICIALIZACIÓN ---

async function initDbUser() {
  try {
    // Sincronizar tablas (crear si no existen)
    await sequelize.sync({ alter: false });
    console.log('✅ Tablas sincronizadas');
    
    // Verificar si el usuario admin ya existe
    const adminUser = await Usuario.findOne({ where: { email: 'admin@escuela.edu' } });
    
    if (!adminUser) {
      const usuariosPrueba = [
        { email: 'admin@escuela.edu', password_hash: 'pass123', rol: 'Admin', nombre: 'Admin Superior' },
        { email: 'docente@escuela.edu', password_hash: 'pass123', rol: 'Docente', nombre: 'Mtra. Elena' },
        { email: 'alumno@escuela.edu', password_hash: 'pass123', rol: 'Alumno', nombre: 'Alumno Test' },
        { email: 'padre@escuela.edu', password_hash: 'pass123', rol: 'Padre', nombre: 'Padre de Familia' }
      ];
      
      await Usuario.bulkCreate(usuariosPrueba);
      console.log('✅ Usuarios de prueba creados exitosamente');
    } else {
      console.log('✅ Usuarios ya existen en la base de datos');
    }
  } catch (error) {
    console.warn('⚠️ No se pudo inicializar usuarios:', error.message);
    console.warn('La aplicación continuará, la BD se conectará cuando sea necesario.');
  }
}

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    return false;
  }
}

module.exports = {
  sequelize,
  Usuario,
  AlumnoDB,
  NotaDB,
  AnalisisResultadoDB,
  initDbUser,
  testConnection
};
