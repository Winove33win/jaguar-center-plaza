import { COMPANY_CATEGORIES } from '../config/company-categories.js';
import { query } from '../database/pool.js';
import { buildPublicationStatusClause } from '../utils/publication-status.js';
import { extractLatestDate, normalizeCompanyRow } from './company-normalizer.js';

async function fetchRowsForCategory(config) {
  const conditions = [];

  if (config.statusColumn) {
    conditions.push(buildPublicationStatusClause(config.statusColumn));
  }

  if (config.publishDateColumn) {
    conditions.push(`(\`${config.publishDateColumn}\` IS NULL OR \`${config.publishDateColumn}\` <= UTC_TIMESTAMP())`);
  }

  if (config.unpublishDateColumn) {
    conditions.push(`(\`${config.unpublishDateColumn}\` IS NULL OR \`${config.unpublishDateColumn}\` > UTC_TIMESTAMP())`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const tableName = config.table || config.id;
  const sql = `SELECT * FROM \`${tableName}\` ${whereClause} LIMIT 500`;

  try {
    const rows = await query(sql);
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error(`Falha ao consultar a tabela ${tableName}`, error);
    throw error;
  }
}

export async function fetchCompanyCategories() {
  const categories = [];
  const categoryDates = [];

  for (const category of COMPANY_CATEGORIES) {
    const rows = await fetchRowsForCategory(category);
    const companies = rows.map((row, index) => normalizeCompanyRow(category.id, row, index));
    const latestUpdate = extractLatestDate(rows);

    if (latestUpdate) {
      categoryDates.push(latestUpdate);
    }

    categories.push({
      id: category.id,
      slug: category.id,
      name: category.name,
      description: category.description,
      companies,
      generatedAt: latestUpdate || null
    });
  }

  categoryDates.sort();
  const generatedAt = categoryDates.length ? categoryDates[categoryDates.length - 1] : new Date().toISOString();

  return { categories, generatedAt };
}

export const __test__ = {
  normalizeCompanyRow,
  extractLatestDate
};
