import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootScript = pathToFileURL(path.resolve(__dirname, '../../scripts/build-and-sync.mjs')).href;

await import(rootScript);
