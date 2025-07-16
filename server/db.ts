import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = "postgresql://neondb_owner:npg_mXcejVDTP8U6@ep-polished-sea-aetzkmw6-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

console.log("Database URL:", DATABASE_URL.replace(/:[^@]*@/, ':***@'));

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });