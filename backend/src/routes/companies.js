import { Router } from 'express';
import {
  fetchCompaniesForCategory,
  fetchCompanyDetail,
  fetchCompanyList
} from '../services/companies-service.js';

const router = Router();

router.get('/companies', async (req, res) => {
  const { category, page = '1', pageSize = '12', q } = req.query;

  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'category is required' });
  }

  try {
    const result = await fetchCompanyList(category, {
      page: Number.parseInt(String(page), 10) || 1,
      pageSize: Number.parseInt(String(pageSize), 10) || 12,
      search: typeof q === 'string' ? q.trim() : ''
    });

    return res.json(result);
  } catch (error) {
    if (error?.code === 'CATEGORY_NOT_FOUND') {
      return res.status(404).json({ error: 'Category not found' });
    }

    console.error('Failed to list companies', error);
    return res.status(500).json({ error: 'Failed to list companies' });
  }
});

router.get('/companies/:categorySlug/:identifier', async (req, res) => {
  const { categorySlug, identifier } = req.params;

  try {
    const company = await fetchCompanyDetail(categorySlug, identifier);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.json(company);
  } catch (error) {
    if (error?.code === 'CATEGORY_NOT_FOUND') {
      return res.status(404).json({ error: 'Category not found' });
    }

    console.error('Failed to fetch company details', error);
    return res.status(500).json({ error: 'Failed to fetch company details' });
  }
});

router.get('/:categorySlug', async (req, res) => {
  const { categorySlug } = req.params;

  try {
    const companies = await fetchCompaniesForCategory(categorySlug);
    return res.json(companies);
  } catch (error) {
    if (error?.code === 'CATEGORY_NOT_FOUND') {
      return res.status(404).json({ error: 'Category not found' });
    }

    console.error(`Failed to list companies for category ${categorySlug}`, error);
    return res.status(500).json({ error: 'Failed to list companies' });
  }
});

export default router;
