import pool from './pool.js';

export const CATEGORIES = [
  { slug: 'administracao', tabela: 'administracao', nome: 'Administração' },
  { slug: 'advocacia', tabela: 'advocacia', nome: 'Advocacia' },
  { slug: 'beleza', tabela: 'beleza', nome: 'Beleza' },
  { slug: 'contabilidade', tabela: 'contabilidade', nome: 'Contabilidade' },
  { slug: 'imobiliaria', tabela: 'imobiliaria', nome: 'Imobiliária' },
  { slug: 'industrias', tabela: 'industrias', nome: 'Indústrias' },
  { slug: 'lojas', tabela: 'lojas', nome: 'Lojas' },
  { slug: 'saude', tabela: 'saude', nome: 'Saúde' },
  { slug: 'servicos_publicos', tabela: 'servicos_publicos', nome: 'Serviços Públicos' }
];

const categoriesBySlug = new Map(CATEGORIES.map((category) => [category.slug, category]));

const TABLE_COLUMNS_CACHE = new Map();

const SEARCHABLE_COLUMNS = [
  'titulo',
  'title',
  'nome',
  'name',
  'razao_social',
  'descricao',
  'description',
  'tagline',
  'email',
  'celular',
  'telefone',
  'whatsapp'
];

const TITLE_PREFERRED_COLUMNS = [
  'title',
  'titulo',
  'title',
  'nome',
  'name',
  'razao_social',
  'descricao',
  'description',
  'tagline'
];

const FALLBACK_ORDER_COLUMNS = ['pk', 'id'];

function normalizeColumnName(column) {
  return typeof column === 'string' ? column.trim() : '';
}

async function getTableColumns(table) {
  if (TABLE_COLUMNS_CACHE.has(table)) {
    return TABLE_COLUMNS_CACHE.get(table);
  }

  try {
    const [rows] = await pool.query(`SHOW COLUMNS FROM \`${table}\``);
    const entries = Array.isArray(rows)
      ? rows
          .map((row) => {
            const field = normalizeColumnName(row.Field ?? row.field);
            return field ? [field.toLowerCase(), field] : null;
          })
          .filter((entry) => entry !== null)
      : [];

    const columnsMap = new Map(entries);
    TABLE_COLUMNS_CACHE.set(table, columnsMap);
    return columnsMap;
  } catch (error) {
    if (error?.code === 'ER_NO_SUCH_TABLE') {
      const emptyMap = new Map();
      TABLE_COLUMNS_CACHE.set(table, emptyMap);
      return emptyMap;
    }

    throw error;
  }
}

function buildSearchClause(columns, searchTerm) {
  if (!searchTerm) {
    return { clause: '', params: [] };
  }

  const availableColumns = SEARCHABLE_COLUMNS.map((column) => columns.get(column)).filter(Boolean);

  if (availableColumns.length === 0) {
    return { clause: '', params: [] };
  }

  const like = `%${searchTerm}%`;
  const clause =
    '(' +
    availableColumns.map((column) => `COALESCE(\`${column}\`, '') LIKE ?`).join(' OR ') +
    ')';
  const params = new Array(availableColumns.length).fill(like);

  return { clause, params };
}

function buildOrderByClause(columns) {
  for (const column of TITLE_PREFERRED_COLUMNS) {
    const actual = columns.get(column);
    if (actual) {
      return `ORDER BY (COALESCE(\`${actual}\`, '') = ''), \`${actual}\` ASC`;
    }
  }

  for (const column of FALLBACK_ORDER_COLUMNS) {
    const actual = columns.get(column);
    if (actual) {
      return `ORDER BY \`${actual}\` ASC`;
    }
  }

  return 'ORDER BY 1';
}

function parsePossibleJson(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return '';
  }

  const looksLikeJson =
    (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'));

  if (!looksLikeJson) {
    return trimmed;
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    return trimmed;
  }
}

function toNullableString(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const stringValue = String(value).trim();
  return stringValue.length > 0 ? stringValue : null;
}

