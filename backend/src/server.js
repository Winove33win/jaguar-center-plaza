import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import companiesRouter from '../routes/companies.js';
import { env, resolvePublicBaseUrl } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import apiRouter from './routes/index.js';
import { getSitemap } from './services/sitemap-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const indexFile = path.join(distDir, 'index.html');

export function createApp() {
  const app = express();

  if (env.security.trustProxy) {
    app.set('trust proxy', 1);
  }

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/sitemap.xml', async (req, res, next) => {
    try {
      const baseUrl = resolvePublicBaseUrl(req);
      const { gzip } = await getSitemap(baseUrl);

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Encoding', 'gzip');
      res.send(gzip);
    } catch (error) {
      next(error);
    }
  });

  app.use('/api', apiRouter);
  app.use('/api', companiesRouter);

  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir, { index: false, maxAge: env.nodeEnv === 'production' ? '1h' : 0 }));
  }

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    if (!fs.existsSync(indexFile)) {
      return res.status(404).send('Aplicação frontend não encontrada. Execute o build antes de iniciar o servidor.');
    }

    return res.sendFile(indexFile);
  });

  app.use(errorHandler);

  return app;
}

export function startServer(app = createApp()) {
  const port = env.port;
  return app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Servidor iniciado na porta ${port}`);
  });
}

export default createApp;
