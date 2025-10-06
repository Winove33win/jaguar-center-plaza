import { Router } from 'express';
import { CATEGORIES } from './companies.js';
import pool, { ping } from '../../db/pool.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    env: {
      USE_JSON_DB: process.env.USE_JSON_DB ?? null,
      NODE_ENV: process.env.NODE_ENV ?? null
    }
  });
});

router.get('/health/db', async (_req, res) => {
  try {
    const dbOk = await ping();
    const tablesEntries = await Promise.all(
      CATEGORIES.map(async ({ slug, tabela }) => {
        try {
          const [rows] = await pool.query('SHOW TABLES LIKE ?', [tabela]);
          return [slug, Array.isArray(rows) && rows.length > 0];
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to inspect table ${tabela}`, error);
          return [slug, false];
        }
      })
    );

    const tables = Object.fromEntries(tablesEntries);
    const ok = dbOk && Object.values(tables).every(Boolean);

    return res.json({ ok, tables });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database health check failed', error);
    return res.status(500).json({ error: 'Falha ao verificar banco', code: 'DB_HEALTHCHECK_FAILED' });
  }
});

export default router;

