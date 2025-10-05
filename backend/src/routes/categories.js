import { Router } from 'express';
import { fetchCompanyCategories } from '../services/companies-service.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const payload = await fetchCompanyCategories();
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
