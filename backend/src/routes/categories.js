import { Router } from 'express';
import { fetchCompanyCategories } from '../services/companies-service.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const payload = await fetchCompanyCategories();
    res.json(payload);
  } catch (error) {
    console.error('Failed to load categories', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

export default router;
