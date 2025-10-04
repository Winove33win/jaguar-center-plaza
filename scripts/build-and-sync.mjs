import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const backendDir = path.join(rootDir, 'backend');
const distDir = path.join(backendDir, 'dist');

const truthyValues = new Set(['1', 'true', 'yes', 'on']);

function isTruthy(value) {
  if (typeof value === 'string') {
    return truthyValues.has(value.trim().toLowerCase());
  }

  return Boolean(value);
}

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }

    return false;
  }
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

async function buildFrontend() {
  try {
    await run('npm', ['ci'], { cwd: frontendDir });
  } catch (error) {
    console.warn('npm ci falhou, tentando npm install...');
    await run('npm', ['install'], { cwd: frontendDir });
  }
  await run('npm', ['run', 'build'], { cwd: frontendDir });
}

async function syncDist() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });
  await fs.cp(path.join(frontendDir, 'dist'), distDir, { recursive: true });
}

(async () => {
  const skipByEnv = isTruthy(process.env.SKIP_FRONTEND_BUILD) || isTruthy(process.env.BACKEND_ONLY);

  const hasFrontendDir = await pathExists(frontendDir);
  if (!hasFrontendDir) {
    console.warn(`Pasta do frontend não encontrada em ${frontendDir}. Pulando build e sincronização.`);
    return;
  }

  if (skipByEnv) {
    console.log('Variável de ambiente detectada. Pulando build e sincronização do frontend.');
    return;
  }

  await buildFrontend();
  await syncDist();
})();
