require('dotenv').config();
const { Usuario, testConnection } = require('./database.js');

(async () => {
  try {
    console.log('Conectando a Azure MySQL...');
    await testConnection();
    
    const users = await Usuario.findAll({ 
      attributes: ['id', 'email', 'rol', 'nombre'],
      limit: 20
    });
    
    console.log('\n=== USUARIOS EN BASE DE DATOS ===\n');
    users.forEach(u => {
      console.log(`ID: ${u.id}`);
      console.log(`Email: ${u.email}`);
      console.log(`Rol: ${u.rol}`);
      console.log(`Nombre: ${u.nombre}`);
      console.log('---');
    });
    
    console.log(`\nTotal usuarios: ${users.length}`);
    
    // Buscar específicamente el usuario admin
    const admin = await Usuario.findOne({ where: { email: 'admin@escuela.edu' } });
    if (admin) {
      console.log('\n=== USUARIO ADMIN ENCONTRADO ===');
      console.log(`Email: ${admin.email}`);
      console.log(`Password Hash: ${admin.password_hash}`);
      console.log(`Rol: ${admin.rol}`);
    } else {
      console.log('\n⚠️ Usuario admin@escuela.edu NO encontrado');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
