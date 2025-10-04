import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from '../src/config/env.js';
import { generateSitemapFiles } from '../src/services/sitemap-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.resolve(projectRoot, 'httpdocs');

const baseUrl = env.publicBaseUrl || process.env.SITEMAP_SOURCE_URL || 'http://localhost:3333';

async function run() {
  const { xml, gzip } = await generateSitemapFiles(baseUrl);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, 'sitemap.xml'), xml, 'utf8');
  await fs.writeFile(path.join(outputDir, 'sitemap.xml.gz'), gzip);

  // eslint-disable-next-line no-console
  console.log(`Sitemaps gerados em ${outputDir}`);
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Falha ao gerar sitemaps estáticos:', error);
  process.exitCode = 1;
});
