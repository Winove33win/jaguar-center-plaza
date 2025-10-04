const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { query } = require('./src/db/pool');

dotenv.config();

const app = express();

app.set('trust proxy', 1);

const allowedTableNames = [
  'administracao',
  'advocacia',
  'beleza',
  'contabilidade',
  'imobiliaria',
  'industrias',
  'lojas'
];
const allowedTables = new Set(allowedTableNames);

const allowedOrigins = [
  /^https?:\/\/([a-z0-9-]+\.)*plesk\.page$/i,
  /^https?:\/\/([a-z0-9-]+\.)?jaguarcenterplaza\.com\.br$/i
];

const isDevelopment = process.env.NODE_ENV !== 'production';

const statusValues = new Set(['PUBLISHED', 'DRAFT', 'ARCHIVED']);

function createTableConfig({
  columns,
  searchColumns = [],
  sortableColumns = [],
  defaultSort = [],
  filterableColumns = {},
  likeFilters = {},
  hasPublishDates = false,
  extraFilters = null
}) {
  return {
    allowedColumns: new Set(columns),
    searchColumns,
    sortableColumns,
    defaultSort,
    filterableColumns,
    likeFilters,
    hasPublishDates,
    extraFilters
  };
}

const tableConfigs = {
  administracao: createTableConfig({
    columns: [
      'id',
      'created_date',
      'updated_date',
      'owner_col',
      'titulo',
      'descricao',
      'endereco',
      'celular',
      'email',
      'sala',
      'logo',
      'administracao_all_list',
      'administracao_title_endereco',
      'administracao_titulo',
      'instagram',
      'facebook',
      'galeria_de_midia',
      'link_whatsapp',
      'publish_date',
      'unpublish_date',
      'status_col'
    ],
    searchColumns: ['titulo', 'descricao'],
    sortableColumns: ['titulo', 'created_date', 'updated_date', 'publish_date', 'status_col'],
    defaultSort: [
      { column: 'updated_date', direction: 'DESC' },
      { column: 'created_date', direction: 'DESC' }
    ],
    filterableColumns: {
      administracao_titulo: 'administracao_titulo',
      sala: 'sala',
      email: 'email'
    },
    likeFilters: {
      celular: 'celular'
    },
    hasPublishDates: true,
    extraFilters(builder, queryParams) {
      if (queryParams.endereco_formatted) {
        const formatted = String(queryParams.endereco_formatted);
        builder.push(
          'JSON_UNQUOTE(JSON_EXTRACT(??, ?)) LIKE ?',
          'endereco',
          '$.formatted',
          `%${formatted}%`
        );
      }
    }
  }),
  advocacia: createTableConfig({
    columns: [
      'id',
      'created_date',
      'updated_date',
      'owner_col',
      'title',
      'endereco',
      'celular',
      'email',
      'sala',
      'logo',
      'advocacia_all_list',
      'advocacia_item',
      'galeria_de_midia',
      'descricao',
      'instagram',
      'facebook',
      'link_whatsapp',
      'status_col'
    ],
    searchColumns: ['title', 'descricao'],
    sortableColumns: ['title', 'created_date', 'updated_date', 'status_col'],
    defaultSort: [
      { column: 'updated_date', direction: 'DESC' },
      { column: 'created_date', direction: 'DESC' }
    ],
    filterableColumns: {
      sala: 'sala',
      link_whatsapp: 'link_whatsapp'
    },
    likeFilters: {
      celular: 'celular'
    }
  }),
  beleza: createTableConfig({
    columns: [
      'id',
      'created_date',
      'updated_date',
      'owner_col',
      'title',
      'endereco',
      'celular',
      'email',
      'sala',
      'logo',
      'beleza_all_list',
      'beleza_item',
      'galeria_de_midia',
      'instagram',
      'facebook',
      'descricao',
      'link_whatsapp',
      'status_col'
    ],
    searchColumns: ['title', 'descricao'],
    sortableColumns: ['title', 'created_date', 'updated_date', 'status_col'],
    defaultSort: [
      { column: 'updated_date', direction: 'DESC' },
      { column: 'created_date', direction: 'DESC' }
    ],
    filterableColumns: {
      sala: 'sala',
      link_whatsapp: 'link_whatsapp'
    },
    likeFilters: {
      celular: 'celular'
    }
  }),
  contabilidade: createTableConfig({
    columns: [
      'id',
      'created_date',
      'updated_date',
      'owner_col',
      'title',
      'titulo',
      'descricao',
      'endereco',
      'celular',
      'email',
      'sala',
      'imagem',
      'contabilidade_all_list',
      'contabilidade_item',
      'galeria_de_midia',
      'instagram',
      'facebook',
      'links_whatsapp',
      'status_col'
    ],
    searchColumns: ['title', 'titulo', 'descricao'],
    sortableColumns: ['title', 'titulo', 'created_date', 'updated_date', 'status_col'],
    defaultSort: [
      { column: 'updated_date', direction: 'DESC' },
      { column: 'created_date', direction: 'DESC' }
    ],
    filterableColumns: {
      contabilidade_item: 'contabilidade_item',
      links_whatsapp: 'links_whatsapp'
    },
    likeFilters: {
      celular: 'celular'
    }
  }),
  imobiliaria: createTableConfig({
    columns: [
      'id',
      'created_date',
      'updated_date',
      'owner_col',
      'titulo',
      'descricao',
      'endereco',
      'celular',
      'email',
      'sala',
      'imagem',
      'imobiliaria_titulo',
      'imobiliaria_all_list',
      'imobiliaria_item',
      'instagram',
      'facebook',
      'galeria_de_midia',
      'link_whatsapp',
      'status_col'
    ],
    searchColumns: ['titulo', 'descricao'],
    sortableColumns: ['titulo', 'created_date', 'updated_date', 'status_col'],
    defaultSort: [
      { column: 'updated_date', direction: 'DESC' },
      { column: 'created_date', direction: 'DESC' }
    ],
    filterableColumns: {
      imobiliaria_item: 'imobiliaria_item',
      imobiliaria_titulo: 'imobiliaria_titulo'
    },
    likeFilters: {
      celular: 'celular'
    }
  }),
  industrias: createTableConfig({
    columns: [
      'id',
      'created_date',
      'updated_date',
      'owner_col',
      'titulo',
      'endereco',
      'celular',
      'email',
      'sala',
      'logo',
      'industrias_all_list',
      'industrias_item',
      'galeria_de_midia',
      'instagram',
      'facebook',
      'descricao',
      'link_whatsapp',
      'status_col'
    ],
    searchColumns: ['titulo', 'descricao'],
    sortableColumns: ['titulo', 'created_date', 'updated_date', 'status_col'],
    defaultSort: [
      { column: 'updated_date', direction: 'DESC' },
      { column: 'created_date', direction: 'DESC' }
    ],
    filterableColumns: {
      industrias_item: 'industrias_item',
      sala: 'sala'
    },
    likeFilters: {
      celular: 'celular'
    }
  }),
  lojas: createTableConfig({
    columns: [
      'id',
      'created_date',
      'updated_date',
      'owner_col',
      'title',
      'logo',
      'descricao',
      'email',
      'site',
      'galeria_de_midia',
      'lojas_title',
      'lojas_all',
      'telefone',
      'instagram',
      'facebook',
      'tiktok',
      'website',
      'publish_date',
      'unpublish_date',
      'status_col'
    ],
    searchColumns: ['title', 'descricao'],
    sortableColumns: ['title', 'created_date', 'updated_date', 'publish_date', 'status_col'],
    defaultSort: [
      { column: 'updated_date', direction: 'DESC' },
      { column: 'created_date', direction: 'DESC' }
    ],
    filterableColumns: {
      lojas_title: 'lojas_title'
    },
    likeFilters: {
      telefone: 'telefone',
      instagram: 'instagram',
      website: 'website'
    },
    hasPublishDates: true
  })
};

