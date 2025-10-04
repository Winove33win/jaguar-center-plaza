const express = require('express');
const pool = require('../db');
const { allowedTables, defaults } = require('../tables');

const router = express.Router();

const metadataCache = new Map();

async function getTableMetadata(table) {
  if (metadataCache.has(table)) {
    return metadataCache.get(table);
  }

  const [columnsResult] = await pool.query('SHOW COLUMNS FROM ??', [table]);
  const columns = columnsResult.map((column) => column.Field);
  let primaryKey = columnsResult.find((column) => column.Key === 'PRI')?.Field || null;

  if (!primaryKey && columns.includes('pk')) {
    primaryKey = 'pk';
  }

  if (!primaryKey) {
    primaryKey = columns[0];
  }

  const metadata = { columns, primaryKey };
  metadataCache.set(table, metadata);
  return metadata;
}

function ensureAllowedTable(table) {
  if (!allowedTables.includes(table)) {
    const error = new Error('Tabela não permitida.');
    error.status = 400;
    throw error;
  }
}

function normalizeRow(row) {
  if (!row || typeof row !== 'object') {
    return row;
  }

  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    if (value instanceof Date) {
      const adjusted = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
      normalized[key] = adjusted.toISOString();
    } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
      normalized[key] = `${value.replace(' ', 'T')}.000Z`;
    } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      normalized[key] = `${value}T00:00:00.000Z`;
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
}

router.get('/health', (req, res) => {
  res.json({ ok: true });
});

// DEBUG: checar conexão com banco
router.get('/_debug/db', async (req, res) => {
  try {
    const [db] = await pool.query('SELECT DATABASE() AS db, CURRENT_USER() AS user');
    const [[count]] = await pool.query('SELECT COUNT(*) AS tot FROM lojas');
    res.json({ ok: true, db: db[0], lojas: count.tot });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.get('/tables', (req, res) => {
  res.json(allowedTables);
});

router.get('/:table/:pk', async (req, res, next) => {
  try {
    const { table, pk } = req.params;
    ensureAllowedTable(table);

    const metadata = await getTableMetadata(table);
    const [rows] = await pool.query('SELECT * FROM ?? WHERE ?? = ? LIMIT 1', [table, metadata.primaryKey, pk]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Registro não encontrado.' });
    }

    res.json(normalizeRow(rows[0]));
  } catch (error) {
    next(error);
  }
});

router.get('/:table', async (req, res, next) => {
  try {
    const { table } = req.params;
    ensureAllowedTable(table);

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const requestedLimit = parseInt(req.query.limit, 10) || 20;
    const limit = Math.max(1, Math.min(requestedLimit, 100));
    const offset = (page - 1) * limit;

    const searchTerm = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const requestedOrder = typeof req.query.orderBy === 'string' ? req.query.orderBy.trim() : '';
    const direction = String(req.query.dir || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const metadata = await getTableMetadata(table);
    const defaultOrder = defaults.orderBy[table] || defaults.orderBy['*'] || metadata.primaryKey;
    let orderColumn = requestedOrder || defaultOrder;

    if (!metadata.columns.includes(orderColumn)) {
      if (metadata.columns.includes(defaultOrder)) {
        orderColumn = defaultOrder;
      } else if (metadata.columns.includes('pk')) {
        orderColumn = 'pk';
      } else {
        orderColumn = metadata.primaryKey;
      }
    }

    const searchFieldsDefault = defaults.searchFields[table] || defaults.searchFields['*'] || [];
    const searchFields = searchFieldsDefault.filter((field) => metadata.columns.includes(field));

    const likeValue = `%${searchTerm}%`;
    const hasSearch = Boolean(searchTerm) && searchFields.length > 0;
    const whereClause = hasSearch ? ` WHERE (${searchFields.map(() => '?? LIKE ?').join(' OR ')})` : '';

    const baseParams = [table];
    if (hasSearch) {
      for (const field of searchFields) {
        baseParams.push(field, likeValue);
      }
    }

    const countQuery = `SELECT COUNT(*) AS total FROM ??${whereClause}`;
    const [countRows] = await pool.query(countQuery, [...baseParams]);
    const total = Number(countRows[0]?.total || 0);

    const dataQuery = `SELECT * FROM ??${whereClause} ORDER BY ?? ${direction} LIMIT ? OFFSET ?`;
    const dataParams = [...baseParams, orderColumn, limit, offset];
    const [rows] = await pool.query(dataQuery, dataParams);

    const data = rows.map(normalizeRow);

    res.json({ data, page, limit, total });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
