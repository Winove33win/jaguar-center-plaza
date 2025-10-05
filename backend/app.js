import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const PORT = Number(process.env.PORT || 3333);
const FRONTEND_DIST = path.resolve(__dirname, 'dist');
const DATA_FILE = path.resolve(__dirname, 'data', 'companies.json');
const DATA_CACHE_TTL = 1000 * 60 * 5;

let cachedData = null;
let cachedAt = 0;

async function loadDirectory() {
  const now = Date.now();
  if (cachedData && now - cachedAt < DATA_CACHE_TTL) {
    return cachedData;
  }

  const raw = await readFile(DATA_FILE, 'utf-8');
  cachedData = JSON.parse(raw);
  cachedAt = now;
  return cachedData;
}

function flattenCompanies(categories) {
  return categories.flatMap((category) =>
    (category.companies || []).map((company) => ({
      ...company,
      categoryId: category.id,
      categoryName: category.name
    }))
  );
}

function includesTerm(text, term) {
  if (typeof text !== 'string') {
    return false;
  }

  return text.toLowerCase().includes(term);
}

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'connect-src': ["'self'"],
        'font-src': ["'self'", 'data:']
      }
    }
  })
);
app.use(cors({ origin: true, credentials: false }));
app.use(morgan('dev'));
app.use(express.json());

const apiRouter = express.Router();

apiRouter.get('/categories', async (req, res, next) => {
  try {
    const directory = await loadDirectory();
    res.json(directory);
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/companies', async (req, res, next) => {
  try {
    const directory = await loadDirectory();
    const companies = flattenCompanies(directory.categories || []);
    res.json({ updatedAt: directory.updatedAt, companies });
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/search', async (req, res, next) => {
  try {
    const query = String(req.query.q ?? '').trim();

    if (!query) {
      return res.json({ query: '', updatedAt: null, categories: [], companies: [] });
    }

    const normalized = query.toLowerCase();
    const directory = await loadDirectory();
    const { categories = [] } = directory;

    const matchedCategories = categories
      .filter((category) =>
        includesTerm(category.name, normalized) || includesTerm(category.description, normalized)
      )
      .map(({ id, name, description }) => ({ id, name, description }));

    const matchedCompanies = flattenCompanies(categories).filter(
      (company) =>
        includesTerm(company.name, normalized) ||
        includesTerm(company.summary, normalized) ||
        includesTerm(company.details, normalized)
    );

    res.json({
      query,
      updatedAt: directory.updatedAt,
      categories: matchedCategories,
      companies: matchedCompanies
    });
  } catch (error) {
    next(error);
  }
});

apiRouter.post('/contact', (req, res) => {
  const { name, email, message, phone, companyId } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Nome, e-mail e mensagem são obrigatórios.' });
  }

  console.info('Contato recebido:', {
    name,
    email,
    phone: phone || null,
    message,
    companyId: companyId || null,
    createdAt: new Date().toISOString()
  });

  return res.status(201).json({ message: 'Contato registrado com sucesso.' });
});

app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

app.use('/api', apiRouter);

app.use(express.static(FRONTEND_DIST));

app.get('*', (req, res, next) => {
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'), (error) => {
    if (error) {
      next(error);
    }
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`API on :${PORT}`);
});

export default app;
