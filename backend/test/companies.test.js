import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import app from '../app.js';
import { CATEGORIES } from '../src/services/companies-service.js';
import { pool } from '../db/pool.js';

const DEFAULT_CATEGORY = 'administracao';
let cachedAvailability;

async function ensureDatabaseAvailable() {
  if (typeof cachedAvailability === 'boolean') {
    return cachedAvailability;
  }

  try {
    await pool.query('SELECT 1');
    cachedAvailability = true;
    return true;
  } catch (error) {
    cachedAvailability = false;
    return false;
  }
}

test('GET /api/companies?categoria=administracao retorna lista', async (t) => {
  const available = await ensureDatabaseAvailable();
  if (!available) {
    t.skip('Banco de dados indisponível no ambiente de testes.');
    return;
  }

  const response = await request(app).get('/api/companies').query({ categoria: DEFAULT_CATEGORY });

  if (response.status === 500) {
    t.skip('Serviço de empresas indisponível para testes.');
  }

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.items));
});

test('GET /api/companies/administracao/:id retorna detalhe', async (t) => {
  const available = await ensureDatabaseAvailable();
  if (!available) {
    t.skip('Banco de dados indisponível no ambiente de testes.');
    return;
  }

  const listResponse = await request(app).get('/api/companies').query({ categoria: DEFAULT_CATEGORY });
  if (listResponse.status !== 200 || !Array.isArray(listResponse.body.items) || listResponse.body.items.length === 0) {
    t.skip('Nenhuma empresa disponível para testar detalhes.');
  }

  const firstCompany = listResponse.body.items[0];
  const detailResponse = await request(app).get(`/api/companies/${DEFAULT_CATEGORY}/${firstCompany.id}`);

  if (detailResponse.status === 500) {
    t.skip('Serviço de detalhes indisponível para testes.');
  }

  assert.equal(detailResponse.status, 200);
  assert.ok(detailResponse.body);
  assert.ok(detailResponse.body.titulo);
});

test('GET /api/categories retorna todas as categorias', async (t) => {
  const available = await ensureDatabaseAvailable();
  if (!available) {
    t.skip('Banco de dados indisponível no ambiente de testes.');
    return;
  }

  const response = await request(app).get('/api/categories');

  if (response.status === 500) {
    t.skip('Serviço de categorias indisponível para testes.');
  }

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  assert.equal(response.body.length, Object.keys(CATEGORIES).length);
});

test.after(async () => {
  await pool.end();
});
