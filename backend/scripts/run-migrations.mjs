import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../migrations');

async function loadPool() {
  const module = await import(pathToFileURL(path.resolve(__dirname, '../src/database/pool.js')).href);
  return module.pool;
}

async function run() {
  const pool = await loadPool();

  const exists = await directoryExists(migrationsDir);
  if (!exists) {
    // eslint-disable-next-line no-console
    console.log('Nenhuma migração encontrada.');
    return;
  }

  const entries = await fs.readdir(migrationsDir);
  const sqlFiles = entries.filter((file) => file.endsWith('.sql')).sort();

  for (const file of sqlFiles) {
    const fullPath = path.join(migrationsDir, file);
    const sql = await fs.readFile(fullPath, 'utf8');
    // eslint-disable-next-line no-console
    console.log(`Executando migração ${file}`);
    await pool.query(sql);
  }

  await pool.end();
}

async function directoryExists(target) {
  try {
    const stats = await fs.stat(target);
    return stats.isDirectory();
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Falha ao executar migrações:', error);
  process.exitCode = 1;
});
