import express from 'express';

import pool from '../db/pool.js';
import { CATEGORIES, bySlug } from '../lib/categories.js';
import { pickCompanyFields } from '../lib/normalize.js';

const router = express.Router();
const knownCategoryTables = new Set(CATEGORIES.map((category) => category.table));
const columnCache = new Map();

function createColumnLookup(columns = []) {
  const lookup = new Map();
  columns.forEach((column) => {
    if (typeof column === 'string' && column.trim()) {
      lookup.set(column.toLowerCase(), column);
    }
  });
  return lookup;
}

function resolveColumn(columnLookup, name) {
  if (!name) {
    return null;
  }

  return columnLookup.get(String(name).toLowerCase()) || null;
}

async function getTableColumns(table) {
  if (!knownCategoryTables.has(table)) {
    return [];
  }

  if (columnCache.has(table)) {
    return columnCache.get(table);
  }

  const database = process.env.DB_NAME;
  if (!database) {
    columnCache.set(table, []);
    return [];
  }

  const [rows] = await pool.query(
    'SELECT column_name FROM information_schema.columns WHERE table_schema = ? AND table_name = ?',
    [database, table]
  );

  const columns = Array.isArray(rows)
    ? rows
        .map((row) => row.column_name || row.COLUMN_NAME)
        .filter((name) => typeof name === 'string' && name.length > 0)
    : [];

  columnCache.set(table, columns);
  return columns;
}

function buildSearchClause(columnLookup, searchTerm, params) {
  if (!searchTerm) {
    return '';
  }

  const likeValue = `%${searchTerm}%`;
  const searchColumns = [];

  const titleColumn = resolveColumn(columnLookup, 'titulo') || resolveColumn(columnLookup, 'title');
  if (titleColumn) {
    searchColumns.push(`\`${titleColumn}\` LIKE ?`);
    params.push(likeValue);
  }

  const nameColumn = resolveColumn(columnLookup, 'nome');
  if (nameColumn && nameColumn !== titleColumn) {
    searchColumns.push(`\`${nameColumn}\` LIKE ?`);
    params.push(likeValue);
  }

  const descriptionColumn =
    resolveColumn(columnLookup, 'descricao') || resolveColumn(columnLookup, 'descricao_curta') || resolveColumn(columnLookup, 'description');

  if (descriptionColumn) {
    searchColumns.push(`\`${descriptionColumn}\` LIKE ?`);
    params.push(likeValue);
  }

  if (searchColumns.length === 0) {
    params.length = 0;
    return '';
  }

  return `(${searchColumns.join(' OR ')})`;
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

function buildPublicationFilters(categoryInfo, columnLookup, params) {
  const filters = [];

  const statusColumn = resolveColumn(columnLookup, categoryInfo.statusColumn);
  if (statusColumn) {
    filters.push(`\`${statusColumn}\` = ?`);
    params.push('PUBLISHED');
  }

  const publishDateColumn = resolveColumn(columnLookup, categoryInfo.publishDateColumn);
  if (publishDateColumn) {
    filters.push(
      `(\`${publishDateColumn}\` IS NULL OR \`${publishDateColumn}\` <= UTC_TIMESTAMP())`
    );
  }

  const unpublishDateColumn = resolveColumn(columnLookup, categoryInfo.unpublishDateColumn);
  if (unpublishDateColumn) {
    filters.push(
      `(\`${unpublishDateColumn}\` IS NULL OR \`${unpublishDateColumn}\` > UTC_TIMESTAMP())`
    );
  }

  return filters;
}

function normalizePage(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

router.get('/companies', async (req, res) => {
  const { category, page = '1', pageSize = '12', q } = req.query;

  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'category is required' });
  }

  const categoryInfo = bySlug[category];

  if (!categoryInfo) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    const columns = await getTableColumns(categoryInfo.table);

    if (!columns.length) {
      return res.status(404).json({ error: 'Category data not available' });
    }

    const columnLookup = createColumnLookup(columns);

    const pageNumber = normalizePage(page, 1);
    const size = Math.min(normalizePage(pageSize, 12), 100);
    const offset = (pageNumber - 1) * size;

    const searchTerm = typeof q === 'string' ? q.trim() : '';
    const searchParams = [];
    const filters = [];

    const searchClause = buildSearchClause(columnLookup, searchTerm, searchParams);
    if (searchClause) {
      filters.push(searchClause);
    }

    const whereParams = [...searchParams];
    const publicationFilters = buildPublicationFilters(categoryInfo, columnLookup, whereParams);
    if (publicationFilters.length) {
      filters.push(...publicationFilters);
    }

    const filtersSql = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM \`${categoryInfo.table}\` ${filtersSql}`,
      whereParams
    );

    const total = Number(countRows?.[0]?.total ?? countRows?.[0]?.c ?? 0);
    const orderClause = resolveOrderClause(columnLookup);

    const [rows] = await pool.query(
      `SELECT * FROM \`${categoryInfo.table}\` ${filtersSql} ${orderClause} LIMIT ? OFFSET ?`,
      [...whereParams, size, offset]
    );

    const items = Array.isArray(rows)
      ? rows.map((row, index) => {
          const normalized = pickCompanyFields(
            row,
            categoryInfo.slug,
            categoryInfo.table,
            offset + index
          );

          return {
            id: normalized.id,
            slug: normalized.slug,
            category: normalized.category,
            name: normalized.name,
            description: normalized.description,
            shortDescription: normalized.shortDescription,
            logo: normalized.logo,
            coverImage: normalized.coverImage,
            address: normalized.address,
            room: normalized.room,
            phone: normalized.phone,
            phones: normalized.phones,
            email: normalized.email,
            emails: normalized.emails,
            whatsapp: normalized.whatsapp,
            instagram: normalized.instagram,
            facebook: normalized.facebook,
            website: normalized.website,
            detailPath: normalized.detailPath,
            listPath: normalized.listPath,
            highlight: normalized.highlight,
          };
        })
      : [];

    res.json({ page: pageNumber, pageSize: size, total, items });
  } catch (error) {
    console.error('Failed to list companies', error);
    res.status(500).json({ error: 'Failed to list companies' });
  }
});

router.get('/companies/:category/:id', async (req, res) => {
  const { category, id } = req.params;

  const categoryInfo = bySlug[category];

  if (!categoryInfo) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    const columns = await getTableColumns(categoryInfo.table);

    if (!columns.length) {
      return res.status(404).json({ error: 'Category data not available' });
    }

    const columnLookup = createColumnLookup(columns);
    const params = [];
    const filters = buildPublicationFilters(categoryInfo, columnLookup, params);
    const filtersSql = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const orderClause = resolveOrderClause(columnLookup);

    const [rows] = await pool.query(
      `SELECT * FROM \`${categoryInfo.table}\` ${filtersSql} ${orderClause} LIMIT 500`,
      params
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const normalizedRows = rows.map((row, index) =>
      pickCompanyFields(row, categoryInfo.slug, categoryInfo.table, index)
    );

    const target = String(id).toLowerCase();
    const match = normalizedRows.find((company) => {
      const companyId = company.id ? String(company.id).toLowerCase() : null;
      const companySlug = company.slug ? String(company.slug).toLowerCase() : null;
      return companyId === target || companySlug === target;
    });

    if (!match) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(match);
  } catch (error) {
    console.error('Failed to fetch company details', error);
    res.status(500).json({ error: 'Failed to fetch company details' });
  }
});

export default router;
