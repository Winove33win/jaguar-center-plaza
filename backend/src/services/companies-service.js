import { CATEGORIES, bySlug } from '../../lib/categories.js';
import { pickCompanyFields } from '../../lib/normalize.js';
import { env } from '../config/env.js';
import { query } from '../database/pool.js';
import { buildPublicationStatusClause } from '../utils/publication-status.js';
import { extractLatestDate, normalizeCompanyRow } from './company-normalizer.js';

const FALLBACK_COLUMNS = null;
const columnCache = new Map();
const STATUS_VALUES = new Set([
  'published',
  'publicado',
  'publicada',
  'active',
  'ativo',
  'ativa',
  '1',
  'true',
  'sim',
  'yes'
]);

function ensureCategory(slug) {
  const normalizedSlug = String(slug || '').toLowerCase();
  const category = bySlug[normalizedSlug];

  if (!category) {
    const error = new Error(`Category ${slug} not found`);
    error.code = 'CATEGORY_NOT_FOUND';
    throw error;
  }

  return category;
}

function getTableName(category) {
  return category.table || category.id;
}

async function getTableColumns(category) {
  const tableName = getTableName(category);
  if (columnCache.has(tableName)) {
    return columnCache.get(tableName);
  }

  const database = env.database.name;
  if (!database) {
    columnCache.set(tableName, FALLBACK_COLUMNS);
    return FALLBACK_COLUMNS;
  }

  try {
    const rows = await query(
      'SELECT column_name FROM information_schema.columns WHERE table_schema = :schema AND table_name = :table',
      { schema: database, table: tableName }
    );

    const columns = Array.isArray(rows)
      ? rows
          .map((row) => row.column_name || row.COLUMN_NAME)
          .filter((name) => typeof name === 'string' && name.length > 0)
      : [];

    columnCache.set(tableName, columns);
    return columns;
  } catch (error) {
    console.warn(`Unable to inspect columns for table ${tableName}`, error);
    columnCache.set(tableName, FALLBACK_COLUMNS);
    return FALLBACK_COLUMNS;
  }
}

function createColumnLookup(columns = []) {
  const lookup = new Map();
  columns.forEach((column) => {
    if (typeof column === 'string' && column.trim()) {
      lookup.set(column.toLowerCase(), column);
    }
  });
  return lookup;
}

function resolveColumn(columnLookup, ...candidates) {
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const normalized = String(candidate).toLowerCase();
    if (columnLookup.has(normalized)) {
      return columnLookup.get(normalized);
    }
  }

  return null;
}

function buildSearchClause(columnLookup, searchTerm) {
  if (!searchTerm) {
    return { clause: '', params: {} };
  }

  const likeValue = `%${searchTerm}%`;
  const clauses = [];
  const params = {};
  let index = 0;

  const addClause = (column) => {
    if (!column) {
      return;
    }

    index += 1;
    const key = `search${index}`;
    clauses.push(`\`${column}\` LIKE :${key}`);
    params[key] = likeValue;
  };

  addClause(resolveColumn(columnLookup, 'titulo', 'title'));
  addClause(resolveColumn(columnLookup, 'nome', 'name'));
  addClause(resolveColumn(columnLookup, 'descricao', 'descricao_curta', 'description'));
  addClause(resolveColumn(columnLookup, 'endereco', 'address'));

  if (clauses.length === 0) {
    return { clause: '', params: {} };
  }

  return { clause: `(${clauses.join(' OR ')})`, params };
}

function resolveOrderClause(columnLookup) {
  const updatedDateColumn = resolveColumn(columnLookup, 'updated_date');
  if (updatedDateColumn) {
    return `ORDER BY \`${updatedDateColumn}\` IS NULL, \`${updatedDateColumn}\` DESC`;
  }

  const updatedAtColumn = resolveColumn(columnLookup, 'updated_at');
  if (updatedAtColumn) {
    return `ORDER BY \`${updatedAtColumn}\` IS NULL, \`${updatedAtColumn}\` DESC`;
  }

  const createdDateColumn = resolveColumn(columnLookup, 'created_date');
  if (createdDateColumn) {
    return `ORDER BY \`${createdDateColumn}\` IS NULL, \`${createdDateColumn}\` DESC`;
  }

  const createdAtColumn = resolveColumn(columnLookup, 'created_at');
  if (createdAtColumn) {
    return `ORDER BY \`${createdAtColumn}\` IS NULL, \`${createdAtColumn}\` DESC`;
  }

  return '';
}

