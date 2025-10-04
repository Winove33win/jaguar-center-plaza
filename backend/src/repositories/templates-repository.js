import { env } from '../config/env.js';
import { query } from '../database/pool.js';
import { ensureAbsoluteUrl } from '../utils/urls.js';

const BASE_COLUMNS = [
  'id',
  'slug',
  'name',
  'description',
  'category',
  'price',
  'currency',
  'thumbnail',
  'metadata',
  'config',
  'published_at',
  'updated_at',
  'status'
];

export async function listTemplates({ status = 'PUBLISHED' } = {}) {
  const where = [];
  const params = {};

  if (status) {
    where.push('status = :status');
    params.status = status;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await query(
    `SELECT ${BASE_COLUMNS.join(', ')}
     FROM templates
     ${whereClause}
     ORDER BY published_at DESC, updated_at DESC`,
    params
  );

  return rows.map((row) => normalizeTemplate(row));
}

export async function getTemplateBySlug(slug) {
  if (!slug) {
    return null;
  }

  const [row] = await query(
    `SELECT ${BASE_COLUMNS.join(', ')}
     FROM templates
     WHERE slug = :slug
     LIMIT 1`,
    { slug }
  );

  return row ? normalizeTemplate(row) : null;
}

function normalizeTemplate(row) {
  const base = { ...row };
  const publicBaseUrl = env.publicBaseUrl;

  base.thumbnail = ensureAbsoluteUrl(base.thumbnail, publicBaseUrl);
  base.publishedAt = base.published_at || null;
  base.updatedAt = base.updated_at || null;

  base.features = extractFeatures(base.metadata);
  base.metadata = buildMetadata(base.metadata);
  base.config = buildConfig(base.config, publicBaseUrl);

  delete base.published_at;
  delete base.updated_at;

  return base;
}

function extractFeatures(metadata) {
  const parsed = parseJson(metadata, {});
  const features = parsed.features;
  if (Array.isArray(features)) {
    return features.map((feature) => String(feature));
  }

  return [];
}

function buildMetadata(metadata) {
  const parsed = parseJson(metadata, {});
  const { features, ...rest } = parsed;
  return rest;
}

function buildConfig(config, publicBaseUrl) {
  const parsed = parseJson(config, {});

  if (Array.isArray(parsed.sections)) {
    parsed.sections = parsed.sections.map((section) => ({
      ...section,
      image: ensureAbsoluteUrl(section.image, publicBaseUrl)
    }));
  }

  if (parsed.previewImages) {
    parsed.previewImages = parsed.previewImages.map((image) =>
      ensureAbsoluteUrl(image, publicBaseUrl)
    );
  }

  return parsed;
}

function parseJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  if (typeof value === 'object') {
    return value;
  }

  if (typeof value !== 'string') {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}
