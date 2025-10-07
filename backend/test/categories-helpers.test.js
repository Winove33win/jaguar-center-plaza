import test from 'node:test';
import assert from 'node:assert/strict';

import { __internal } from '../db/categories.js';

const { buildSearchClause, buildOrderByClause, mapCompanyRow } = __internal;


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

test('buildOrderByClause prefers title column before identifiers', () => {
  const columns = new Map([
    ['title', 'title'],
    ['id', 'id']
  ]);

  assert.equal(
    buildOrderByClause(columns),
    "ORDER BY (COALESCE(`title`, '') = ''), `title` ASC"
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


test('mapCompanyRow reads values regardless of column casing', () => {
  const columns = new Map([
    ['titulo', 'Titulo'],
    ['descricao', 'Descricao'],
    ['pk', 'PK']
  ]);

  const row = {
    Titulo: 'Advocacia Alfa',
    Descricao: 'Atendimento jurídico especializado',
    PK: '7'
  };

  const mapped = mapCompanyRow(row, columns);

  assert.equal(mapped.titulo, 'Advocacia Alfa');
  assert.equal(mapped.descricao, 'Atendimento jurídico especializado');
  assert.equal(mapped.pk, 7);
});

test('mapCompanyRow prefers title column for company name when titulo is unavailable', () => {
  const columns = new Map([
    ['title', 'title'],
    ['descricao', 'descricao']
  ]);

  const row = {
    title: 'Advocacia Beta',
    descricao: 'Escritório especializado em direito civil'
  };

  const mapped = mapCompanyRow(row, columns);

  assert.equal(mapped.titulo, 'Advocacia Beta');
  assert.equal(mapped.descricao, 'Escritório especializado em direito civil');
});


test('mapCompanyRow falls back to title when titulo duplicates descricao', () => {
  const columns = new Map([
    ['titulo', 'titulo'],
    ['title', 'title'],
    ['descricao', 'descricao']
  ]);

  const row = {
    titulo: 'Descrição repetida',
    title: 'Nome Correto',
    descricao: 'Descrição repetida'
  };

  const mapped = mapCompanyRow(row, columns);

  assert.equal(mapped.titulo, 'Nome Correto');
  assert.equal(mapped.descricao, 'Descrição repetida');
});

