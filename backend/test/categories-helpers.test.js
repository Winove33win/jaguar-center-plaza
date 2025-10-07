import test from 'node:test';
import assert from 'node:assert/strict';

import { __internal } from '../db/categories.js';

const { buildSearchClause, buildOrderByClause } = __internal;

test('buildSearchClause uses available searchable columns', () => {
  const columns = new Map([
    ['titulo', 'titulo'],
    ['email', 'email']
  ]);

  const { clause, params } = buildSearchClause(columns, 'teste');

  assert.equal(clause, "(COALESCE(`titulo`, '') LIKE ? OR COALESCE(`email`, '') LIKE ?)");
  assert.deepEqual(params, ['%teste%', '%teste%']);
});

test('buildSearchClause returns empty clause when nothing matches', () => {
  const columns = new Map([
    ['id', 'id']
  ]);

  const { clause, params } = buildSearchClause(columns, 'teste');

  assert.equal(clause, '');
  assert.deepEqual(params, []);
});

test('buildSearchClause ignores empty search terms', () => {
  const columns = new Map([
    ['titulo', 'titulo']
  ]);

  const { clause, params } = buildSearchClause(columns, '');

  assert.equal(clause, '');
  assert.deepEqual(params, []);
});

test('buildOrderByClause prefers textual columns', () => {
  const columns = new Map([
    ['nome', 'Nome'],
    ['id', 'id']
  ]);

  assert.equal(
    buildOrderByClause(columns),
    "ORDER BY (COALESCE(`Nome`, '') = ''), `Nome` ASC"
  );
});

test('buildOrderByClause falls back to identifiers', () => {
  const columns = new Map([
    ['id', 'id']
  ]);

  assert.equal(buildOrderByClause(columns), 'ORDER BY `id` ASC');
});

test('buildOrderByClause returns default ordering when nothing matches', () => {
  const columns = new Map();

  assert.equal(buildOrderByClause(columns), 'ORDER BY 1');
});
