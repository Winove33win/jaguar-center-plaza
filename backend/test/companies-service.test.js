import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeCompanyRow, parseEndereco } from '../lib/normalize.js';

test('parseEndereco extrai campo formatted quando disponível', () => {
  const parsed = parseEndereco('{"formatted":"Rua X"}');
  assert.deepEqual(parsed, { formatted: 'Rua X' });
});

test('normalizeCompanyRow aplica fallback de campos', () => {
  const company = normalizeCompanyRow({
    pk: 10,
    titulo: 'Empresa Teste',
    endereco: '{"formatted":"Rua Y"}',
    logo: 123
  });

  assert.equal(company.id, 10);
  assert.equal(company.titulo, 'Empresa Teste');
  assert.equal(company.endereco, 'Rua Y');
  assert.equal(company.logo, '123');
});