function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.some((regex) => regex.test(origin))) {
    return true;
  }

  if (isDevelopment && /^https?:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/i.test(origin)) {
    return true;
  }

  return false;
}

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    const error = new Error('Origin not allowed by CORS');
    error.status = 403;
    return callback(error);
  }
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', apiLimiter);

function ensureAllowedTable(table) {
  if (!allowedTables.has(table)) {
    const error = new Error('Tabela não permitida.');
    error.status = 400;
    throw error;
  }
}

function getTableConfig(table) {
  const config = tableConfigs[table];

  if (!config) {
    const error = new Error('Configuração da tabela não encontrada.');
    error.status = 500;
    throw error;
  }

  return config;
}

function parseLimit(value, fallback = 100) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 1), 1000);
}

function parsePage(value) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function createWhereBuilder() {
  return {
    clauses: [],
    params: [],
    push(clause, ...values) {
      this.clauses.push(clause);
      this.params.push(...values);
    },
    build() {
      if (!this.clauses.length) {
        return { whereSql: '', params: [] };
      }

      return {
        whereSql: ` WHERE ${this.clauses.join(' AND ')}`,
        params: this.params
      };
    }
  };
}

function buildWhereClause(table, queryParams) {
  const config = getTableConfig(table);
  const builder = createWhereBuilder();

  const q = typeof queryParams.q === 'string' ? queryParams.q.trim() : '';
  if (q && config.searchColumns.length) {
    const placeholders = config.searchColumns.map(() => '??').join(', ');
    builder.push(`MATCH (${placeholders}) AGAINST (? IN BOOLEAN MODE)`, ...config.searchColumns, `${q}*`);
  }

  const status = typeof queryParams.status === 'string' ? queryParams.status.trim().toUpperCase() : '';
  if (status && statusValues.has(status)) {
    builder.push('status_col = ?', status);
  }

  if (config.filterableColumns) {
    for (const [paramName, column] of Object.entries(config.filterableColumns)) {
      const value = queryParams[paramName];
      if (value === undefined || value === null || value === '') {
        continue;
      }

      const normalizedValue = typeof value === 'string' ? value : String(value);
      builder.push('?? = ?', column, normalizedValue);
    }
  }

  if (config.likeFilters) {
    for (const [paramName, column] of Object.entries(config.likeFilters)) {
      const value = queryParams[paramName];
      if (value === undefined || value === null || value === '') {
        continue;
      }

      const normalizedValue = typeof value === 'string' ? value : String(value);
      builder.push('?? LIKE ?', column, `%${normalizedValue}%`);
    }
  }

  if (typeof config.extraFilters === 'function') {
    config.extraFilters(builder, queryParams);
  }

  return builder.build();
}

