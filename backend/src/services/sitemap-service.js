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
  const urlset = [
    createUrl(baseUrl, 'weekly', '1.0'),
    createUrl(`${baseUrl}/sobre-nos`, 'monthly', '0.8'),
    createUrl(`${baseUrl}/empresas`, 'weekly', '0.9'),
    createUrl(`${baseUrl}/contato`, 'monthly', '0.7')
  ];

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

export async function generateSitemapFiles(baseUrl) {
  const { xml, gzip } = await getFreshSitemap(baseUrl);
  return { xml, gzip };
}

async function getFreshSitemap(baseUrl) {
  const xml = await buildSitemapXml(baseUrl);
  const gzip = zlib.gzipSync(xml);
  return { xml, gzip };
}
