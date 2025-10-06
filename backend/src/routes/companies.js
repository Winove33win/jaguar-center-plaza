import { Router } from 'express';
import {
  CATEGORIES,
  getCompanyDetail,
  listCompanies
} from '../services/companies-service.js';

const router = Router();

function isValidCategory(slug) {
  return Boolean(CATEGORIES[String(slug || '').toLowerCase()]);
}

router.get('/companies', async (req, res) => {
  const { category, categoria, page = '1', pageSize = '12', q = '' } = req.query;
  const sourceCategory = typeof categoria === 'string' && categoria
    ? categoria
    : category;
  const normalizedCategory = typeof sourceCategory === 'string' ? sourceCategory.toLowerCase() : '';

  if (!normalizedCategory) {
    return res.status(400).json({ error: 'category is required' });
  }

  if (!isValidCategory(normalizedCategory)) {
    return res.status(400).json({ error: 'invalid category' });
  }

  try {
    const result = await listCompanies({
      category: normalizedCategory,
      page,
      pageSize,
      q
    });

    return res.json(result);
  } catch (error) {
    console.error('Failed to list companies', error);
    return res.status(500).json({ error: 'Failed to list companies' });
  }
});

router.get('/companies/:category/:id', async (req, res) => {
  const { category, id } = req.params;
  const normalizedCategory = String(category || '').toLowerCase();

  if (!isValidCategory(normalizedCategory)) {
    return res.status(400).json({ error: 'invalid category' });
  }

  try {
    const company = await getCompanyDetail({ category: normalizedCategory, id });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.json(company);
  } catch (error) {
    console.error('Failed to load company detail', error);
    return res.status(500).json({ error: 'Failed to load company detail' });
  }
});

export default router;