function buildOrderClause(table, sortParam) {
  const config = getTableConfig(table);
  const allowed = new Set(config.sortableColumns || []);
  const sorts = [];

  if (sortParam) {
    const parts = String(sortParam)
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    for (const part of parts) {
      let direction = 'ASC';
      let column = part;

      if (column.startsWith('-')) {
        direction = 'DESC';
        column = column.slice(1);
      } else if (column.startsWith('+')) {
        column = column.slice(1);
      }

      if (!allowed.has(column)) {
        continue;
      }

      sorts.push({ column, direction });
    }
  }

  if (!sorts.length && Array.isArray(config.defaultSort) && config.defaultSort.length) {
    sorts.push(...config.defaultSort);
  }

  if (!sorts.length) {
    return { orderSql: '', params: [] };
  }

  const clauses = [];
  const params = [];

  for (const sort of sorts) {
    const direction = sort.direction === 'ASC' ? 'ASC' : 'DESC';
    clauses.push(`?? ${direction}`);
    params.push(sort.column);
  }

  return {
    orderSql: ` ORDER BY ${clauses.join(', ')}`,
    params
  };
}

function filterPayload(table, body, { forUpdate = false } = {}) {
  const config = getTableConfig(table);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {};
  }

  const filtered = {};

  for (const [key, value] of Object.entries(body)) {
    if (!config.allowedColumns.has(key)) {
      continue;
    }

    if (value === undefined) {
      continue;
    }

    filtered[key] = value;
  }

  if (forUpdate) {
    delete filtered.id;
    delete filtered.pk;
    delete filtered.created_date;
  }

  return filtered;
}

async function fetchRecordById(table, id) {
  const rows = await query('SELECT * FROM ?? WHERE id = ? LIMIT 1', [table, id]);
  return Array.isArray(rows) ? rows[0] : rows;
}

const apiRouter = express.Router();

apiRouter.get(
  '/health',
  asyncHandler(async (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  })
);

apiRouter.get(
  '/tables',
  asyncHandler(async (_req, res) => {
    res.json({ tables: allowedTableNames });
  })
);

apiRouter.get(
  '/_debug/db',
  asyncHandler(async (req, res) => {
    if (!isDevelopment) {
      return res.status(404).json({ error: 'Not found' });
    }

    const table = req.query.table ? String(req.query.table) : undefined;
    const limit = parseLimit(req.query.limit, 50);

    if (table) {
      ensureAllowedTable(table);
      const rows = await query('SELECT * FROM ?? LIMIT ?', [table, limit]);
      return res.json({ ok: true, table, rows });
    }

    const dbRows = await query('SELECT DATABASE() AS db');
    const database = Array.isArray(dbRows) && dbRows[0] ? dbRows[0].db : null;

    res.json({ ok: true, database });
  })
);

apiRouter.get(
  '/:table/:id',
  asyncHandler(async (req, res) => {
    const table = req.params.table;
    ensureAllowedTable(table);

    const id = req.params.id;
    const record = await fetchRecordById(table, id);

    if (!record) {
      return res.status(404).json({ error: 'Registro não encontrado.' });
    }

    res.json(record);
  })
);

apiRouter.get(
  '/:table',
  asyncHandler(async (req, res) => {
    const table = req.params.table;
    ensureAllowedTable(table);
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit, 25);
    const offset = (page - 1) * limit;

    const { whereSql, params: whereParams } = buildWhereClause(table, req.query);
    const { orderSql, params: orderParams } = buildOrderClause(table, req.query.sort);

    const dataSql = `SELECT * FROM ??${whereSql}${orderSql} LIMIT ? OFFSET ?`;
    const dataParams = [table, ...whereParams, ...orderParams, limit, offset];
    const rows = await query(dataSql, dataParams);

    const countSql = `SELECT COUNT(*) AS total FROM ??${whereSql}`;
    const countParams = [table, ...whereParams];
    const countRows = await query(countSql, countParams);
    const total = Array.isArray(countRows) && countRows[0] ? Number(countRows[0].total) || 0 : 0;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  })
);

