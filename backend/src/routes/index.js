import { Router } from 'express';
import areasRouter from './areas.js';
import blogPostsRouter from './blog-posts.js';
import casesRouter from './cases.js';
import categoriesRouter from './categories.js';
import checkoutRouter from './checkout.js';
import leadsRouter from './leads.js';
import templatesRouter from './templates.js';

const router = Router();

router.use('/areas', areasRouter);
router.use('/blog-posts', blogPostsRouter);
router.use('/cases', casesRouter);
router.use('/templates', templatesRouter);
router.use('/categories', categoriesRouter);
router.use('/leads', leadsRouter);
router.use('/checkout', checkoutRouter);

router.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

export default router;

