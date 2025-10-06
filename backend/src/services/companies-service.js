import {
  CATEGORIES as CATEGORY_LIST,
  getCategoryBySlug,
  getCompany,
  listCategories as listCategoriesDb,
  listCompanies as listCompaniesByTable
} from '../../db/categories.js';

export const CATEGORIES = CATEGORY_LIST.reduce((accumulator, category) => {
  // eslint-disable-next-line no-param-reassign
  accumulator[category.slug] = category.tabela;
  return accumulator;
}, {});

export function getCategoryTables() {
  return { ...CATEGORIES };
}

export async function listCompanies({ category, page = 1, pageSize = 12, q = '' }) {
  const foundCategory = getCategoryBySlug(category);

  if (!foundCategory) {
    const error = new Error(`Categoria inválida: ${category}`);
    error.code = 'INVALID_CATEGORY';
    throw error;
  }

  return listCompaniesByTable(foundCategory.tabela, { page, pageSize, q });
}

export async function getCompanyDetail({ category, id }) {
  const foundCategory = getCategoryBySlug(category);

  if (!foundCategory) {
    const error = new Error(`Categoria inválida: ${category}`);
    error.code = 'INVALID_CATEGORY';
    throw error;
  }

  return getCompany(foundCategory.tabela, id);
}

export async function countByCategory() {
  const categories = await listCategoriesDb();
  return categories.map(({ slug, count }) => ({ categoria: slug, total: count }));
}
