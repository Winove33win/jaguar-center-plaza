import { Router } from 'express';
import { CATEGORIES, countByCategory } from '../services/companies-service.js';

const router = Router();

function labelFromSlug(slug) {
  return slug
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

router.get('/', async (_req, res) => {
  try {
    const counts = await countByCategory();
    const totalBySlug = new Map(counts.map((item) => [item.categoria, Number(item.total) || 0]));

    const payload = Object.keys(CATEGORIES).map((slug) => ({
      slug,
      label: labelFromSlug(slug),
      total: totalBySlug.get(slug) ?? 0
    }));

    res.json(payload);
  } catch (error) {
    console.error('Failed to load categories', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

export default router;