function buildPublicationFilters(category, columnLookup) {
  const filters = [];

  const statusColumn = resolveColumn(columnLookup, category.statusColumn);
  const statusClause = buildPublicationStatusClause(statusColumn);
  if (statusClause) {
    filters.push(statusClause);
  }

  const publishDateColumn = resolveColumn(columnLookup, category.publishDateColumn);
  if (publishDateColumn) {
    filters.push(`(\`${publishDateColumn}\` IS NULL OR \`${publishDateColumn}\` <= UTC_TIMESTAMP())`);
  }

  const unpublishDateColumn = resolveColumn(columnLookup, category.unpublishDateColumn);
  if (unpublishDateColumn) {
    filters.push(`(\`${unpublishDateColumn}\` IS NULL OR \`${unpublishDateColumn}\` > UTC_TIMESTAMP())`);
  }

  return filters;
}

function mapRowsToCompanies(rows, category, startIndex = 0) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  return rows.map((row, index) =>
    pickCompanyFields(row, category.slug, category.table, startIndex + index)
  );
}

function getRowValue(row, ...candidates) {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const lookup = new Map();
  for (const key of Object.keys(row)) {
    lookup.set(key.toLowerCase(), key);
  }

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const actualKey = lookup.get(String(candidate).toLowerCase());
    if (actualKey) {
      return row[actualKey];
    }
  }

  return null;
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isRowPublished(row, category) {
  const statusValue = getRowValue(row, category.statusColumn, 'status', 'status_col');
  if (statusValue !== null && statusValue !== undefined) {
    const normalized = String(statusValue).trim().toLowerCase();
    if (normalized && !STATUS_VALUES.has(normalized)) {
      return false;
    }
  }

  const publishDateValue = getRowValue(row, category.publishDateColumn, 'publish_date', 'publish_at');
  const publishDate = parseDate(publishDateValue);
  if (publishDate && publishDate.getTime() > Date.now()) {
    return false;
  }

  const unpublishDateValue = getRowValue(row, category.unpublishDateColumn, 'unpublish_date', 'unpublish_at');
  const unpublishDate = parseDate(unpublishDateValue);
  if (unpublishDate && unpublishDate.getTime() <= Date.now()) {
    return false;
  }

  return true;
}

function matchesSearch(company, term) {
  if (!term) {
    return true;
  }

  const normalizedTerm = term.toLowerCase();
  const fields = [
    company.name,
    company.shortDescription,
    company.description,
    company.address,
    company.room
  ];

  return fields.some((field) => typeof field === 'string' && field.toLowerCase().includes(normalizedTerm));
}

