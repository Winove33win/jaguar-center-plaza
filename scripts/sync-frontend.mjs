import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const distDir = path.join(frontendDir, 'dist');
const backendDir = path.join(rootDir, 'backend');
const publicDir = path.join(backendDir, 'public');

async function sync() {
  try {
    await fs.rm(publicDir, { recursive: true, force: true });
    await fs.mkdir(publicDir, { recursive: true });
    await fs.cp(distDir, publicDir, { recursive: true });
    console.log('Frontend sincronizado em', publicDir);
  } catch (error) {
    console.error('Erro ao sincronizar frontend', error);
    process.exitCode = 1;
  }
}

sync();
