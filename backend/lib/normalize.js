import { normalizeCompanyRow } from '../src/services/company-normalizer.js';

export function pickCompanyFields(row = {}, category, tableId = category, index = 0) {
  const normalized = normalizeCompanyRow(tableId || category, row, index);
  const phones = Array.isArray(normalized.phones) ? normalized.phones : [];
  const emails = Array.isArray(normalized.emails) ? normalized.emails : [];
  const services = Array.isArray(normalized.services) ? normalized.services : [];
  const gallery = Array.isArray(normalized.gallery) && normalized.gallery.length ? normalized.gallery : null;

  return {
    id: normalized.id ?? null,
    slug: normalized.slug ?? null,
    category,
    name: normalized.name ?? null,
    description: normalized.shortDescription || normalized.description || null,
    shortDescription: normalized.shortDescription || null,
    address: normalized.address || null,
    room: normalized.room || null,
    phone: phones[0] || null,
    phones,
    email: emails[0] || null,
    emails,
    logo: normalized.logo || null,
    coverImage: normalized.coverImage || null,
    instagram: normalized.instagram || null,
    facebook: normalized.facebook || null,
    whatsapp: normalized.whatsapp || null,
    website: normalized.website || null,
    mapsUrl: normalized.mapsUrl || null,
    schedule: normalized.schedule || null,
    services,
    gallery,
    socialLinks: normalized.socialLinks || [],
    detailPath: normalized.detailPath || null,
    listPath: normalized.listPath || null,
    highlight: Boolean(normalized.highlight),
    createdAt: row.created_date || row.created_at || null,
    updatedAt: row.updated_date || row.updated_at || null,
    status: row.status_col || row.status || null,
  };
}
