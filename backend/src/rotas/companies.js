import { Router } from 'express';
import {
  CATEGORIES,
  getCategoryBySlug,
  getCompany,
  listCategories,
  listCompanies
} from '../../db/categories.js';

const router = Router();

function sendError(res, status, code, message) {
  return res.status(status).json({ error: message, code });
}

router.get('/categories', async (_req, res) => {
  try {
    const categories = await listCategories();
    return res.json(categories);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to list categories', error);
    return sendError(res, 500, 'CATEGORIES_FETCH_FAILED', 'Falha ao carregar categorias');
  }
});

router.get('/companies', async (req, res) => {
  const { categoria, page = '1', pageSize = '12', q = '' } = req.query;
  const category = getCategoryBySlug(categoria);

  if (!category) {
    return sendError(res, 404, 'CATEGORY_NOT_FOUND', 'Categoria não encontrada');
  }

  try {
    const result = await listCompanies(category.tabela, {
      page,
      pageSize,
      q
    });

    return res.json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to list companies', error);
    return sendError(res, 500, 'COMPANIES_FETCH_FAILED', 'Falha ao carregar empresas');
  }
});

router.get('/companies/:categoria/:id', async (req, res) => {
  const { categoria, id } = req.params;
  const category = getCategoryBySlug(categoria);

  if (!category) {
    return sendError(res, 404, 'CATEGORY_NOT_FOUND', 'Categoria não encontrada');
  }

  try {
    const company = await getCompany(category.tabela, id);

    if (!company) {
      return sendError(res, 404, 'COMPANY_NOT_FOUND', 'Empresa não encontrada');
    }

    return res.json(company);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load company', error);
    return sendError(res, 500, 'COMPANY_FETCH_FAILED', 'Falha ao carregar empresa');
  }
});

export { CATEGORIES };
export default router;

