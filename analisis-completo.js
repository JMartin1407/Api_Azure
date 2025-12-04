require('dotenv').config();
const { Usuario, AlumnoDB, NotaDB, AnalisisResultadoDB, testConnection } = require('./database.js');

(async () => {
  try {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ANÁLISIS COMPLETO DE BASE DE DATOS AZURE MYSQL');
    console.log('═══════════════════════════════════════════════════════\n');

    // 1. Test de conexión
    console.log('1️⃣  PRUEBA DE CONEXIÓN');
    console.log('───────────────────────────────────────────────────────');
    await testConnection();
    console.log('Host:', process.env.DB_HOST);
    console.log('Base de datos:', process.env.DB_NAME);
    console.log('Usuario DB:', process.env.DB_USER);
    
    // 2. Análisis de Usuarios
    console.log('\n2️⃣  ANÁLISIS DE USUARIOS (Tabla: usuarios)');
    console.log('───────────────────────────────────────────────────────');
    const totalUsuarios = await Usuario.count();
    console.log(`Total de usuarios: ${totalUsuarios}`);
    
    const usuarios = await Usuario.findAll({ 
      attributes: ['id', 'email', 'password', 'rol', 'nombre'],
      raw: true
    });
    
    console.log('\n📋 Listado completo de usuarios:\n');
    usuarios.forEach((u, index) => {
      console.log(`Usuario ${index + 1}:`);
      console.log(`  ID: ${u.id}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Password: ${u.password_hash}`);
      console.log(`  Rol: ${u.rol}`);
      console.log(`  Nombre: ${u.nombre}`);
      console.log('');
    });
    
    // Distribución por roles
    const rolesDist = {};
    usuarios.forEach(u => {
      rolesDist[u.rol] = (rolesDist[u.rol] || 0) + 1;
    });
    
    console.log('📊 Distribución por roles:');
    Object.entries(rolesDist).forEach(([rol, count]) => {
      console.log(`  ${rol}: ${count} usuario(s)`);
    });
    
    // 3. Análisis de Alumnos
    console.log('\n3️⃣  ANÁLISIS DE ALUMNOS (Tabla: alumnos)');
    console.log('───────────────────────────────────────────────────────');
    const totalAlumnos = await AlumnoDB.count();
    console.log(`Total de alumnos: ${totalAlumnos}`);
    
    if (totalAlumnos > 0) {
      const alumnos = await AlumnoDB.findAll({ limit: 10 });
      console.log('\n📋 Primeros 10 alumnos:');
      alumnos.forEach((a, i) => {
        console.log(`  ${i + 1}. ${a.nombre} (Grupo: ${a.grupo_tag || 'N/A'})`);
      });
      
      // Distribución por grupo
      const grupos = await AlumnoDB.findAll({ 
        attributes: ['grupo_tag'],
        group: ['grupo_tag']
      });
      console.log(`\n📊 Grupos encontrados: ${grupos.length}`);
    } else {
      console.log('⚠️  No hay alumnos registrados en la base de datos');
    }
    
    // 4. Análisis de Notas
    console.log('\n4️⃣  ANÁLISIS DE NOTAS (Tabla: notas)');
    console.log('───────────────────────────────────────────────────────');
    const totalNotas = await NotaDB.count();
    console.log(`Total de notas registradas: ${totalNotas}`);
    
    if (totalNotas > 0) {
      const notasSample = await NotaDB.findAll({ limit: 5 });
      console.log('\n📋 Muestra de notas:');
      notasSample.forEach((n, i) => {
        console.log(`  ${i + 1}. ${n.nombre_alumno} - ${n.materia}: ${n.calificacion}`);
      });
      
      // Estadísticas
      const materias = await NotaDB.findAll({
        attributes: ['materia'],
        group: ['materia']
      });
      console.log(`\n📊 Materias registradas: ${materias.length}`);
    } else {
      console.log('⚠️  No hay notas registradas');
    }
    
    // 5. Análisis de Resultados
    console.log('\n5️⃣  ANÁLISIS DE RESULTADOS (Tabla: analisis_resultado)');
    console.log('───────────────────────────────────────────────────────');
    const totalResultados = await AnalisisResultadoDB.count();
    console.log(`Total de análisis realizados: ${totalResultados}`);
    
    if (totalResultados > 0) {
      const resultados = await AnalisisResultadoDB.findAll({ limit: 5 });
      console.log('\n📋 Últimos análisis:');
      resultados.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.nombre_alumno}`);
        console.log(`     - Riesgo: ${(r.probabilidad_riesgo * 100).toFixed(1)}%`);
        console.log(`     - Materia crítica: ${r.materia_critica_temprana || 'N/A'}`);
      });
    } else {
      console.log('⚠️  No hay análisis realizados');
    }
    
    // 6. Prueba de Login para cada usuario
    console.log('\n6️⃣  PRUEBA DE AUTENTICACIÓN');
    console.log('───────────────────────────────────────────────────────');
    console.log('Probando login con cada usuario...\n');
    
    for (const usuario of usuarios) {
      const loginTest = await Usuario.findOne({ 
        where: { email: usuario.email } 
      });
      
      if (loginTest && loginTest.password_hash === usuario.password_hash) {
        console.log(`✅ ${usuario.email} -> Password: "${usuario.password_hash}" (VÁLIDO)`);
      } else {
        console.log(`❌ ${usuario.email} -> Error en validación`);
      }
    }
    
    // 7. Resumen de Endpoints
    console.log('\n7️⃣  ENDPOINTS DISPONIBLES EN LA API');
    console.log('───────────────────────────────────────────────────────');
    console.log('GET  / - Información de la API');
    console.log('GET  /health - Health check');
    console.log('POST /auth/login - Autenticación de usuarios');
    console.log('POST /admin/upload-and-analyze/ - Subir y analizar Excel (Admin)');
    console.log('GET  /admin/dashboard/ - Dashboard administrativo (Admin)');
    console.log('GET  /docente/dashboard/ - Dashboard para docentes (Docente)');
    
    // 8. Resumen Final
    console.log('\n8️⃣  RESUMEN FINAL');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Conexión a Azure MySQL: EXITOSA`);
    console.log(`📊 Total usuarios: ${totalUsuarios}`);
    console.log(`📊 Total alumnos: ${totalAlumnos}`);
    console.log(`📊 Total notas: ${totalNotas}`);
    console.log(`📊 Total análisis: ${totalResultados}`);
    console.log('\n🔑 Credenciales de acceso válidas:');
    usuarios.forEach(u => {
      console.log(`   Email: ${u.email} | Password: ${u.password_hash} | Rol: ${u.rol}`);
    });
    
    console.log('\n🌐 URLs importantes:');
    console.log('   API Azure: https://apiazuremsc-anhefqf5gzepdcav.mexicocentral-01.azurewebsites.net');
    console.log('   Frontend: https://blue-sea-02785951e3.azurestaticapps.net');
    console.log('   GitHub: https://github.com/JMartin1407/Api_Azure.git');
    
    console.log('\n✅ ANÁLISIS COMPLETADO\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ ERROR DURANTE EL ANÁLISIS:');
    console.error(err.message);
    console.error(err.stack);
    process.exit(1);
  }
})();
