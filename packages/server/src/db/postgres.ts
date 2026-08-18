import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// Railway provides DATABASE_URL as a full connection string.
// Fallback to individual vars for local dev (docker-compose).
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'collabeditor',
      user: process.env.DB_USER || 'collab',
      password: process.env.DB_PASSWORD || 'collabpass',
    });

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
