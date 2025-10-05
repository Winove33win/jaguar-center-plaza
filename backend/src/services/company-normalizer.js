import { normalizeRow } from '../utils/rows.js';

const COMPANY_FIELD_CANDIDATES = {
  id: ['id', 'uuid', 'pk', 'codigo', 'codigo_sala'],
  slug: ['slug', 'seo_slug', 'identifier'],
  name: ['titulo', 'title', 'nome', 'name', 'empresa', 'razao_social', 'fantasia'],
  tagline: ['headline', 'tagline', 'slogan'],
  shortDescription: ['descricao_curta', 'descricao_resumida', 'resumo', 'descricao'],
  description: ['descricao_completa', 'detalhes', 'informacoes', 'texto', 'sobre', 'descricao'],
  phone: ['telefone', 'telefones', 'celular', 'whatsapp', 'fone', 'contato', 'contato_telefone'],
  email: ['email', 'emails', 'contato_email'],
  whatsapp: ['link_whatsapp', 'whatsapp', 'contato_whatsapp'],
  website: ['website', 'site', 'url'],
  instagram: ['instagram'],
  facebook: ['facebook'],
  linkedin: ['linkedin'],
  address: ['endereco', 'endereco_completo', 'localizacao', 'local', 'address', 'sala'],
  mapsUrl: ['maps_url', 'mapa', 'maps'],
  schedule: ['horario', 'horario_funcionamento', 'funcionamento'],
  services: ['servicos', 'services', 'lista_servicos'],
  gallery: ['galeria', 'galeria_de_midia', 'midia'],
  logo: ['logo', 'imagem_logo'],
  coverImage: ['capa', 'imagem_capa', 'imagem', 'cover', 'banner'],
  highlight: ['destaque', 'highlight'],
  room: ['sala', 'room', 'identificacao_sala', 'codigo_sala']
};

const DATE_FIELD_CANDIDATES = [
  'updated_date',
  'updated_at',
  'ultima_atualizacao',
  'modified_at',
  'created_date',
  'created_at',
  'data_criacao',
  'publish_date',
  'publish_at',
  'unpublish_date',
  'unpublish_at'
];

const TRUTHY_VALUES = new Set(['1', 'true', 'yes', 'sim', 'on', 'y']);

function ensureString(value, fallback = '') {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : fallback;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return fallback;
}

function toSlug(value, fallback) {
  const base = ensureString(value, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const slug = base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || fallback;
}

function tryParseJson(value) {
  if (typeof value !== 'string') {
    return { success: false, value };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { success: false, value: '' };
  }

  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return { success: false, value };
  }

  try {
    return { success: true, value: JSON.parse(trimmed) };
  } catch (error) {
    console.debug('Não foi possível interpretar conteúdo JSON', error);
    return { success: false, value };
  }
}

function ensureArray(value) {
  if (value === null || value === undefined) {
    return [];
  }

  if (typeof value === 'string') {
    const { success, value: parsed } = tryParseJson(value);
    if (success) {
      return ensureArray(parsed);
    }

    const normalized = value.replace(/[\n\r]+/g, ',');
    return normalized
      .split(/[;,|]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => ensureString(item))
      .filter((item) => item.length > 0);
  }

  return [ensureString(value)].filter((item) => item.length > 0);
}

function normalizeAddress(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    const { success, value: parsed } = tryParseJson(value);
    if (success) {
      return normalizeAddress(parsed);
    }

    return ensureString(value);
  }

  if (Array.isArray(value)) {
    return normalizeAddress(value[0]);
  }

  if (typeof value === 'object') {
    const formatted = ensureString(value.formatted, '');
    if (formatted) {
      return formatted;
    }

    const description = ensureString(value.description || value.address || value.value || value.label, '');
    if (description) {
      return description;
    }
  }

  return ensureString(value);
}

function createColumnLookup(row) {
  const lookup = new Map();
  for (const key of Object.keys(row)) {
    lookup.set(key.toLowerCase(), key);
  }
  return lookup;
}

function resolveColumn(row, lookup, candidate) {
  const actual = lookup.get(candidate.toLowerCase());
  if (!actual) {
    return { key: null, value: undefined };
  }

  return { key: actual, value: row[actual] };
}

