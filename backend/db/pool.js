import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

function readEnv(key, fallbackKey) {
  if (process.env[key] !== undefined && process.env[key] !== '') {
    return process.env[key];
  }

  if (fallbackKey && process.env[fallbackKey] !== undefined && process.env[fallbackKey] !== '') {
    return process.env[fallbackKey];
  }

  return undefined;
}

const host = readEnv('MYSQL_HOST', 'DB_HOST') || '127.0.0.1';
const port = Number.parseInt(readEnv('MYSQL_PORT', 'DB_PORT') || '3306', 10);
const user = readEnv('MYSQL_USER', 'DB_USER') || 'root';
const password = readEnv('MYSQL_PASSWORD', 'DB_PASSWORD') || '';
const database = readEnv('MYSQL_DATABASE', 'DB_NAME') || 'JaguarPlaza';

export const pool = mysql.createPool({
  host,
  port: Number.isNaN(port) ? 3306 : port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

export async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('[DB]', error?.message || error);
    throw error;
  }
}

export default pool;
