import { Router } from 'express';
import { listCases } from '../repositories/cases-repository.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const status = req.query.status ? String(req.query.status) : 'PUBLISHED';
    const cases = await listCases({ status });
    res.json({ items: cases });
  } catch (error) {
    next(error);
  }
});

export default router;