function normalizeEndereco(value) {
  const parsed = parsePossibleJson(value);

  if (parsed === null || parsed === undefined) {
    return null;
  }

  if (typeof parsed === 'string') {
    const trimmed = parsed.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof parsed === 'object') {
    const formatted = ['formatted', 'formatado', 'address', 'logradouro']
      .map((key) => (typeof parsed[key] === 'string' ? parsed[key].trim() : ''))
      .find((value) => value.length > 0);

    if (formatted) {
      return formatted;
    }

    const fallback = Object.values(parsed)
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);

    if (fallback.length > 0) {
      return fallback.join(', ');
    }
  }

  const stringified = String(parsed).trim();
  return stringified.length > 0 ? stringified : null;
}

function normalizeMediaUrl(value) {
  const url = toNullableString(value);

  if (!url) {
    return null;
  }

  if (url.startsWith('//')) {
    return normalizeMediaUrl(`https:${url}`);
  }

  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  if (url.startsWith('/api/media?url=')) {
    return url;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'https:') {
        return `/api/media?url=${encodeURIComponent(parsed.toString())}`;
      }

      return null;
    } catch (error) {
      return url;
    }
  }

  if (url.startsWith('/')) {
    return url;
  }

  return `/${url}`;
}

function normalizeMediaList(value) {
  const parsed = parsePossibleJson(value);

  function collectCandidates(candidate) {
    if (candidate === null || candidate === undefined) {
      return [];
    }

    if (Array.isArray(candidate)) {
      return candidate.flatMap((item) => collectCandidates(item));
    }

    if (typeof candidate === 'string') {
      return candidate
        .split(/[;,\n]/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    if (typeof candidate === 'object') {

      const prioritizedKeys = ['url', 'src', 'imagem', 'image', 'foto', 'value'];

      for (const key of prioritizedKeys) {
        const valueForKey = candidate[key];
        if (typeof valueForKey === 'string' && valueForKey.trim().length > 0) {
          return collectCandidates(valueForKey);
        }
      }

      return Object.values(candidate).flatMap((item) => collectCandidates(item));
    }

    return [];
  }

  const normalized = collectCandidates(parsed)
    .map((item) => normalizeMediaUrl(item))
    .filter((item) => typeof item === 'string' && item.length > 0);

  return Array.from(new Set(normalized));
}

function createRowValueGetter(row = {}, columns = new Map()) {
  return (...candidates) => {
    for (const candidate of candidates) {
      if (!candidate) {
        continue;
      }

      const normalized = candidate.toLowerCase();
      const actual = columns.get(normalized) ?? candidate;

      if (actual in row && row[actual] != null) {
        return row[actual];
      }

      if (normalized !== actual && normalized in row && row[normalized] != null) {
        return row[normalized];
      }

      if (candidate in row && row[candidate] != null) {
        return row[candidate];
      }
    }

    return null;
  };
}

function mapCompanyRow(row = {}, columns = new Map()) {
  const getValue = createRowValueGetter(row, columns);



  const titulo = toNullableString(
    getValue('titulo', 'title', 'nome', 'name', 'razao_social', 'descricao', 'description', 'tagline')
  );

  const descricao = toNullableString(getValue('descricao', 'description', 'tagline'));
  const tituloDireto = toNullableString(getValue('titulo'));
  const tituloAlternativo = toNullableString(getValue('title', 'nome', 'name', 'razao_social'));
  let titulo = tituloDireto;

  if (!titulo || (descricao && titulo === descricao)) {
    titulo = tituloAlternativo ?? titulo;
  }

  if (!titulo) {
    titulo = descricao ?? toNullableString(getValue('description', 'tagline'));
  }

  const endereco = normalizeEndereco(getValue('endereco', 'address'));
  const celular = toNullableString(getValue('celular', 'telefone', 'phone', 'whatsapp'));
  const email = toNullableString(getValue('email'));
  const sala = toNullableString(getValue('sala', 'salao', 'room'));
  const logo = normalizeMediaUrl(getValue('logo', 'imagem', 'image'));
  const galeria = normalizeMediaList(
    getValue('galeria', 'galeria_urls', 'gallery', 'galeria_de_midia', 'media_gallery')
  );
  const midia = normalizeMediaList(getValue('midia', 'midia_urls', 'media'));

  const pkValue = getValue('pk');
  const id = toNullableString(getValue('id', 'slug', 'codigo', 'code'));
  const createdAt = toNullableString(getValue('created_at', 'createdAt'));
  const updatedAt = toNullableString(getValue('updated_at', 'updatedAt'));

  return {
    pk: pkValue != null ? Number(pkValue) : null,
    id,
    titulo,
    descricao,
    endereco,
    celular,
    email,
    sala,
    logo,
    galeria,
    midia,
    createdAt,
    updatedAt
  };
}

export function getCategoryBySlug(slug) {
  if (!slug) {
    return null;
  }

  const normalized = String(slug).toLowerCase();
  return categoriesBySlug.get(normalized) ?? null;
}

export async function listCategories() {
  const results = await Promise.all(
    CATEGORIES.map(async ({ slug, tabela, nome }) => {
      try {
        const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM \`${tabela}\``);
        const count = Number(rows?.[0]?.total ?? 0);
        return { slug, nome, count };
      } catch (error) {
        if (error?.code === 'ER_NO_SUCH_TABLE') {
          return { slug, nome, count: 0 };
        }

        throw error;
      }
    })
  );

  return results;
}

function sanitizePage(value, fallback) {
  const number = Number.parseInt(String(value), 10);
  if (!Number.isFinite(number) || number < 1) {
    return fallback;
  }

  return number;
}

function sanitizePageSize(value, fallback) {
  const number = Number.parseInt(String(value), 10);
  if (!Number.isFinite(number) || number < 1) {
    return fallback;
  }

  return Math.min(number, 50);
}

export async function listCompanies(tabela, { page = 1, pageSize = 12, q = '' } = {}) {
  const currentPage = sanitizePage(page, 1);
  const currentPageSize = sanitizePageSize(pageSize, 12);
  const offset = (currentPage - 1) * currentPageSize;
  const searchTerm = typeof q === 'string' ? q.trim() : '';

  const filters = [];
  const params = [];

  const columns = await getTableColumns(tabela);

  if (searchTerm) {
    const { clause, params: searchParams } = buildSearchClause(columns, searchTerm);
    if (clause) {
      filters.push(clause);
      params.push(...searchParams);
    }
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const orderBy = buildOrderByClause(columns);
  const querySql = `SELECT * FROM \`${tabela}\` ${whereClause} ${orderBy} LIMIT ? OFFSET ?`;
  const countSql = `SELECT COUNT(*) AS total FROM \`${tabela}\` ${whereClause}`;

  try {
    const [rows] = await pool.query(querySql, [...params, currentPageSize, offset]);
    const [countRows] = await pool.query(countSql, params);
    const total = Number(countRows?.[0]?.total ?? 0);

    return {
      page: currentPage,
      pageSize: currentPageSize,
      total,
      items: rows.map((row) => mapCompanyRow(row, columns))
    };
  } catch (error) {
    if (error?.code === 'ER_NO_SUCH_TABLE') {
      return {
        page: currentPage,
        pageSize: currentPageSize,
        total: 0,
        items: []
      };
    }

    throw error;
  }
}

export async function getCompany(tabela, id) {
  if (!id) {
    return null;
  }

  const identifier = String(id).trim();
  if (!identifier) {
    return null;
  }

  const columns = await getTableColumns(tabela);

  const [rows] = await pool.query(
    `SELECT * FROM \`${tabela}\` WHERE id = ? OR pk = ? LIMIT 1`,
    [identifier, identifier]
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return mapCompanyRow(rows[0], columns);
}

export const __internal = {
  buildOrderByClause,
  buildSearchClause,
  mapCompanyRow,
  clearTableColumnsCache() {
    TABLE_COLUMNS_CACHE.clear();
  }
};

