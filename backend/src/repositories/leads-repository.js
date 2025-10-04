import { randomUUID } from 'crypto';
import { query, withConnection } from '../database/pool.js';

const TABLE_NAME = 'leads_libras';

export async function createLibrasLead({ name, email, phone, message, source }) {
  const id = randomUUID();

  await query(
    `INSERT INTO ${TABLE_NAME} (id, name, email, phone, message, source, created_at)
     VALUES (:id, :name, :email, :phone, :message, :source, UTC_TIMESTAMP())`,
    { id, name, email, phone, message, source }
  );

  return id;
}

export async function isSpamAttempt({ email, phone }) {
  if (!email && !phone) {
    return false;
  }

  return withConnection(async (connection) => {
    const conditions = [];
    const params = {};

    if (email) {
      conditions.push('email = :email');
      params.email = email;
    }

    if (phone) {
      conditions.push('phone = :phone');
      params.phone = phone;
    }

    const whereClause = conditions.length ? `(${conditions.join(' OR ')}) AND` : '';

    const [rows] = await connection.execute(
      `SELECT id
       FROM ${TABLE_NAME}
       WHERE ${whereClause} created_at >= (UTC_TIMESTAMP() - INTERVAL 15 MINUTE)
       LIMIT 1`,
      params
    );

    return Array.isArray(rows) && rows.length > 0;
  });
}
