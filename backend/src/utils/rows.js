function parseJson(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }

  const isJsonCandidate =
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'));

  if (!isJsonCandidate) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    return value;
  }
}

export function normalizeRow(row) {
  if (!row || typeof row !== 'object') {
    return row;
  }

  const normalized = {};

  for (const [key, value] of Object.entries(row)) {
    if (value instanceof Date) {
      normalized[key] = value.toISOString();
    } else {
      normalized[key] = parseJson(value);
    }
  }

  return normalized;
}

export function mapRows(rows, mapper) {
  return rows.map((row) => mapper(normalizeRow(row)));
}
