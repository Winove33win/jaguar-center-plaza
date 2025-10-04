import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, 'frontend', 'dist');
const targetDir = path.join(rootDir, 'backend', 'public');

async function ensureSourceExists() {
  try {
    await fs.access(sourceDir);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(
        `Diretório de build do frontend não encontrado em ${sourceDir}. ` +
          'Execute "npm run build:frontend" antes de sincronizar.'
      );
    }

    throw error;
  }
}

async function syncFrontend() {
  await ensureSourceExists();
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(targetDir, { recursive: true });
  await fs.cp(sourceDir, targetDir, { recursive: true });
}

syncFrontend().catch((error) => {
  console.error('Falha ao sincronizar build do frontend:', error);
  process.exitCode = 1;
});
