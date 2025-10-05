import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import express from 'express';
import request from 'supertest';

import categoriesRouter from '../routes/categories.js';
import * as poolModule from '../src/database/pool.js';

const createApp = () => {
  const app = express();
  app.use('/api', categoriesRouter);
  return app;
};

test('GET /api/categories returns 500 when database query fails', async (t) => {
  const executeMock = mock.method(poolModule.pool, 'execute', async () => {
    throw new Error('Database failure');
  });
  t.after(() => {
    executeMock.mock.restore();
  });

  const consoleMock = mock.method(console, 'error', () => {});
  t.after(() => {
    consoleMock.mock.restore();
  });

  const response = await request(createApp()).get('/api/categories');

  assert.equal(response.status, 500);
  assert.deepEqual(response.body, { error: 'Failed to load categories' });
  assert.ok(consoleMock.mock.callCount() >= 1);
});
