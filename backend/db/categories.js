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

function normalizeEndereco(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') {
        const formatted = typeof parsed.formatted === 'string' ? parsed.formatted.trim() : null;
        if (formatted) {
          return { formatted };
        }
      }
    } catch (error) {
      // ignore JSON parse errors – fallback to plain text
    }

    return trimmed;
  }

  if (typeof value === 'object' && value !== null) {
    const formatted = typeof value.formatted === 'string' ? value.formatted.trim() : null;
    if (formatted) {
      return { formatted };
    }
  }

  return String(value);
}

function toNullableString(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const stringValue = String(value).trim();
  return stringValue.length > 0 ? stringValue : null;
}

function mapCompanyRow(row = {}) {
  const endereco = normalizeEndereco(row.endereco);
  const company = {
    pk: row.pk != null ? Number(row.pk) : null,
    id: toNullableString(row.id),
    titulo: toNullableString(row.titulo),
    descricao: toNullableString(row.descricao),
    endereco,
    celular: toNullableString(row.celular),
    email: toNullableString(row.email),
    sala: toNullableString(row.sala),
    logo: toNullableString(row.logo)
  };

  if (row.galeria !== undefined && row.galeria !== null) {
    company.galeria = String(row.galeria);
  }

  if (row.midia !== undefined && row.midia !== null) {
    company.midia = String(row.midia);
  }

  return company;
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

  const selectColumns = [
    "COALESCE(pk, 0) AS pk",
    "COALESCE(id, '') AS id",
    "COALESCE(titulo, '') AS titulo",
    "COALESCE(descricao, '') AS descricao",
    "COALESCE(endereco, '') AS endereco",
    "COALESCE(celular, '') AS celular",
    "COALESCE(email, '') AS email",
    "COALESCE(sala, '') AS sala",
    "COALESCE(logo, '') AS logo"
  ];

  const querySql =
    `SELECT ${selectColumns.join(', ')} FROM \`${tabela}\` ${whereClause} ORDER BY titulo ASC LIMIT ? OFFSET ?`;
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

