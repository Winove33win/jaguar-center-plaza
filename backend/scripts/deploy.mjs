import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} saiu com código ${code}`));
      }
    });
  });
}

async function main() {
  const cwd = path.resolve(__dirname, '..');
  await run('node', ['scripts/build-and-sync.mjs'], { cwd });
  await run('node', ['scripts/generate-static-sitemaps.mjs'], { cwd });
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Deploy falhou:', error);
  process.exitCode = 1;
});
