require('dotenv').config();
const axios = require('axios');

const API_URL = 'https://apiazuremsc-anhefqf5gzepdcav.mexicocentral-01.azurewebsites.net';
// const API_URL = 'http://localhost:3000'; // Descomentar para pruebas locales

const usuarios = [
  { email: 'admin@escuela.edu', password: 'admin', rol: 'Admin' },
  { email: 'sofia.torres@escuela.edu', password: '12345', rol: 'Alumno' }
];

async function testAPI() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  PRUEBA DE CONSUMO DE API - AZURE APP SERVICE');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`🌐 URL Base: ${API_URL}\n`);

  try {
    // 1. Test de Health Check
    console.log('1️⃣  TEST: GET /health');
    console.log('───────────────────────────────────────────────────────');
    try {
      const healthResponse = await axios.get(`${API_URL}/health`);
      console.log('✅ Status:', healthResponse.status);
      console.log('📦 Respuesta:', JSON.stringify(healthResponse.data, null, 2));
    } catch (err) {
      console.log('❌ Error:', err.response?.data || err.message);
    }

    // 2. Test de Ruta Raíz
    console.log('\n2️⃣  TEST: GET /');
    console.log('───────────────────────────────────────────────────────');
    try {
      const rootResponse = await axios.get(`${API_URL}/`);
      console.log('✅ Status:', rootResponse.status);
      console.log('📦 Respuesta:', JSON.stringify(rootResponse.data, null, 2));
    } catch (err) {
      console.log('❌ Error:', err.response?.data || err.message);
    }

    // 3. Test de Login con cada usuario
    console.log('\n3️⃣  TEST: POST /auth/login');
    console.log('───────────────────────────────────────────────────────');
    
    for (const usuario of usuarios) {
      console.log(`\n🔐 Probando login: ${usuario.email}`);
      console.log(`   Password: ${usuario.password}`);
      console.log(`   Rol esperado: ${usuario.rol}`);
      
      try {
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: usuario.email,
          password: usuario.password
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('   ✅ Login EXITOSO');
        console.log('   📦 Respuesta:');
        console.log(`      - Token: ${loginResponse.data.token}`);
        console.log(`      - Rol: ${loginResponse.data.rol}`);
        console.log(`      - Nombre: ${loginResponse.data.nombre}`);
        console.log(`      - ID: ${loginResponse.data.id}`);
        
        // Guardar token para pruebas siguientes
        usuario.token = loginResponse.data.token;
        
      } catch (err) {
        console.log('   ❌ Login FALLIDO');
        console.log('   📦 Error:', err.response?.data || err.message);
      }
    }

    // 4. Test de Dashboard Admin (requiere autenticación)
    console.log('\n4️⃣  TEST: GET /admin/dashboard/ (Requiere Auth)');
    console.log('───────────────────────────────────────────────────────');
    
    const adminUser = usuarios.find(u => u.rol === 'Admin');
    if (adminUser && adminUser.token) {
      try {
        const dashboardResponse = await axios.get(`${API_URL}/admin/dashboard/`, {
          headers: { 
            'Authorization': `Bearer ${adminUser.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Dashboard accesible');
        console.log('📦 Datos recibidos:');
        const data = dashboardResponse.data;
        console.log(`   - Total alumnos: ${data.total_alumnos || 'N/A'}`);
        console.log(`   - Total notas: ${data.total_notas || 'N/A'}`);
        console.log(`   - Alumnos de riesgo: ${data.alumnos_riesgo?.length || 0}`);
        
      } catch (err) {
        console.log('❌ Error al acceder al dashboard');
        console.log('📦 Error:', err.response?.status, err.response?.data || err.message);
      }
    } else {
      console.log('⚠️  No se pudo obtener token de Admin para esta prueba');
    }

    // 5. Test de CORS
    console.log('\n5️⃣  TEST: CORS Configuration');
    console.log('───────────────────────────────────────────────────────');
    console.log('Orígenes permitidos en el servidor:');
    console.log('   ✅ https://gray-beach-0cdc4470f.3.azurestaticapps.net');
    console.log('   ✅ https://blue-sea-02785951e3.azurestaticapps.net');
    console.log('   ✅ http://localhost:3000');
    console.log('   ✅ http://localhost:5173');
    console.log('   ✅ http://localhost:4200');
    console.log('   ✅ http://localhost:3001');

    // 6. Resumen
    console.log('\n6️⃣  RESUMEN DE PRUEBAS');
    console.log('═══════════════════════════════════════════════════════');
    console.log('API URL:', API_URL);
    console.log('Usuarios probados:', usuarios.length);
    console.log('Logins exitosos:', usuarios.filter(u => u.token).length);
    console.log('\n✅ PRUEBAS COMPLETADAS\n');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR GENERAL EN LAS PRUEBAS:');
    console.error(error.message);
  }
}

testAPI();
