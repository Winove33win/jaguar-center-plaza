import { env } from '../config/env.js';
import { query } from '../database/pool.js';
import { ensureAbsoluteUrl, toArray } from '../utils/urls.js';

const DEFAULT_COLUMNS = [
  'id',
  'slug',
  'title',
  'summary',
  'description',
  'thumbnail',
  'gallery',
  'tags',
  'published_at',
  'updated_at',
  'status'
];

export async function listCases({ status = 'PUBLISHED' } = {}) {
  const where = [];
  const params = {};

  if (status) {
    where.push('status = :status');
    params.status = status;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await query(
    `SELECT ${DEFAULT_COLUMNS.join(', ')}
     FROM cases
     ${whereClause}
     ORDER BY published_at DESC, updated_at DESC`
  , params);

  return rows.map((row) => normalizeCase(row));
}

function normalizeCase(row) {
  const base = { ...row };
  const publicBaseUrl = env.publicBaseUrl;
  base.thumbnail = ensureAbsoluteUrl(base.thumbnail, publicBaseUrl);
  base.publishedAt = base.published_at || null;
  base.updatedAt = base.updated_at || null;

  if (Array.isArray(base.tags)) {
    base.tags = base.tags.map((tag) => String(tag));
  } else if (typeof base.tags === 'string') {
    base.tags = base.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  } else {
    base.tags = [];
  }

  const galleryItems = toArray(base.gallery).flatMap((item) => {
    if (!item) {
      return [];
    }

    if (typeof item === 'string') {
      try {
        const parsed = JSON.parse(item);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (error) {
        return [{ url: item }];
      }
    }

    if (typeof item === 'object') {
      return [item];
    }

    return [];
  });

  base.gallery = galleryItems.map((item) => ({
    url: ensureAbsoluteUrl(item.url || item.src, publicBaseUrl),
    alt: item.alt || ''
  }));

  delete base.published_at;
  delete base.updated_at;

  return base;
}
