import axios from 'axios';
import NodeCache from 'node-cache';
import zlib from 'zlib';

const CACHE_TTL_SECONDS = 60 * 10;
const cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS, checkperiod: 120 });

export async function getSitemap(baseUrl) {
  const cacheKey = `sitemap:${baseUrl}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const xml = await buildSitemapXml(baseUrl);
  const gzip = zlib.gzipSync(xml);

  const payload = { xml, gzip };
  cache.set(cacheKey, payload);
  return payload;
}

async function buildSitemapXml(baseUrl) {
  const [blogPosts, cases, templates] = await Promise.all([
    fetchAllBlogPosts(baseUrl),
    fetchJson(`${baseUrl}/api/cases`),
    fetchJson(`${baseUrl}/api/templates`)
  ]);

  const urlset = [
    createUrl(baseUrl, 'daily', '1.0'),
    createUrl(`${baseUrl}/blog`, 'daily', '0.9'),
    createUrl(`${baseUrl}/cases`, 'weekly', '0.8'),
    createUrl(`${baseUrl}/templates`, 'weekly', '0.8')
  ];

  for (const post of blogPosts) {
    urlset.push(
      createUrl(`${baseUrl}/blog/${post.slug}`, 'weekly', '0.7', post.updatedAt || post.publishedAt)
    );
  }

  for (const item of cases.items || cases) {
    if (!item?.slug) continue;
    urlset.push(createUrl(`${baseUrl}/cases/${item.slug}`, 'weekly', '0.6', item.updatedAt));
  }

  for (const template of templates.items || templates) {
    if (!template?.slug) continue;
    urlset.push(
      createUrl(`${baseUrl}/templates/${template.slug}`, 'weekly', '0.6', template.updatedAt)
    );
  }

  const urls = urlset
    .map((url) => {
      const lastmod = url.lastmod
        ? `<lastmod>${new Date(url.lastmod).toISOString()}</lastmod>`
        : '';

      return `  <url>\n    <loc>${escapeXml(url.loc)}</loc>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>${
        lastmod ? `\n    ${lastmod}` : ''
      }\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${urls}\n` +
    '</urlset>';
}

function createUrl(loc, changefreq, priority, lastmod) {
  return { loc, changefreq, priority, lastmod };
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchAllBlogPosts(baseUrl) {
  let page = 1;
  const perPage = 100;
  const items = [];
  let totalPages = 1;

  do {
    const response = await axios.get(`${baseUrl}/api/blog-posts`, {
      params: { page, perPage, status: 'PUBLISHED' }
    });
    const data = response.data || {};
    const received = Array.isArray(data.items) ? data.items : [];
    items.push(...received);
    totalPages = data.pagination?.totalPages || 1;
    page += 1;
  } while (page <= totalPages);

  return items;
}

async function fetchJson(url) {
  const response = await axios.get(url);
  return response.data;
}

export async function generateSitemapFiles(baseUrl) {
  const { xml, gzip } = await getFreshSitemap(baseUrl);
  return { xml, gzip };
}

async function getFreshSitemap(baseUrl) {
  const xml = await buildSitemapXml(baseUrl);
  const gzip = zlib.gzipSync(xml);
  return { xml, gzip };
}
