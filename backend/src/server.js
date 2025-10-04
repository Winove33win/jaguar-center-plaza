const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const apiRoutes = require('./routes/api');
const errorHandler = require('./middlewares/error');

const app = express();

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', apiRoutes);

const shouldServeFrontend = String(process.env.SERVE_FRONTEND || 'true').toLowerCase() !== 'false';
const frontendDistEnv = process.env.FRONTEND_DIST || path.resolve(__dirname, '..', 'dist');
const frontendDistPath = path.isAbsolute(frontendDistEnv)
  ? frontendDistEnv
  : path.resolve(__dirname, '..', frontendDistEnv);

let servingFrontend = false;

if (shouldServeFrontend) {
  const frontendIndex = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(frontendIndex)) {
    servingFrontend = true;
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) {
        return next();
      }

      res.sendFile(frontendIndex);
    });
  } else {
    console.warn(`Frontend dist não encontrado em ${frontendDistPath}. Serviço estático desabilitado.`);
  }
}

if (!servingFrontend) {
  app.get('/', (_req, res) => {
    res.type('text').send('JaguarPlaza API\n- /api/health\n- /api/tables\n- /api/lojas');
  });
}

app.use(errorHandler);

const DEFAULT_PORT = 3333;
const port = Number(process.env.PORT || DEFAULT_PORT);

const server = app.listen(port, () => {
  console.log(`API listening on :${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `Port ${port} is already in use. Set the PORT environment variable to use a different port or stop the process currently using it.`
    );
    process.exit(1);
  }

  throw err;
});
