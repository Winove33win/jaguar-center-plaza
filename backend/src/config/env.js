import dotenv from 'dotenv';

dotenv.config();

const truthy = new Set(['1', 'true', 'yes', 'on']);

function toNumber(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return truthy.has(String(value).trim().toLowerCase());
}

function normalizeBaseUrl(value) {
  if (!value) {
    return '';
  }

  return value.replace(/\/$/, '');
}

const dbHost = process.env.DB_HOST ?? process.env.MYSQL_HOST ?? '127.0.0.1';
const dbPort = process.env.DB_PORT ?? process.env.MYSQL_PORT;
const dbUser = process.env.DB_USER ?? process.env.MYSQL_USER ?? 'root';
const dbPassword = process.env.DB_PASSWORD ?? process.env.MYSQL_PASSWORD ?? '';
const dbName = process.env.DB_NAME ?? process.env.MYSQL_DATABASE ?? 'JaguarPlaza';
const dbConnectionLimit = process.env.DB_CONN_LIMIT ?? process.env.MYSQL_CONN_LIMIT;

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 3333),
  publicBaseUrl: normalizeBaseUrl(process.env.PUBLIC_BASE_URL || ''),
  database: {
    host: dbHost,
    port: toNumber(dbPort, 3306),
    user: dbUser,
    password: dbPassword,
    name: dbName,
    connectionLimit: toNumber(dbConnectionLimit, 10)
  },
  security: {
    trustProxy: toBoolean(process.env.TRUST_PROXY, true)
  },
  payments: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY || '',
    stripeServiceUrl: process.env.STRIPE_SERVICE_URL || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
  }
};

export function resolvePublicBaseUrl(request) {
  if (env.publicBaseUrl) {
    return env.publicBaseUrl;
  }

  const protocol = request?.protocol || 'http';
  const host = request?.get?.('host') || 'localhost';
  return `${protocol}://${host}`;
}
