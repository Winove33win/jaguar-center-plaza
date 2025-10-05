import { COMPANY_CATEGORIES } from '../config/company-categories.js';
import { query } from '../database/pool.js';

const COMPANY_FIELD_CANDIDATES = {
  id: ['id', 'uuid', 'pk'],
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
  highlight: ['destaque', 'highlight']
};

const DATE_FIELD_CANDIDATES = [
  'updated_date',
  'updated_at',
  'ultima_atualizacao',
  'modified_at',
  'created_date',
  'created_at',
  'data_criacao'
];

function getFirstExistingKey(row, candidates) {
  return candidates.find((key) => Object.prototype.hasOwnProperty.call(row, key));
}

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

function pickFirst(row, candidates, fallback = '') {
  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(row, candidate)) {
      const value = ensureString(row[candidate], fallback);
      if (value) {
        return value;
      }
    }
  }

  return fallback;
}

function pickFirstValue(row, candidates) {
  for (const candidate of candidates) {
    if (!Object.prototype.hasOwnProperty.call(row, candidate)) {
      continue;
    }

    const value = row[candidate];

    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === 'string') {
      const normalized = ensureString(value, '');
      if (normalized) {
        return { key: candidate, value };
      }

      continue;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        return { key: candidate, value };
      }

      continue;
    }

    return { key: candidate, value };
  }

  return { key: null, value: null };
}

function pickList(row, candidates) {
  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(row, candidate)) {
      const value = row[candidate];
      const list = ensureArray(value);
      if (list.length) {
        return list;
      }
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
          return { url: item };
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

function extractLatestDate(rows) {
  let latest = null;

  for (const row of rows) {
    for (const field of DATE_FIELD_CANDIDATES) {
      if (!Object.prototype.hasOwnProperty.call(row, field)) {
        continue;
      }

      const value = row[field];
      if (!value) {
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

function normalizePhones(phones) {
  return [...new Set(phones.map((phone) => phone.trim()).filter(Boolean))];
}

async function fetchRowsForCategory(config) {
  const conditions = [];
  const params = {};

  if (config.statusColumn) {
    conditions.push(`\`${config.statusColumn}\` = :status`);
    params.status = 'PUBLISHED';
  }

  if (config.publishDateColumn) {
    conditions.push(`(\`${config.publishDateColumn}\` IS NULL OR \`${config.publishDateColumn}\` <= UTC_TIMESTAMP())`);
  }

  if (config.unpublishDateColumn) {
    conditions.push(`(\`${config.unpublishDateColumn}\` IS NULL OR \`${config.unpublishDateColumn}\` > UTC_TIMESTAMP())`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const tableName = config.table || config.id;
  const sql = `SELECT * FROM \`${tableName}\` ${whereClause} LIMIT 500`;

  try {
    const rows = await query(sql, params);
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error(`Falha ao consultar a tabela ${tableName}`, error);
    return [];
  }
}

function mapRowToCompany(tableId, row, index) {
  const fallbackId = `${tableId}-${index + 1}`;
  const id = pickFirst(row, COMPANY_FIELD_CANDIDATES.id, fallbackId);
  const name = pickFirst(row, COMPANY_FIELD_CANDIDATES.name, id);
  const slugCandidate = pickFirst(row, COMPANY_FIELD_CANDIDATES.slug, '');
  const slug = toSlug(slugCandidate || name, toSlug(id, fallbackId));

  const phones = pickList(row, COMPANY_FIELD_CANDIDATES.phone);
  const emails = pickList(row, COMPANY_FIELD_CANDIDATES.email);

  const galleryKey = getFirstExistingKey(row, COMPANY_FIELD_CANDIDATES.gallery);
  const highlightKey = getFirstExistingKey(row, COMPANY_FIELD_CANDIDATES.highlight);

  const { value: addressValue } = pickFirstValue(row, COMPANY_FIELD_CANDIDATES.address);

  const company = {
    id,
    slug,
    name,
    tagline: pickFirst(row, COMPANY_FIELD_CANDIDATES.tagline, ''),
    shortDescription: pickFirst(row, COMPANY_FIELD_CANDIDATES.shortDescription, ''),
    description: pickFirst(row, COMPANY_FIELD_CANDIDATES.description, ''),
    phones: normalizePhones(phones),
    emails,
    whatsapp: pickFirst(row, COMPANY_FIELD_CANDIDATES.whatsapp, ''),
    website: pickFirst(row, COMPANY_FIELD_CANDIDATES.website, ''),
    instagram: pickFirst(row, COMPANY_FIELD_CANDIDATES.instagram, ''),
    facebook: pickFirst(row, COMPANY_FIELD_CANDIDATES.facebook, ''),
    linkedin: pickFirst(row, COMPANY_FIELD_CANDIDATES.linkedin, ''),
    address: normalizeAddress(addressValue ?? ''),
    mapsUrl: pickFirst(row, COMPANY_FIELD_CANDIDATES.mapsUrl, ''),
    schedule: pickFirst(row, COMPANY_FIELD_CANDIDATES.schedule, ''),
    services: pickList(row, COMPANY_FIELD_CANDIDATES.services),
    gallery: parseGallery(galleryKey ? row[galleryKey] : null),
    logo: pickFirst(row, COMPANY_FIELD_CANDIDATES.logo, ''),
    coverImage: pickFirst(row, COMPANY_FIELD_CANDIDATES.coverImage, ''),
    highlight: highlightKey ? toBoolean(row[highlightKey]) : false
  };

  company.socialLinks = buildSocialLinks(company);

  return company;
}

export async function fetchCompanyCategories() {
  const categories = [];
  const categoryDates = [];

  for (const category of COMPANY_CATEGORIES) {
    const rows = await fetchRowsForCategory(category);
    const companies = rows.map((row, index) => mapRowToCompany(category.id, row, index));
    const latestUpdate = extractLatestDate(rows);

    if (latestUpdate) {
      categoryDates.push(latestUpdate);
    }

    categories.push({
      id: category.id,
      slug: category.id,
      name: category.name,
      description: category.description,
      companies,
      generatedAt: latestUpdate || null
    });
  }

  categoryDates.sort();
  const generatedAt = categoryDates.length ? categoryDates[categoryDates.length - 1] : new Date().toISOString();

  return { categories, generatedAt };
}

export const __test__ = {
  mapRowToCompany,
  normalizeAddress,
  pickFirstValue
};
