import assert from 'node:assert/strict';
import test, { after, mock } from 'node:test';
import request from 'supertest';

import { CATEGORIES } from '../lib/categories.js';

const originalNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.DB_NAME ?? 'test_database';

after(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

const { default: pool } = await import('../db/pool.js');
const { default: app } = await import('../app.js');

const fixturesByTable = Object.fromEntries(
  CATEGORIES.map((category, index) => {
    const columns = ['id', 'titulo', 'descricao', 'updated_at', 'status_col'];
    const row = {
      id: index + 1,
      titulo: `${category.name} Example`,
      descricao: `Description for ${category.name}`,
      updated_at: '2024-01-01',
      status_col: 'published',
    };

    return [
      category.table,
      {
        columns,
        rows: [row],
      },
    ];
  })
);

test('GET /api/companies resolves each category list and detail', async (t) => {
  const queryMock = mock.method(pool, 'query', async (sql, params = []) => {
    if (typeof sql === 'string' && sql.includes('information_schema.columns')) {
      const tableName = params?.[1];
      const fixture = fixturesByTable[tableName];
      const columns = fixture?.columns ?? [];
      return [columns.map((column) => ({ column_name: column })), []];
    }

    const tableMatch = typeof sql === 'string' ? sql.match(/FROM\s+`([^`]+)`/i) : null;
    const tableName = tableMatch?.[1];
    const fixture = tableName ? fixturesByTable[tableName] : undefined;

    if (!fixture) {
      return [[{ total: 0 }], []];
    }

    if (typeof sql === 'string' && sql.includes('COUNT(*)')) {
      return [[{ total: fixture.rows.length }], []];
    }

    if (typeof sql === 'string' && sql.includes('LIMIT 1')) {
      const idParam = params?.[0];
      const row = fixture.rows.find((item) => String(item.id ?? item.pk) === String(idParam));
      return [row ? [row] : [], []];
    }

    return [fixture.rows, []];
  });

  t.after(() => {
    queryMock.mock.restore();
  });

  for (const category of CATEGORIES) {
    const fixture = fixturesByTable[category.table];

    const listResponse = await request(app)
      .get('/api/companies')
      .query({ category: category.slug });

    assert.equal(listResponse.status, 200, `List request for ${category.slug} should succeed`);
    assert.equal(listResponse.body.total, fixture.rows.length);
    assert.equal(listResponse.body.items.length, fixture.rows.length);
    assert.equal(listResponse.body.items[0].category, category.slug);
    assert.equal(listResponse.body.items[0].name, fixture.rows[0].titulo);

    const detailResponse = await request(app)
      .get(`/api/companies/${category.slug}/${fixture.rows[0].id}`)
      .query();

    assert.equal(detailResponse.status, 200, `Detail request for ${category.slug} should succeed`);
    assert.equal(detailResponse.body.id, fixture.rows[0].id);
    assert.equal(detailResponse.body.category, category.slug);
    assert.equal(detailResponse.body.name, fixture.rows[0].titulo);
  }
});
