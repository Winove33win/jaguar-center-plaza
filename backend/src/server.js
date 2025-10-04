const path = require('path');
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

app.get('/', (_req, res) => {
  res.type('text').send('JaguarPlaza API\n- /api/health\n- /api/tables\n- /api/lojas');
});

app.use('/api', apiRoutes);

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
