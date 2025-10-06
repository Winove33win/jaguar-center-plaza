import { query } from '../../db/pool.js';
import { pickCompanyFields } from '../../lib/normalize.js';

export const CATEGORIES = {
  administracao: 'administracao',
  advocacia: 'advocacia',
  beleza: 'beleza',
  contabilidade: 'contabilidade',
  imobiliaria: 'imobiliaria',
  industrias: 'industrias',
  lojas: 'lojas',
  saude: 'saude',
  servicos_publicos: 'servicos_publicos'
};

export function getCategoryTables() {
  return { ...CATEGORIES };
}

function ensureValidCategory(category) {
  const normalized = String(category || '').toLowerCase();
  const table = CATEGORIES[normalized];

  if (!table) {
    const error = new Error(`Categoria inválida: ${category}`);
    error.code = 'INVALID_CATEGORY';
    throw error;
  }

  return { slug: normalized, table };
}

function sanitizePage(value, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function sanitizePageSize(value, fallback) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number) || number <= 0) {
    return fallback;
  }

  return Math.min(number, 50);
}

export async function listCompanies({ category, page = 1, pageSize = 12, q = '' }) {
  const { table } = ensureValidCategory(category);
  const currentPage = sanitizePage(page, 1);
  const currentPageSize = sanitizePageSize(pageSize, 12);
  const offset = (currentPage - 1) * currentPageSize;
  const searchTerm = typeof q === 'string' ? q.trim() : '';

  const filters = [];
  const params = [];

  if (searchTerm) {
    filters.push('(' +
      'COALESCE(titulo, \'\') LIKE ? OR ' +
      'COALESCE(descricao, \'\') LIKE ?' +
    ')');
    const like = `%${searchTerm}%`;
    params.push(like, like);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const orderClause = 'ORDER BY created_date DESC, id DESC';

  const sql = `SELECT * FROM \`${table}\` ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
  const countSql = `SELECT COUNT(*) AS total FROM \`${table}\` ${whereClause}`;

  const rows = await query(sql, [...params, currentPageSize, offset]);
  const countRows = await query(countSql, params);
  const total = Number(countRows?.[0]?.total ?? 0);

  return {
    items: pickCompanyFields(rows),
    page: currentPage,
    pageSize: currentPageSize,
    total
  };
}

export async function getCompanyDetail({ category, id }) {
  const { table } = ensureValidCategory(category);
  const identifier = String(id);

  const rows = await query(
    `SELECT * FROM \`${table}\` WHERE id = ? OR pk = ? LIMIT 1`,
    [identifier, identifier]
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return pickCompanyFields(rows)[0] ?? null;
}

export async function countByCategory() {
  const tables = getCategoryTables();
  const entries = Object.entries(tables);

  const results = await Promise.all(
    entries.map(async ([slug, table]) => {
      const rows = await query(`SELECT COUNT(*) AS total FROM \`${table}\``);
      const total = Number(rows?.[0]?.total ?? 0);
      return { categoria: slug, total };
    })
  );

  return results;
}
