import express from 'express';

import pool from '../db/pool.js';
import { CATEGORIES } from '../lib/categories.js';

const router = express.Router();

async function fetchAvailableTables() {
  const database = process.env.DB_NAME;
  if (!database) {
    return new Set();
  }

  const [rows] = await pool.query(
    'SELECT table_name FROM information_schema.tables WHERE table_schema = ?',
    [database]
  );

  const names = Array.isArray(rows)
    ? rows
        .map((row) => row.table_name || row.TABLE_NAME)
        .filter((name) => typeof name === 'string' && name.length > 0)
    : [];

  return new Set(names);
}

router.get('/categories', async (req, res) => {
  try {
    const availableTables = await fetchAvailableTables();

    const categories = await Promise.all(
      CATEGORIES.map(async (category) => {
        if (!availableTables.has(category.table)) {
          return { name: category.name, slug: category.slug, count: 0 };
        }

        const [rows] = await pool.query(`SELECT COUNT(*) AS c FROM \`${category.table}\``);
        const countRow = Array.isArray(rows) && rows.length > 0 ? rows[0] : {};
        const count = Number(countRow.c ?? countRow.count ?? 0) || 0;

        return { name: category.name, slug: category.slug, count };
      })
    );

    res.json(categories);
  } catch (error) {
    console.error('Failed to load categories', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

export default router;
