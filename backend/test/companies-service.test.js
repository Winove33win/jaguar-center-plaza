import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeCompanyRow } from '../src/services/company-normalizer.js';

test('mapRowToCompany preserves formatted address information', () => {
  const row = {
    id: 'company-1',
    titulo: 'Example Company',
    endereco: {
      formatted: 'Avenida Paulista, 1000 - São Paulo/SP',
      description: 'Should prefer formatted field when present'
    }
  };

  const company = normalizeCompanyRow('test-category', row, 0);

  assert.equal(
    company.address,
    'Avenida Paulista, 1000 - São Paulo/SP',
    'formatted address should surface in the mapped company'
  );
});
