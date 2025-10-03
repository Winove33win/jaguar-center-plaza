import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createPool } from 'mysql2/promise';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 4000;
const USE_JSON_DB = String(process.env.USE_JSON_DB).toLowerCase() === 'true';
const FRONTEND_DIST = process.env.FRONTEND_DIST
  ? path.resolve(__dirname, process.env.FRONTEND_DIST)
  : path.resolve(__dirname, 'dist');

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'", 'https:'],
        "img-src": ["'self'", 'data:', 'https:'],
        "connect-src": ["'self'", '*'],
        "font-src": ["'self'", 'https:', 'data:']
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

let pool;
if (!USE_JSON_DB) {
  pool = createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  });
}

async function loadCategoriesFromJson() {
  const filePath = path.resolve(__dirname, 'data', 'companies.json');
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

async function loadCategoriesFromDatabase() {
  if (!pool) {
    throw new Error('MySQL pool não inicializado');
  }

  const [rows] = await pool.query(
    `SELECT c.id as categoryId, c.slug, c.name as categoryName, c.description as categoryDescription,
            e.id as companyId, e.name as companyName, e.summary, e.details, e.phone, e.email, e.address, e.hours
       FROM company_categories c
  LEFT JOIN companies e ON e.category_id = c.id
   ORDER BY c.name ASC, e.name ASC`
  );

  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.categoryId]) {
      grouped[row.categoryId] = {
        id: row.slug || String(row.categoryId),
        name: row.categoryName,
        description: row.categoryDescription,
        companies: []
      };
    }

    if (row.companyId) {
      grouped[row.categoryId].companies.push({
        id: String(row.companyId),
        name: row.companyName,
        summary: row.summary,
        details: row.details,
        phone: row.phone,
        email: row.email,
        address: row.address,
        hours: row.hours
      });
    }
  }

  return {
    updatedAt: new Date().toISOString(),
    categories: Object.values(grouped)
  };
}

let cachedCategories = null;
let cachedAt = 0;
const CACHE_TTL = 1000 * 60 * 5;

async function getCategories() {
  const now = Date.now();
  if (cachedCategories && now - cachedAt < CACHE_TTL) {
    return cachedCategories;
  }

  const data = USE_JSON_DB
    ? await loadCategoriesFromJson()
    : await loadCategoriesFromDatabase();

  cachedCategories = data;
  cachedAt = now;
  return data;
}

app.get('/api/categories', async (req, res) => {
  try {
    const data = await getCategories();
    res.json(data);
  } catch (error) {
    console.error('Erro ao carregar categorias', error);
    res.status(500).json({ message: 'Não foi possível carregar as categorias.' });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message, companyId } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Nome, e-mail e mensagem são obrigatórios.' });
  }

  if (USE_JSON_DB) {
    console.info('Contato recebido (JSON DB):', {
      name,
      email,
      phone,
      message,
      companyId,
      createdAt: new Date().toISOString()
    });
    return res.status(201).json({ message: 'Contato registrado com sucesso.' });
  }

  try {
    if (!pool) {
      throw new Error('MySQL pool não inicializado');
    }

    await pool.query(
      `INSERT INTO contact_leads (name, email, phone, message, company_id)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || null, message, companyId || null]
    );

    res.status(201).json({ message: 'Contato registrado com sucesso.' });
  } catch (error) {
    console.error('Erro ao salvar contato', error);
    res.status(500).json({ message: 'Não foi possível enviar sua mensagem. Tente novamente.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(FRONTEND_DIST));
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Servidor Jaguar Center Plaza rodando na porta ${PORT}`);
});
