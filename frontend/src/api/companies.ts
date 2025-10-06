import axios from 'axios';

const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const client = axios.create({
  baseURL: baseUrl || '/api'
});

const FALLBACK_PATH = '/assets/categories-fallback.json';

type FallbackCompany = {
  id?: string | number;
  slug?: string;
  name?: string;
  tagline?: string;
  shortDescription?: string;
  description?: string;
  phones?: string[];
  emails?: string[];
  whatsapp?: string;
  address?: string;
  logo?: string;
};

type FallbackCategory = {
  id?: string;
  slug?: string;
  name?: string;
  companies?: FallbackCompany[];
};

type FallbackResponse = {
  categories?: FallbackCategory[];
};

export type CategorySummary = {
  slug: string;
  label: string;
  total: number;
};

export type CompanyListParams = {
  category: string;
  page?: number;
  pageSize?: number;
  q?: string;
};

export type CompanyRecord = {
  id: string | number | null;
  titulo: string | null;
  descricao: string | null;
  endereco: string | null;
  celular: string | null;
  email: string | null;
  sala: string | null;
  logo: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CompanyListResponse = {
  items: CompanyRecord[];
  page: number;
  pageSize: number;
  total: number;
};

let fallbackDataPromise: Promise<FallbackResponse> | null = null;

async function loadFallbackData(): Promise<FallbackResponse> {
  if (!fallbackDataPromise) {
    fallbackDataPromise = fetch(FALLBACK_PATH, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Falha ao carregar fallback ${FALLBACK_PATH}`);
        }
        return response.json() as Promise<FallbackResponse>;
      })
      .catch((error) => {
        fallbackDataPromise = null;
        throw error;
      });
  }

  return fallbackDataPromise;
}

function labelFromSlug(slug: string) {
  return slug
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toCategorySummary(category: FallbackCategory): CategorySummary | null {
  const slug = String(category.slug || category.id || '').trim();
  if (!slug) {
    return null;
  }

  const label = category.name?.trim() || labelFromSlug(slug);
  const total = category.companies?.length ?? 0;

  return { slug, label, total };
}

function extractRoom(address: string | undefined): string | null {
  if (!address) {
    return null;
  }

  const match = address.match(/sala\s+([\wº]+)/i);
  if (!match) {
    return null;
  }

  return match[1] ? match[1].toUpperCase() : match[0];
}

function toCompanyRecord(company: FallbackCompany): CompanyRecord {
  const titulo = company.name?.trim() || company.slug?.trim() || null;
  const descriptions = [company.shortDescription, company.description, company.tagline]
    .map((item) => (item?.trim() ? item.trim() : ''))
    .filter((item) => item.length > 0);
  const descricao = descriptions[0] ?? null;
  const address = company.address?.trim() || null;
  const phones = Array.isArray(company.phones) ? company.phones : [];
  const emails = Array.isArray(company.emails) ? company.emails : [];
  const celular = phones.find((phone) => phone && phone.trim())?.trim() || company.whatsapp?.trim() || null;
  const email = emails.find((value) => value && value.trim())?.trim() || null;

  return {
    id: company.id ?? company.slug ?? null,
    titulo,
    descricao,
    endereco: address,
    celular,
    email,
    sala: extractRoom(address || undefined),
    logo: company.logo?.trim() || null,
    createdAt: null,
    updatedAt: null
  };
}

function normalizeSearch(value: string | undefined) {
  return value ? value.trim().toLowerCase() : '';
}

function matchesSearch(company: FallbackCompany, term: string) {
  if (!term) {
    return true;
  }

  const haystack = [company.name, company.shortDescription, company.description, company.tagline, company.slug, company.address]
    .map((value) => value?.toLowerCase() ?? '')
    .join(' ');

  return haystack.includes(term);
}

function sanitizePage(value: number | undefined, fallback: number) {
  const parsed = typeof value === 'number' ? Number(value) : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
}

function sanitizePageSize(value: number | undefined, fallback: number) {
  const parsed = typeof value === 'number' ? Number(value) : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(50, Math.floor(parsed));
}

async function getFallbackCategories(): Promise<CategorySummary[]> {
  try {
    const data = await loadFallbackData();
    return (data.categories ?? [])
      .map((category) => toCategorySummary(category))
      .filter((category): category is CategorySummary => Boolean(category));
  } catch (error) {
    console.error('Falha ao carregar categorias de fallback', error);
    return [];
  }
}

async function getFallbackCompanies(params: CompanyListParams): Promise<CompanyListResponse> {
  const data = await loadFallbackData();
  const slug = String(params.category || '').toLowerCase();
  const categories = data.categories ?? [];
  const category = categories.find((item) => String(item.slug || item.id || '').toLowerCase() === slug);

  if (!category) {
    return {
      items: [],
      page: 1,
      pageSize: sanitizePageSize(params.pageSize, 12),
      total: 0
    };
  }

  const searchTerm = normalizeSearch(params.q);
  const companies = (category.companies ?? []).filter((company) => matchesSearch(company, searchTerm));

  const page = sanitizePage(params.page, 1);
  const pageSize = sanitizePageSize(params.pageSize, 12);
  const start = (page - 1) * pageSize;
  const paginated = companies.slice(start, start + pageSize).map((company) => toCompanyRecord(company));

  return {
    items: paginated,
    page,
    pageSize,
    total: companies.length
  };
}

async function getFallbackCompanyDetail({ category, id }: { category: string; id: string | number }): Promise<CompanyRecord> {
  const data = await loadFallbackData();
  const slug = String(category || '').toLowerCase();
  const categories = data.categories ?? [];
  const selectedCategory = categories.find((item) => String(item.slug || item.id || '').toLowerCase() === slug);

  if (!selectedCategory) {
    throw new Error('Categoria não encontrada no fallback');
  }

  const identifier = String(id).toLowerCase();
  const company = (selectedCategory.companies ?? []).find((item) => {
    const companyId = String(item.id ?? item.slug ?? '').toLowerCase();
    return companyId === identifier;
  });

  if (!company) {
    throw new Error('Empresa não encontrada no fallback');
  }

  return toCompanyRecord(company);
}

export async function getCategories(): Promise<CategorySummary[]> {
  try {
    const { data } = await client.get<CategorySummary[]>('/categories');
    return data;
  } catch (error) {
    console.warn('Falha ao carregar categorias da API, usando fallback.', error);
    return getFallbackCategories();
  }
}

export async function getCompanies({ category, page, pageSize, q }: CompanyListParams): Promise<CompanyListResponse> {
  const params: Record<string, string | number> = { category };
  if (typeof page === 'number') {
    params.page = page;
  }
  if (typeof pageSize === 'number') {
    params.pageSize = pageSize;
  }
  if (q && q.trim()) {
    params.q = q.trim();
  }

  try {
    const { data } = await client.get<CompanyListResponse>('/companies', { params });
    return data;
  } catch (error) {
    console.warn('Falha ao carregar empresas da API, usando fallback.', error);
    return getFallbackCompanies({ category, page, pageSize, q });
  }
}

export async function getCompany({ category, id }: { category: string; id: string | number }): Promise<CompanyRecord> {
  try {
    const { data } = await client.get<CompanyRecord>(`/companies/${category}/${id}`);
    return data;
  } catch (error) {
    console.warn('Falha ao carregar detalhes da empresa na API, usando fallback.', error);
    return getFallbackCompanyDetail({ category, id });
  }
}
