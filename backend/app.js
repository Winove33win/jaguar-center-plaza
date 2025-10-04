const path = require('path');
const fs = require('fs');
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

function parseLimit(value, fallback = 100) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 1), 1000);
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
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
    const rows = await query('SELECT * FROM ?? WHERE id = ? LIMIT 1', [table, id]);
    const record = Array.isArray(rows) ? rows[0] : rows;

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

    const rows = await query(
      'SELECT * FROM ?? ORDER BY updated_date DESC, created_date DESC LIMIT 500',
      [table]
    );

    res.json(rows);
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
