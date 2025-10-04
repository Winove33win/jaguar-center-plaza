import { env } from '../config/env.js';
import { query } from '../database/pool.js';
import { ensureAbsoluteUrl } from '../utils/urls.js';

const SUMMARY_COLUMNS = [
  'id',
  'slug',
  'title',
  'excerpt',
  'cover_image',
  'published_at',
  'updated_at',
  'tags',
  'status'
];

const DETAIL_COLUMNS = [...SUMMARY_COLUMNS, 'content'];

const ALLOWED_SORTS = new Map([
  ['published_at', 'published_at'],
  ['updated_at', 'updated_at'],
  ['created_at', 'created_at'],
  ['title', 'title']
]);

function sanitizeColumns(columns = []) {
  if (!Array.isArray(columns) || columns.length === 0) {
    return SUMMARY_COLUMNS;
  }

  const result = [];
  for (const column of columns) {
    if (DETAIL_COLUMNS.includes(column)) {
      result.push(column);
    }
  }

  return result.length > 0 ? result : SUMMARY_COLUMNS;
}

function sanitizeOrderBy(orderBy) {
  if (!orderBy) {
    return 'published_at';
  }

  return ALLOWED_SORTS.get(orderBy) || 'published_at';
}

function sanitizeDirection(direction) {
  if (!direction) {
    return 'DESC';
  }

  const normalized = String(direction).toUpperCase();
  return normalized === 'ASC' ? 'ASC' : 'DESC';
}

export async function listBlogPosts({
  page = 1,
  perPage = 10,
  search,
  tags = [],
  status = 'PUBLISHED',
  orderBy,
  orderDirection,
  select
} = {}) {
  const sanitizedColumns = sanitizeColumns(select);
  const safeOrderBy = sanitizeOrderBy(orderBy);
  const safeDirection = sanitizeDirection(orderDirection);

  const limit = Math.max(1, Math.min(Number(perPage) || 10, 100));
  const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;

  const where = [];
  const params = {};

  if (status) {
    where.push('status = :status');
    params.status = status;
  }

  if (search) {
    where.push('(title LIKE :search OR excerpt LIKE :search OR content LIKE :search)');
    params.search = `%${search}%`;
  }

  if (tags && tags.length > 0) {
    where.push('JSON_OVERLAPS(COALESCE(tags, JSON_ARRAY()), CAST(:tags AS JSON))');
    params.tags = JSON.stringify(tags);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const columns = sanitizedColumns.map((column) => `bp.${column}`).join(', ');

  const items = await query(
    `SELECT ${columns}
     FROM blog_posts bp
     ${whereClause}
     ORDER BY bp.${safeOrderBy} ${safeDirection}
     LIMIT :limit OFFSET :offset`,
    { ...params, limit, offset }
  );

  const [{ total }] = await query(
    `SELECT COUNT(*) AS total
     FROM blog_posts bp
     ${whereClause}`,
    params
  );

  return {
    items: items.map((item) => normalizeBlogPost(item)),
    pagination: {
      page: Math.max(Number(page) || 1, 1),
      perPage: limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
}

export async function getBlogPostBySlug(slug) {
  if (!slug) {
    return null;
  }

  const [row] = await query(
    `SELECT ${DETAIL_COLUMNS.join(', ')}
     FROM blog_posts
     WHERE slug = :slug
     LIMIT 1`,
    { slug }
  );

  return row ? normalizeBlogPost(row) : null;
}

function normalizeBlogPost(row) {
  const base = { ...row };
  const publicBaseUrl = env.publicBaseUrl;
  if (base.cover_image) {
    base.coverImage = ensureAbsoluteUrl(base.cover_image, publicBaseUrl);
  }

  if (Array.isArray(base.tags)) {
    base.tags = base.tags.map((tag) => String(tag));
  } else if (typeof base.tags === 'string') {
    try {
      const parsed = JSON.parse(base.tags);
      base.tags = Array.isArray(parsed) ? parsed.map((tag) => String(tag)) : [];
    } catch (error) {
      base.tags = base.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    }
  } else {
    base.tags = [];
  }

  base.coverImage = base.coverImage || ensureAbsoluteUrl(base.cover_image, publicBaseUrl);
  base.publishedAt = base.published_at || null;
  base.updatedAt = base.updated_at || null;

  delete base.cover_image;
  delete base.published_at;
  delete base.updated_at;

  return base;
}
