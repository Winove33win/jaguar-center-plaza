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

function mapCompanyRow(row = {}) {
  const titulo = toNullableString(row.titulo ?? row.nome ?? row.name);
  const descricao = toNullableString(row.descricao ?? row.description ?? row.tagline);
  const endereco = normalizeEndereco(row.endereco);
  const celular = toNullableString(row.celular ?? row.telefone ?? row.phone ?? row.whatsapp);
  const email = toNullableString(row.email);
  const sala = toNullableString(row.sala ?? row.salao ?? row.room);
  const logo = normalizeMediaUrl(row.logo ?? row.imagem ?? row.image);
  const galeria = normalizeMediaList(
    row.galeria ?? row.galeria_urls ?? row.gallery ?? row.galeria_de_midia ?? row.media_gallery
  );
  const midia = normalizeMediaList(row.midia ?? row.midia_urls ?? row.media);

  return {
    pk: row.pk != null ? Number(row.pk) : null,
    id: toNullableString(row.id ?? row.slug ?? row.codigo ?? row.code),
    titulo,
    descricao,
    endereco,
    celular,
    email,
    sala,
    logo,
    galeria,
    midia,
    createdAt: toNullableString(row.created_at ?? row.createdAt),
    updatedAt: toNullableString(row.updated_at ?? row.updatedAt)
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

  if (searchTerm) {
    const like = `%${searchTerm}%`;
    filters.push(
      "(" +
        "COALESCE(titulo, '') LIKE ? OR " +
        "COALESCE(descricao, '') LIKE ? OR " +
        "COALESCE(email, '') LIKE ?" +
      ")"
    );
    params.push(like, like, like);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const orderBy = "ORDER BY COALESCE(titulo, '') <> '', titulo ASC";
  const querySql = `SELECT * FROM \`${tabela}\` ${whereClause} ${orderBy} LIMIT ? OFFSET ?`;
  const countSql = `SELECT COUNT(*) AS total FROM \`${tabela}\` ${whereClause}`;

  const [rows] = await pool.query(querySql, [...params, currentPageSize, offset]);
  const [countRows] = await pool.query(countSql, params);
  const total = Number(countRows?.[0]?.total ?? 0);

  return {
    page: currentPage,
    pageSize: currentPageSize,
    total,
    items: rows.map((row) => mapCompanyRow(row))
  };
}

export async function getCompany(tabela, id) {
  if (!id) {
    return null;
  }

  const identifier = String(id).trim();
  if (!identifier) {
    return null;
  }

  const [rows] = await pool.query(
    `SELECT * FROM \`${tabela}\` WHERE id = ? OR pk = ? LIMIT 1`,
    [identifier, identifier]
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return mapCompanyRow(rows[0]);
}

