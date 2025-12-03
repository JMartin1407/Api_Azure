// database.js - Configuración de Sequelize para Azure MySQL

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Leer credenciales de variables de entorno
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'analisis_academico';
const DB_PORT = process.env.DB_PORT || 3306;

// Configuración de Sequelize con SSL para Azure MySQL
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 60000
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  logging: false // Cambiar a console.log para debug
});

// --- MODELOS ORM ---

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

// Modelo AlumnoDB
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
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'alumnos',
  timestamps: false
});

// Modelo NotaDB
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
    type: DataTypes.STRING(50),
    allowNull: true
  },
  materia: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  tema: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  calificacion: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  asistencia_pct: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  conducta_pct: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'notas',
  timestamps: false
});

// Modelo AnalisisResultadoDB
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
    type: DataTypes.STRING(150),
    allowNull: true
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
    type: DataTypes.DECIMAL(6, 3),
    allowNull: true
  },
  materia_critica_temprana: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  recomendacion_pedagogica: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  fecha_analisis: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
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

// --- FUNCIONES DE BASE DE DATOS ---

/**
 * Verifica la conexión a la base de datos
 */
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a Azure MySQL establecida correctamente.');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
}

/**
 * Inicializa usuarios de prueba (solo si la tabla está vacía)
 */
async function initDbUser() {
  try {
    const userCount = await Usuario.count();
    
    if (userCount === 0) {
      const usuariosPrueba = [
        {
          email: 'admin@escuela.edu',
          password_hash: 'pass123',
          rol: 'Admin',
          nombre: 'Admin Superior'
        },
        {
          email: 'docente@escuela.edu',
          password_hash: 'pass123',
          rol: 'Docente',
          nombre: 'Mtra. Elena'
        },
        {
          email: 'alumno@escuela.edu',
          password_hash: 'pass123',
          rol: 'Alumno',
          nombre: 'Alumno Test'
        },
        {
          email: 'padre@escuela.edu',
          password_hash: 'pass123',
          rol: 'Padre',
          nombre: 'Padre de Familia'
        }
      ];
      
      await Usuario.bulkCreate(usuariosPrueba);
      console.log('✅ Usuarios de prueba creados.');
    } else {
      console.log(`ℹ️ Base de datos ya contiene ${userCount} usuarios. No se crearán usuarios de prueba.`);
    }
  } catch (error) {
    console.error('⚠️ Error durante la inicialización de usuarios:', error.message);
    console.log('La aplicación continuará, la BD se conectará cuando sea necesario.');
  }
}

// Exportar modelos y funciones
module.exports = {
  sequelize,
  Usuario,
  AlumnoDB,
  NotaDB,
  AnalisisResultadoDB,
  testConnection,
  initDbUser
};
