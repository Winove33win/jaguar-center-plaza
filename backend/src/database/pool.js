import mysql from 'mysql2/promise';
import { env } from '../config/env.js';
import { normalizeRow } from '../utils/rows.js';

export const pool = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name,
  waitForConnections: true,
  connectionLimit: env.database.connectionLimit,
  queueLimit: 0,
  namedPlaceholders: true,
  timezone: 'Z'
});

export async function query(sql, params = {}) {
  const [rows] = await pool.execute(sql, params);
  if (Array.isArray(rows)) {
    return rows.map(normalizeRow);
  }

  return rows;
}

export async function withConnection(callback) {
  const connection = await pool.getConnection();
  try {
    return await callback(connection);
  } finally {
    connection.release();
  }
}