function pickFirst(row, lookup, candidates, fallback = '') {
  for (const candidate of candidates) {
    const { key, value } = resolveColumn(row, lookup, candidate);
    if (!key) {
      continue;
    }

    const normalized = ensureString(value, fallback);
    if (normalized) {
      return normalized;
    }
  }

  return fallback;
}

function pickFirstValue(row, lookup, candidates) {
  for (const candidate of candidates) {
    const { key, value } = resolveColumn(row, lookup, candidate);
    if (!key) {
      continue;
    }

    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === 'string') {
      const normalized = ensureString(value, '');
      if (normalized) {
        return { key, value };
      }

      continue;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        return { key, value };
      }

      continue;
    }

    return { key, value };
  }

  return { key: null, value: null };
}

function pickList(row, lookup, candidates) {
  for (const candidate of candidates) {
    const { key, value } = resolveColumn(row, lookup, candidate);
    if (!key) {
      continue;
    }

    const list = ensureArray(value);
    if (list.length) {
      return list;
    }
  }

  return [];
}

function parseGallery(value) {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    const { success, value: parsed } = tryParseJson(value);
    if (success) {
      return parseGallery(parsed);
    }
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') {
          const normalized = ensureString(item);
          return normalized ? { url: normalized } : null;
        }

        if (item && typeof item === 'object') {
          const url = ensureString(item.url || item.src);
          if (!url) {
            return null;
          }
          const alt = ensureString(item.alt);
          return alt ? { url, alt } : { url };
        }

        return null;
      })
      .filter(Boolean);
  }

  const asString = ensureString(value);
  if (!asString) {
    return [];
  }

  return ensureArray(asString).map((url) => ({ url }));
}

function toBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  const normalized = ensureString(value).toLowerCase();
  return TRUTHY_VALUES.has(normalized);
}

function normalizePhones(phones) {
  return [...new Set(phones.map((phone) => phone.trim()).filter(Boolean))];
}

