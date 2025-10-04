import { Router } from 'express';
import { listBlogPosts, getBlogPostBySlug } from '../repositories/blog-posts-repository.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;
    const search = req.query.search ? String(req.query.search) : undefined;
    const status = req.query.status ? String(req.query.status) : 'PUBLISHED';
    const orderBy = req.query.orderBy ? String(req.query.orderBy) : undefined;
    const orderDirection = req.query.orderDirection ? String(req.query.orderDirection) : undefined;

    let tags = [];
    if (Array.isArray(req.query.tags)) {
      tags = req.query.tags.map((tag) => String(tag));
    } else if (typeof req.query.tags === 'string') {
      tags = req.query.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    const select = typeof req.query.select === 'string' ? req.query.select.split(',').map((item) => item.trim()) : undefined;

    const data = await listBlogPosts({
      page,
      perPage,
      search,
      tags,
      status,
      orderBy,
      orderDirection,
      select
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const post = await getBlogPostBySlug(req.params.slug);

    if (!post) {
      res.status(404).json({ error: 'NotFound', message: 'Post não encontrado' });
      return;
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
});

export default router;
