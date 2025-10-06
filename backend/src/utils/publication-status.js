const ALLOWED_STATUS_VALUES = [
  'published',
  'publicado',
  'active',
  'ativo',
  '1',
  'true',
  'sim',
  'yes'
];

function escapeColumnName(column) {
  return String(column).replace(/`/g, '');
}

export function buildPublicationStatusClause(column) {
  if (!column) {
    return '';
  }

  const safeColumn = escapeColumnName(column);
  const allowedValues = ALLOWED_STATUS_VALUES.map((value) => `'${value}'`).join(', ');

  return `LOWER(COALESCE(CAST(\`${safeColumn}\` AS CHAR), '')) IN (${allowedValues})`;
}

export const __test__ = {
  ALLOWED_STATUS_VALUES,
  escapeColumnName
};
