import { Router } from 'express';
import { CATEGORIES, getCategoryBySlug, getCompany, listCompanies } from '../../db/categories.js';

const router = Router();

function sendError(res, status, code, message) {
  return res.status(status).json({ error: message, code });
}

router.get('/companies', async (req, res) => {
  const { category: categoryParam, categoria, page = '1', pageSize = '12', q = '' } = req.query;
  const slug = categoryParam || categoria;
  const category = getCategoryBySlug(slug);

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

router.get('/companies/:category/:id', async (req, res) => {
  const { category: categorySlug, id } = req.params;
  const category = getCategoryBySlug(categorySlug);

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

