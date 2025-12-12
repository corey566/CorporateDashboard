
import { db, pool } from './db';
import { users } from '@shared/schema';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';

interface SetupConfig {
  adminUsername: string;
  adminPassword: string;
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  appDomain?: string;
  appPort: string;
}

export async function isSetupComplete(): Promise<boolean> {
  try {
    // Check if users table exists and has admin user
    const result = await pool.query('SELECT COUNT(*) FROM users');
    const count = parseInt(result.rows[0].count, 10);
    return count > 0;
  } catch (error: any) {
    // If tables don't exist or connection error, setup is not complete
    console.log('Setup status check:', error?.message || 'Tables not found');
    return false;
  }
}

export async function initializeDatabase() {
  try {
    console.log('Initializing database schema...');
    
    // Create all required tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#3B82F6',
        volume_target NUMERIC(12,2) DEFAULT 0,
        units_target INTEGER DEFAULT 0,
        target_cycle TEXT DEFAULT 'monthly',
        reset_day INTEGER DEFAULT 1,
        reset_month INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#3B82F6',
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        photo TEXT,
        team_id INTEGER REFERENCES teams(id),
        category_id INTEGER REFERENCES categories(id),
        category TEXT,
        volume_target NUMERIC(12,2) DEFAULT 0,
        units_target INTEGER DEFAULT 0,
        target_cycle TEXT DEFAULT 'monthly',
        reset_day INTEGER DEFAULT 1,
        reset_month INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        username TEXT,
        password TEXT,
        can_self_report BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        agent_id INTEGER NOT NULL REFERENCES agents(id),
        volume NUMERIC(12,2) NOT NULL,
        units INTEGER DEFAULT 1,
        description TEXT,
        category TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS cash_offers (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        amount NUMERIC(12,2),
        expiry_date TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS media_slides (
        id SERIAL PRIMARY KEY,
        title TEXT,
        type TEXT DEFAULT 'image',
        url TEXT,
        content TEXT,
        duration INTEGER DEFAULT 10,
        is_active BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS news_ticker (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS sound_effects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        event_type TEXT NOT NULL,
        url TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Database schema initialized successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return { success: false, error: error.message };
  }
}

export async function createAdminUser(username: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.insert(users).values({
      username,
      password: hashedPassword,
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Admin user creation error:', error);
    return { success: false, error: error.message };
  }
}

export async function saveSetupConfig(config: SetupConfig) {
  try {
    // Create .env file with the configuration
    const envContent = `
# Database Configuration
DATABASE_URL=postgresql://${config.dbUser}:${config.dbPassword}@${config.dbHost}:${config.dbPort}/${config.dbName}?sslmode=prefer

# Session Configuration
SESSION_SECRET=${generateRandomSecret()}

# Application Configuration
NODE_ENV=production
PORT=${config.appPort}
${config.appDomain ? `APP_DOMAIN=${config.appDomain}` : ''}
`.trim();

    const fs = await import('fs');
    fs.writeFileSync('.env', envContent);
    
    return { success: true };
  } catch (error: any) {
    console.error('Config save error:', error);
    return { success: false, error: error.message };
  }
}

function generateRandomSecret(): string {
  return require('crypto').randomBytes(32).toString('hex');
}

export async function runSetup(config: SetupConfig) {
  try {
    // Save configuration
    const configResult = await saveSetupConfig(config);
    if (!configResult.success) {
      return configResult;
    }

    // Initialize database
    const dbResult = await initializeDatabase();
    if (!dbResult.success) {
      return dbResult;
    }

    // Create admin user
    const adminResult = await createAdminUser(config.adminUsername, config.adminPassword);
    if (!adminResult.success) {
      return adminResult;
    }

    return { success: true, message: 'Setup completed successfully' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
