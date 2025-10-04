import { Router } from 'express';
import { listAreas } from '../repositories/areas-repository.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const items = await listAreas();
    res.json({ items, generatedAt: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});

export default router;
