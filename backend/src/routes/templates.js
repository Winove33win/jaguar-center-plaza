import { Router } from 'express';
import { listTemplates, getTemplateBySlug } from '../repositories/templates-repository.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const status = req.query.status ? String(req.query.status) : 'PUBLISHED';
    const items = await listTemplates({ status });
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const template = await getTemplateBySlug(req.params.slug);

    if (!template) {
      res.status(404).json({ error: 'NotFound', message: 'Template não encontrado' });
      return;
    }

    res.json(template);
  } catch (error) {
    next(error);
  }
});

export default router;
