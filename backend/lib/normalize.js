export function parseEndereco(endereco) {
  if (endereco === null || endereco === undefined) {
    return null;
  }

  if (typeof endereco === 'string') {
    const trimmed = endereco.trim();
    if (!trimmed) {
      return null;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && typeof parsed.formatted === 'string') {
        return { formatted: parsed.formatted };
      }
    } catch (error) {
      // ignore JSON parse errors and fall back to original string
    }

    return { formatted: trimmed };
  }

  if (typeof endereco === 'object') {
    const formatted = typeof endereco.formatted === 'string' ? endereco.formatted : null;
    if (formatted) {
      return { formatted };
    }
  }

  return { formatted: String(endereco) };
}

export function normalizeCompanyRow(row = {}) {
  const endereco = parseEndereco(row.endereco);
  const logo = row.logo != null ? String(row.logo) : null;

  return {
    id: row.id ?? row.pk ?? null,
    titulo: row.titulo ?? null,
    descricao: row.descricao ?? null,
    endereco: endereco?.formatted ?? null,
    celular: row.celular ?? null,
    email: row.email ?? null,
    sala: row.sala ?? null,
    logo,
    createdAt: row.created_date ?? null,
    updatedAt: row.updated_date ?? null
  };
}

export function pickCompanyFields(rows = []) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => normalizeCompanyRow(row));
}