function normalizePage(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

async function fetchListWithColumns(category, options) {
  const columns = await getTableColumns(category);

  if (Array.isArray(columns) && columns.length > 0) {
    const columnLookup = createColumnLookup(columns);
    const page = normalizePage(options.page, 1);
    const size = Math.min(normalizePage(options.pageSize, 12), 100);
    const offset = (page - 1) * size;
    const searchTerm = options.search ? options.search.trim() : '';

    const { clause: searchClause, params: searchParams } = buildSearchClause(columnLookup, searchTerm);
    const filters = [];
    if (searchClause) {
      filters.push(searchClause);
    }

    const publicationFilters = buildPublicationFilters(category, columnLookup);
    if (publicationFilters.length) {
      filters.push(...publicationFilters);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const baseParams = { ...searchParams };

    const countRows = await query(
      `SELECT COUNT(*) AS total FROM \`${getTableName(category)}\` ${whereClause}`,
      baseParams
    );

    const total = Number(countRows?.[0]?.total ?? countRows?.[0]?.c ?? 0);
    const orderClause = resolveOrderClause(columnLookup);

    const rows = await query(
      `SELECT * FROM \`${getTableName(category)}\` ${whereClause} ${orderClause} LIMIT :limit OFFSET :offset`,
      { ...baseParams, limit: size, offset }
    );

    const items = mapRowsToCompanies(rows, category, offset);
    return { page, pageSize: size, total, items };
  }

  const page = normalizePage(options.page, 1);
  const size = Math.min(normalizePage(options.pageSize, 12), 100);
  const offset = (page - 1) * size;
  const searchTerm = options.search ? options.search.trim().toLowerCase() : '';

  const rows = await query(`SELECT * FROM \`${getTableName(category)}\``);
  const publishedRows = rows.filter((row) => isRowPublished(row, category));
  const normalizedRows = mapRowsToCompanies(publishedRows, category);

  const filtered = searchTerm
    ? normalizedRows.filter((company) => matchesSearch(company, searchTerm))
    : normalizedRows;

  const total = filtered.length;
  const items = filtered.slice(offset, offset + size);

  return { page, pageSize: size, total, items };
}

async function fetchCompaniesArray(category) {
  const columns = await getTableColumns(category);

  if (Array.isArray(columns) && columns.length > 0) {
    const columnLookup = createColumnLookup(columns);
    const filters = buildPublicationFilters(category, columnLookup);
    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const orderClause = resolveOrderClause(columnLookup);

    const rows = await query(
      `SELECT * FROM \`${getTableName(category)}\` ${whereClause} ${orderClause} LIMIT :limit`,
      { limit: 500 }
    );

    return { rows, normalized: mapRowsToCompanies(rows, category) };
  }

  const rows = await query(`SELECT * FROM \`${getTableName(category)}\` LIMIT :limit`, { limit: 500 });
  const filteredRows = rows.filter((row) => isRowPublished(row, category));
  const normalized = mapRowsToCompanies(filteredRows, category);

  return { rows: filteredRows, normalized };
}

export async function fetchCompanyList(categorySlug, options = {}) {
  const category = ensureCategory(categorySlug);
  const page = normalizePage(options.page ?? 1, 1);
  const pageSize = normalizePage(options.pageSize ?? 12, 12);
  const search = typeof options.search === 'string' ? options.search : '';

  return fetchListWithColumns(category, { page, pageSize, search });
}

export async function fetchCompaniesForCategory(categorySlug) {
  const category = ensureCategory(categorySlug);
  const { normalized } = await fetchCompaniesArray(category);
  return normalized;
}

export async function fetchCompanyDetail(categorySlug, identifier) {
  const category = ensureCategory(categorySlug);
  const searchValue = String(identifier || '').toLowerCase();

  if (!searchValue) {
    return null;
  }

  const { normalized } = await fetchCompaniesArray(category);

  const match = normalized.find((company) => {
    const id = company.id ? String(company.id).toLowerCase() : null;
    const slug = company.slug ? String(company.slug).toLowerCase() : null;
    return id === searchValue || slug === searchValue;
  });

  return match ?? null;
}

export async function fetchCompanyCategories() {
  const categories = [];
  const categoryDates = [];

  for (const category of CATEGORIES) {
    const { rows, normalized } = await fetchCompaniesArray(category);
    const latestUpdate = extractLatestDate(rows);

    if (latestUpdate) {
      categoryDates.push(latestUpdate);
    }

    categories.push({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      companies: normalized,
      generatedAt: latestUpdate || null
    });
  }

  categoryDates.sort();
  const generatedAt =
    categoryDates.length > 0
      ? categoryDates[categoryDates.length - 1]
      : new Date().toISOString();

  return { categories, generatedAt };
}

export const __test__ = {
  normalizeCompanyRow,
  extractLatestDate,
  clearColumnCache: () => columnCache.clear()
};
