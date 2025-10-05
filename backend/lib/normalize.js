export function parseMaybeJson(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    return value;
  }
}

export function pickCompanyFields(row = {}, category) {
  const normalizedAddress =
    typeof row.endereco === 'string'
      ? parseMaybeJson(row.endereco)
      : row.endereco;

  const address =
    typeof row.endereco === 'string'
      ? (normalizedAddress && typeof normalizedAddress === 'object'
          ? normalizedAddress.formatted ?? null
          : row.endereco)
      : normalizedAddress?.formatted ?? null;

  const parsedGallery = parseMaybeJson(row.galeria_de_midia);
  const gallery = Array.isArray(parsedGallery) ? parsedGallery : null;

  return {
    id: row.id || row.pk || null,
    category,
    name: row.titulo || row.title || row.titulo_col || null,
    description: row.descricao || null,
    address,
    room: row.sala || null,
    phone: row.celular || null,
    email: row.email || null,
    logo: row.logo || row.imagem || null,
    instagram: row.instagram || null,
    facebook: row.facebook || null,
    whatsapp: row.link_whatsapp || row.links_whatsapp || null,
    gallery,
    createdAt: row.created_date || null,
    updatedAt: row.updated_date || null,
    status: row.status_col || null,
  };
}
