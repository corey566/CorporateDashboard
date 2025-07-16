import { Pool, neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createSuperAdmin() {
  try {
    const email = 'admin@example.com';
    const password = 'admin123';
    const name = 'Super Admin';
    
    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT * FROM super_admins WHERE email = $1',
      [email]
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('Super admin already exists');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create super admin
    await pool.query(
      'INSERT INTO super_admins (email, password, name) VALUES ($1, $2, $3)',
      [email, hashedPassword, name]
    );
    
    console.log('Super admin created successfully');
    console.log('Email:', email);
    console.log('Password:', password);
    
  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await pool.end();
  }
}

createSuperAdmin();