apiRouter.post(
  '/:table',
  asyncHandler(async (req, res) => {
    const table = req.params.table;
    ensureAllowedTable(table);

    const payload = filterPayload(table, req.body);
    const now = new Date();

    if (!payload.id) {
      payload.id = randomUUID();
    }

    if (!payload.created_date) {
      payload.created_date = now;
    }

    payload.updated_date = now;

    if (payload.status_col && !statusValues.has(String(payload.status_col))) {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    const columns = Object.keys(payload);

    if (!columns.length) {
      return res.status(400).json({ error: 'Corpo da requisição vazio ou inválido.' });
    }

    const placeholders = columns.map(() => '??').join(', ');
    const valuesPlaceholders = columns.map(() => '?').join(', ');
    const params = [table, ...columns, ...columns.map((column) => payload[column])];

    await query(`INSERT INTO ?? (${placeholders}) VALUES (${valuesPlaceholders})`, params);

    const created = await fetchRecordById(table, payload.id);
    res.status(201).json(created);
  })
);

apiRouter.put(
  '/:table/:id',
  asyncHandler(async (req, res) => {
    const table = req.params.table;
    ensureAllowedTable(table);

    const id = req.params.id;
    const payload = filterPayload(table, req.body, { forUpdate: true });
    const now = new Date();
    payload.updated_date = now;

    if (payload.status_col && !statusValues.has(String(payload.status_col))) {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    const columns = Object.keys(payload);

    if (!columns.length) {
      return res.status(400).json({ error: 'Corpo da requisição vazio ou inválido.' });
    }

    const assignments = columns.map(() => '?? = ?').join(', ');
    const params = [table, ...columns.flatMap((column) => [column, payload[column]]), id];

    const result = await query(`UPDATE ?? SET ${assignments} WHERE id = ?`, params);

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro não encontrado.' });
    }

    const updated = await fetchRecordById(table, id);
    res.json(updated);
  })
);

apiRouter.delete(
  '/:table/:id',
  asyncHandler(async (req, res) => {
    const table = req.params.table;
    ensureAllowedTable(table);

    const id = req.params.id;
    const result = await query('DELETE FROM ?? WHERE id = ?', [table, id]);

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro não encontrado.' });
    }

    res.status(204).send();
  })
);

apiRouter.post(
  '/:table/:id/publish',
  asyncHandler(async (req, res) => {
    const table = req.params.table;
    ensureAllowedTable(table);

    const config = getTableConfig(table);
    const id = req.params.id;
    const now = new Date();

    const setClauses = ['status_col = ?', 'updated_date = ?'];
    const params = [table, 'PUBLISHED', now];

    if (config.hasPublishDates && config.allowedColumns.has('publish_date')) {
      setClauses.push('publish_date = ?');
      params.push(now);
    }

    if (config.hasPublishDates && config.allowedColumns.has('unpublish_date')) {
      setClauses.push('unpublish_date = NULL');
    }

    params.push(id);

    const sql = `UPDATE ?? SET ${setClauses.join(', ')} WHERE id = ?`;
    const result = await query(sql, params);

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro não encontrado.' });
    }

    const record = await fetchRecordById(table, id);
    res.json(record);
  })
);

apiRouter.post(
  '/:table/:id/unpublish',
  asyncHandler(async (req, res) => {
    const table = req.params.table;
    ensureAllowedTable(table);

    const config = getTableConfig(table);
    const id = req.params.id;
    const now = new Date();

    const setClauses = ['status_col = ?', 'updated_date = ?'];
    const params = [table, 'DRAFT', now];

    if (config.hasPublishDates && config.allowedColumns.has('unpublish_date')) {
      setClauses.push('unpublish_date = ?');
      params.push(now);
    }

    params.push(id);

    const sql = `UPDATE ?? SET ${setClauses.join(', ')} WHERE id = ?`;
    const result = await query(sql, params);

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro não encontrado.' });
    }

    const record = await fetchRecordById(table, id);
    res.json(record);
  })
);

app.use('/api', apiRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

const publicDir = path.join(__dirname, 'public');
const indexPath = path.join(publicDir, 'index.html');

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  if (fs.existsSync(indexPath)) {
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }

      res.sendFile(indexPath);
    });
  }
}

app.use((err, req, res, _next) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? 'Erro interno do servidor.' : err.message;

  res.status(status).json({ error: message });
});

const port = Number(process.env.PORT || 3333);
const host = '0.0.0.0';

app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`Jaguar Center Plaza API listening on http://${host}:${port}`);
});

module.exports = app;
