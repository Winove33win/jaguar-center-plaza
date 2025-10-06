import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PORT = 3306;

function getRequiredEnv(key) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return undefined;
  }

  return value;
}

const portFromEnv = Number.parseInt(getRequiredEnv('MYSQL_PORT') ?? `${DEFAULT_PORT}`, 10);

export const pool = mysql.createPool({
  host: getRequiredEnv('MYSQL_HOST') ?? '127.0.0.1',
  port: Number.isNaN(portFromEnv) ? DEFAULT_PORT : portFromEnv,
  user: getRequiredEnv('MYSQL_USER') ?? 'root',
  password: getRequiredEnv('MYSQL_PASSWORD') ?? '',
  database: getRequiredEnv('MYSQL_DATABASE') ?? undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function ping() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[DB] Ping failed', error);
    return false;
  }
}

export default pool;
