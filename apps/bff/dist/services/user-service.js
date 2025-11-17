import { pool } from '../db/client.js';
export async function upsertUser(userId, email, name) {
    const result = await pool.query(`INSERT INTO users (id, email, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, updated_at = now()
     RETURNING id, email, name, plan, created_at as "createdAt", updated_at as "updatedAt"`, [userId, email, name ?? null]);
    // Ensure usage row exists
    await pool.query(`INSERT INTO usage_stats (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`, [userId]);
    return result.rows[0];
}
export async function getUsage(userId) {
    const result = await pool.query(`SELECT user_id as "userId",
            campaigns_generated as "campaignsGenerated",
            campaigns_limit as "campaignsLimit",
            rows_processed as "rowsProcessed",
            rows_limit as "rowsLimit",
            period_start as "periodStart",
            period_end as "periodEnd"
     FROM usage_stats
     WHERE user_id = $1`, [userId]);
    if (result.rows.length === 0) {
        return {
            userId,
            campaignsGenerated: 0,
            campaignsLimit: 3,
            rowsProcessed: 0,
            rowsLimit: 30,
            periodStart: new Date().toISOString(),
            periodEnd: new Date().toISOString(),
        };
    }
    return result.rows[0];
}
export async function incrementUsage(userId, campaigns, rows) {
    await pool.query(`UPDATE usage_stats
     SET campaigns_generated = campaigns_generated + $2,
         rows_processed = rows_processed + $3,
         updated_at = now()
     WHERE user_id = $1`, [userId, campaigns, rows]);
}
