import { Pool } from 'pg';
import { env, isDev } from '../config/env.js';
export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
export async function ensureSchema() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT,
      plan TEXT DEFAULT 'free',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);
    await pool.query(`
    CREATE TABLE IF NOT EXISTS usage_stats (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      campaigns_generated INT DEFAULT 0,
      campaigns_limit INT DEFAULT 3,
      rows_processed INT DEFAULT 0,
      rows_limit INT DEFAULT 30,
      period_start TIMESTAMPTZ DEFAULT now(),
      period_end TIMESTAMPTZ DEFAULT now()
    );
  `);
    if (isDev) {
        console.log('[db] schema ensured');
    }
}
export async function shutdownPool() {
    await pool.end();
}
