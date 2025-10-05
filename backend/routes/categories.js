import express from 'express';

import { fetchCompanyCategories } from '../src/services/companies-service.js';

const router = express.Router();

router.get('/categories', async (_req, res) => {
  try {
    const payload = await fetchCompanyCategories();
    res.json(payload);
  } catch (error) {
    console.error('Failed to load categories', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

export default router;
