import express from 'express';

import pool from '../db/pool.js';
import { bySlug } from '../lib/categories.js';
import { pickCompanyFields } from '../lib/normalize.js';

const router = express.Router();
const columnCache = new Map();

async function getTableColumns(table) {
  if (columnCache.has(table)) {
    return columnCache.get(table);
  }

  const database = process.env.DB_NAME;
  if (!database) {
    columnCache.set(table, []);
    return [];
  }

  const [rows] = await pool.query(
    'SELECT column_name FROM information_schema.columns WHERE table_schema = ? AND table_name = ?',
    [database, table]
  );

  const columns = Array.isArray(rows)
    ? rows
        .map((row) => row.column_name || row.COLUMN_NAME)
        .filter((name) => typeof name === 'string' && name.length > 0)
    : [];

  columnCache.set(table, columns);
  return columns;
}

function buildSearchClause(columns, searchTerm, params) {
  if (!searchTerm) {
    return '';
  }

  const likeValue = `%${searchTerm}%`;
  const searchColumns = [];

  if (columns.includes('titulo')) {
    searchColumns.push('`titulo` LIKE ?');
    params.push(likeValue);
  }

  if (columns.includes('title')) {
    searchColumns.push('`title` LIKE ?');
    params.push(likeValue);
  }

  if (columns.includes('descricao')) {
    searchColumns.push('`descricao` LIKE ?');
    params.push(likeValue);
  }

  if (searchColumns.length === 0) {
    params.splice(0, params.length);
    return '';
  }

  return `(${searchColumns.join(' OR ')})`;
}

function resolveOrderClause(columns) {
  if (columns.includes('updated_date')) {
    return 'ORDER BY `updated_date` IS NULL, `updated_date` DESC';
  }

  if (columns.includes('updated_at')) {
    return 'ORDER BY `updated_at` IS NULL, `updated_at` DESC';
  }

  if (columns.includes('created_date')) {
    return 'ORDER BY `created_date` IS NULL, `created_date` DESC';
  }

  if (columns.includes('created_at')) {
    return 'ORDER BY `created_at` IS NULL, `created_at` DESC';
  }

  return '';
}

function normalizePage(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

router.get('/companies', async (req, res) => {
  const { category, page = '1', pageSize = '12', q } = req.query;

  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'category is required' });
  }

  const categoryInfo = bySlug[category];

  if (!categoryInfo) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    const columns = await getTableColumns(categoryInfo.table);

    if (!columns.length) {
      return res.status(404).json({ error: 'Category data not available' });
    }

    const pageNumber = normalizePage(page, 1);
    const size = Math.min(normalizePage(pageSize, 12), 100);
    const offset = (pageNumber - 1) * size;

    const searchTerm = typeof q === 'string' ? q.trim() : '';
    const whereParams = [];
    const whereClause = buildSearchClause(columns, searchTerm, whereParams);
    const filters = whereClause ? `WHERE ${whereClause}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM \`${categoryInfo.table}\` ${filters}`,
      whereParams
    );

    const total = Number(countRows?.[0]?.total ?? countRows?.[0]?.c ?? 0);
    const orderClause = resolveOrderClause(columns);

    const [rows] = await pool.query(
      `SELECT * FROM \`${categoryInfo.table}\` ${filters} ${orderClause} LIMIT ? OFFSET ?`,
      [...whereParams, size, offset]
    );

    const items = Array.isArray(rows)
      ? rows.map((row) => {
          const normalized = pickCompanyFields(row, categoryInfo.slug);
          return {
            id: normalized.id,
            category: normalized.category,
            name: normalized.name,
            description: normalized.description,
            logo: normalized.logo,
            address: normalized.address,
            room: normalized.room,
            phone: normalized.phone,
            whatsapp: normalized.whatsapp,
          };
        })
      : [];

    res.json({ page: pageNumber, pageSize: size, total, items });
  } catch (error) {
    console.error('Failed to list companies', error);
    res.status(500).json({ error: 'Failed to list companies' });
  }
});

router.get('/companies/:category/:id', async (req, res) => {
  const { category, id } = req.params;

  const categoryInfo = bySlug[category];

  if (!categoryInfo) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    const columns = await getTableColumns(categoryInfo.table);

    if (!columns.length) {
      return res.status(404).json({ error: 'Category data not available' });
    }

    const conditions = [];
    const params = [];

    if (columns.includes('id')) {
      conditions.push('`id` = ?');
      params.push(id);
    }

    if (columns.includes('pk')) {
      conditions.push('`pk` = ?');
      params.push(id);
    }

    if (!conditions.length) {
      return res.status(500).json({ error: 'Category primary key not configured' });
    }

    const [rows] = await pool.query(
      `SELECT * FROM \`${categoryInfo.table}\` WHERE ${conditions.join(' OR ')} LIMIT 1`,
      params
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const normalized = pickCompanyFields(rows[0], categoryInfo.slug);
    res.json(normalized);
  } catch (error) {
    console.error('Failed to fetch company details', error);
    res.status(500).json({ error: 'Failed to fetch company details' });
  }
});

export default router;
