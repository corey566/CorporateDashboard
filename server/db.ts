import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_mXcejVDTP8U6@ep-polished-sea-aetzkmw6.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

console.log("Database URL:", DATABASE_URL.replace(/:[^@]*@/, ':***@'));

export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  max: 10, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', result.rows[0].now);
  }
});
export const db = drizzle({ client: pool, schema });