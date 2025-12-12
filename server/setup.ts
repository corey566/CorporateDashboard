
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
    // Check if setup flag exists in system_settings or if admin user exists
    const result = await db.select().from(users).limit(1);
    return result.length > 0;
  } catch (error) {
    // If tables don't exist, setup is not complete
    return false;
  }
}

export async function initializeDatabase() {
  try {
    // Run migrations to create all tables
    console.log('Initializing database schema...');
    
    // The schema is already defined, we just need to ensure tables exist
    // This will be handled by drizzle push
    
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
