const express = require('express');
const pool = require('../db');
const { allowedTables, defaults, categoryMetadata } = require('../tables');

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

// Rotas fixas primeiro para evitar conflito com rotas dinâmicas
router.get('/health', (req, res) => {
  res.json({ ok: true });
});

router.get('/tables', (_req, res) => {
  res.json({ tables: allowedTables });
});

// DEBUG: checar conexão com banco
router.get('/_debug/db', async (_req, res) => {
  try {
    const [[db]] = await pool.query('SELECT DATABASE() AS db');
    const [[count]] = await pool.query('SELECT COUNT(*) AS tot FROM lojas');
    res.json({ ok: true, db: db.db, lojas: count.tot });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const COMPANY_FIELD_CANDIDATES = {
  name: ['titulo', 'nome', 'name', 'empresa', 'razao_social', 'fantasia'],
  summary: ['resumo', 'descricao_curta', 'descricao_resumida', 'descricao', 'texto_curto', 'headline'],
  details: ['detalhes', 'descricao_completa', 'informacoes', 'texto', 'sobre', 'descricao'],
  phone: ['telefone', 'celular', 'whatsapp', 'fone', 'contato', 'contato_telefone'],
  email: ['email', 'e_mail', 'contato_email'],
  address: ['endereco', 'endereco_completo', 'localizacao', 'local', 'address', 'sala'],
  hours: ['horario', 'horario_funcionamento', 'funcionamento', 'horarios', 'atendimento']
};

const UPDATED_AT_FIELDS = [
  'updated_at',
  'atualizado_em',
  'data_atualizacao',
  'ultima_atualizacao',
  'modified_at'
];

function humanizeTableName(table) {
  return table
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function ensureString(value, fallback = '') {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return fallback;
}

function pickValue(row, candidates, fallback = '') {
  for (const candidate of candidates) {
    if (typeof candidate === 'function') {
      const result = candidate(row);
      if (result) {
        return ensureString(result, fallback);
      }
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(row, candidate)) {
      const result = ensureString(row[candidate], fallback);
      if (result) {
        return result;
      }
    }
  }

  return fallback;
}

function extractUpdatedAt(row) {
  for (const field of UPDATED_AT_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(row, field)) {
      continue;
    }

    const value = row[field];
    if (!value) {
      continue;
    }

    const date = new Date(value);
    if (!Number.isNaN(date.valueOf())) {
      return date;
    }
  }

  return null;
}

function resolveOrderColumn(table, metadata) {
  const defaultOrder = defaults.orderBy[table] || defaults.orderBy['*'];
  const candidates = [defaultOrder, 'ordem', 'order', 'posicao', 'titulo', 'nome', metadata.primaryKey];

  for (const candidate of candidates) {
    if (candidate && metadata.columns.includes(candidate)) {
      return candidate;
    }
  }

  return metadata.primaryKey;
}

function mapCompanyRow(table, metadata, row, index) {
  const category = categoryMetadata[table];

  const pkValue = row[metadata.primaryKey];
  const idSuffix = pkValue !== undefined && pkValue !== null ? pkValue : index + 1;

  const name = pickValue(row, COMPANY_FIELD_CANDIDATES.name, category?.name || humanizeTableName(table));
  const summary = pickValue(row, COMPANY_FIELD_CANDIDATES.summary, '');
  const details = pickValue(row, COMPANY_FIELD_CANDIDATES.details, summary);
  const phone = pickValue(row, COMPANY_FIELD_CANDIDATES.phone, '');
  const email = pickValue(row, COMPANY_FIELD_CANDIDATES.email, '');
  const address = pickValue(row, COMPANY_FIELD_CANDIDATES.address, '');
  const hours = pickValue(row, COMPANY_FIELD_CANDIDATES.hours, '');

  return {
    id: `${table}-${idSuffix}`,
    name,
    summary,
    details,
    phone,
    email,
    address,
    hours
  };
}

router.get('/categories', async (_req, res, next) => {
  try {
    const categoriesResult = await Promise.all(
      allowedTables.map(async (table) => {
        const metadata = await getTableMetadata(table);
        const orderColumn = resolveOrderColumn(table, metadata);
        const [rows] = await pool.query('SELECT * FROM ?? ORDER BY ?? ASC', [table, orderColumn]);

        let latestUpdate = null;

        const companies = rows.map((row, index) => {
          const normalized = normalizeRow(row);
          const company = mapCompanyRow(table, metadata, normalized, index);
          const rowUpdatedAt = extractUpdatedAt(normalized);

          if (rowUpdatedAt && (!latestUpdate || rowUpdatedAt > latestUpdate)) {
            latestUpdate = rowUpdatedAt;
          }

          return company;
        });

        const categoryMeta = categoryMetadata[table] || {
          id: table,
          name: humanizeTableName(table),
          description: ''
        };

        return {
          table,
          latestUpdate,
          category: {
            id: categoryMeta.id,
            name: categoryMeta.name,
            description: categoryMeta.description,
            companies
          }
        };
      })
    );

    let updatedAt = null;
    const categories = categoriesResult.map(({ category, latestUpdate }) => {
      if (latestUpdate && (!updatedAt || latestUpdate > updatedAt)) {
        updatedAt = latestUpdate;
      }

      return category;
    });

    res.json({
      updatedAt: (updatedAt || new Date()).toISOString(),
      categories
    });
  } catch (error) {
    next(error);
  }
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