function normalizeTableId(tableId) {
  return ensureString(tableId)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function buildTableSpecificCandidates(tableId, suffixes = []) {
  const normalized = normalizeTableId(tableId);
  if (!normalized) {
    return [];
  }

  const unique = new Set();
  for (const suffix of suffixes) {
    const normalizedSuffix = ensureString(suffix).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (!normalizedSuffix) {
      continue;
    }

    unique.add(`${normalized}_${normalizedSuffix}`);
    unique.add(`${normalized}${normalizedSuffix.startsWith('_') ? normalizedSuffix : `_${normalizedSuffix}`}`);
    unique.add(`${normalizedSuffix}_${normalized}`);
  }

  return [...unique];
}

function findTableSpecificValue(row, lookup, tableId, suffixes) {
  const candidates = buildTableSpecificCandidates(tableId, suffixes);
  for (const candidate of candidates) {
    const { key, value } = resolveColumn(row, lookup, candidate);
    if (key && value !== undefined && value !== null && value !== '') {
      return { key, value };
    }
  }

  return { key: null, value: null };
}

function deriveSlugFromValue(value, fallback) {
  const raw = ensureString(value, '');
  if (!raw) {
    return fallback;
  }

  const pathWithoutQuery = raw.split(/[?#]/, 1)[0];
  const segments = pathWithoutQuery.split('/').filter(Boolean);
  const lastSegment = segments.length ? segments[segments.length - 1] : raw;
  return toSlug(lastSegment, fallback);
}

function ensurePath(value) {
  const raw = ensureString(value, '');
  if (!raw) {
    return '';
  }

  if (raw.startsWith('http')) {
    return raw;
  }

  if (!raw.startsWith('/')) {
    return `/${raw}`;
  }

  return raw;
}

function combineRoomAndAddress(room, address) {
  const normalizedRoom = ensureString(room, '');
  const normalizedAddress = ensureString(address, '');

  if (normalizedRoom && normalizedAddress) {
    if (normalizedAddress.toLowerCase().includes(normalizedRoom.toLowerCase())) {
      return normalizedAddress;
    }

    return `${normalizedRoom} · ${normalizedAddress}`;
  }

  return normalizedRoom || normalizedAddress || '';
}

function buildSocialLinks(company) {
  const links = [];

  if (company.website) {
    links.push({ label: 'Site', url: company.website, type: 'website' });
  }

  if (company.instagram) {
    links.push({ label: 'Instagram', url: company.instagram, type: 'instagram' });
  }

  if (company.facebook) {
    links.push({ label: 'Facebook', url: company.facebook, type: 'facebook' });
  }

  if (company.linkedin) {
    links.push({ label: 'LinkedIn', url: company.linkedin, type: 'linkedin' });
  }

  if (company.whatsapp) {
    links.push({ label: 'WhatsApp', url: company.whatsapp, type: 'whatsapp' });
  }

  return links;
}

export function normalizeCompanyRow(tableId, row = {}, index = 0) {
  const normalizedRow = normalizeRow(row);
  const lookup = createColumnLookup(normalizedRow);
  const fallbackId = `${normalizeTableId(tableId) || 'company'}-${index + 1}`;

  const id = pickFirst(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.id, fallbackId);
  const name = pickFirst(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.name, id);

  const { value: slugFromRow } = pickFirstValue(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.slug);
  const { value: tableSpecificSlug } = findTableSpecificValue(normalizedRow, lookup, tableId, [
    'slug',
    'titulo',
    'title',
    'path',
    'link'
  ]);

  const slug = deriveSlugFromValue(slugFromRow || tableSpecificSlug || name, toSlug(id, fallbackId));

  const phones = pickList(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.phone);
  const emails = pickList(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.email);

  const galleryCandidate = findTableSpecificValue(normalizedRow, lookup, tableId, ['galeria', 'gallery']);
  const galleryKey = galleryCandidate.key
    ? galleryCandidate.key
    : pickFirstValue(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.gallery).key;

  const highlightKey = pickFirstValue(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.highlight).key;
  const addressCandidate = pickFirstValue(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.address);
  const room = pickFirst(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.room, '');

  const detailPathCandidate = findTableSpecificValue(normalizedRow, lookup, tableId, [
    'titulo',
    'slug',
    'path',
    'link',
    'url',
    'detalhe'
  ]);

  const listPathCandidate = findTableSpecificValue(normalizedRow, lookup, tableId, [
    'all_list',
    'lista',
    'list',
    'links'
  ]);

  const company = {
    id,
    slug,
    tableId,
    name,
    tagline: pickFirst(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.tagline, ''),
    shortDescription: pickFirst(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.shortDescription, ''),
    description: pickFirst(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.description, ''),
    phones: normalizePhones(phones),
    emails,
    whatsapp: pickFirst(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.whatsapp, ''),
    website: pickFirst(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.website, ''),
    instagram: pickFirst(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.instagram, ''),
    facebook: pickFirst(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.facebook, ''),
    linkedin: pickFirst(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.linkedin, ''),
    address: combineRoomAndAddress(room, normalizeAddress(addressCandidate.value ?? '')),
    room,
    mapsUrl: pickFirst(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.mapsUrl, ''),
    schedule: pickFirst(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.schedule, ''),
    services: pickList(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.services),
    gallery: parseGallery(galleryKey ? normalizedRow[galleryKey] : null),
    logo: pickFirst(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.logo, ''),
    coverImage: pickFirst(normalizedRow, lookup, COMPANY_FIELD_CANDIDATES.coverImage, ''),
    highlight: highlightKey ? toBoolean(normalizedRow[highlightKey]) : false,
    detailPath: ensurePath(detailPathCandidate.value || ''),
    listPath: ensurePath(listPathCandidate.value || '')
  };

  company.socialLinks = buildSocialLinks(company);

  return company;
}

export function extractLatestDate(rows = []) {
  let latest = null;

  for (const row of rows) {
    const normalizedRow = normalizeRow(row);
    const lookup = createColumnLookup(normalizedRow);

    for (const field of DATE_FIELD_CANDIDATES) {
      const { key, value } = resolveColumn(normalizedRow, lookup, field);
      if (!key || !value) {
        continue;
      }

      const date = new Date(value);
      if (!Number.isNaN(date.valueOf()) && (!latest || date > latest)) {
        latest = date;
      }
    }
  }

  return latest ? latest.toISOString() : null;
}

export const __test__ = {
  ensureString,
  toSlug,
  tryParseJson,
  ensureArray,
  normalizeAddress,
  normalizePhones,
  normalizeTableId,
  buildTableSpecificCandidates,
  findTableSpecificValue,
  deriveSlugFromValue,
  combineRoomAndAddress
};
