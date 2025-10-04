const mysql = require('mysql2/promise');

function parseJsonValue(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (trimmed.length < 2) {
    return value;
  }

  const startsWithBracket = trimmed.startsWith('[') && trimmed.endsWith(']');
  const startsWithBrace = trimmed.startsWith('{') && trimmed.endsWith('}');

  if (!startsWithBracket && !startsWithBrace) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    return value;
  }
}

function normalizeRow(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return row;
  }

  const normalized = {};

  for (const [key, value] of Object.entries(row)) {
    if (value instanceof Date) {
      normalized[key] = value.toISOString();
    } else {
      normalized[key] = parseJsonValue(value);
    }
  }

  return normalized;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  timezone: 'Z'
});

async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);

  if (Array.isArray(rows)) {
    return rows.map(normalizeRow);
  }

  return rows;
}

module.exports = {
  pool,
  query
};
