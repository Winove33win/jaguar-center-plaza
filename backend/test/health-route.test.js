import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import request from 'supertest';

import healthRouter from '../src/rotas/health.js';

const createApp = () => {
  const app = express();
  app.use('/api', healthRouter);
  return app;
};

test('GET /api/health/processes returns runtime diagnostics', async () => {
  const response = await request(createApp()).get('/api/health/processes');

  assert.equal(response.status, 200);

  const body = response.body;

  assert.equal(typeof body.pid, 'number');
  assert.equal(typeof body.ppid, 'number');
  assert.equal(typeof body.uptime, 'number');
  assert.equal(typeof body.platform, 'string');
  assert.equal(typeof body.arch, 'string');

  assert.equal(typeof body.memory, 'object');
  assert.equal(typeof body.memory.heapUsed, 'number');
  assert.equal(typeof body.memory.heapTotal, 'number');

  assert.equal(typeof body.cpu, 'object');
  assert.equal(typeof body.cpu.user, 'number');
  assert.equal(typeof body.cpu.system, 'number');

  assert.equal(typeof body.handles.total, 'number');
  assert.equal(typeof body.handles.byType, 'object');
  assert.equal(typeof body.requests.total, 'number');
  assert.equal(typeof body.requests.byType, 'object');

  assert.ok(body.versions);
  assert.equal(typeof body.versions.node, 'string');

  assert.ok(Object.prototype.hasOwnProperty.call(body, 'resourceUsage'));
});
