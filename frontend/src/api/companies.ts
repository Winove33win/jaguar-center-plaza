import axios from 'axios';

const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const client = axios.create({
  baseURL: baseUrl || '/api'
});

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
  pk: number | null;
  id: string | null;
  titulo: string | null;
  descricao: string | null;
  endereco: string | null;
  celular: string | null;
  email: string | null;
  sala: string | null;
  logo: string | null;
  galeria: string[];
  midia: string[];
  createdAt: string | null;
  updatedAt: string | null;
};

export type CompanyListResponse = {
  items: CompanyRecord[];
  page: number;
  pageSize: number;
  total: number;
};

type CompanyRecordApi = Partial<Omit<CompanyRecord, 'galeria' | 'midia'>> & {
  galeria?: string[] | null;
  midia?: string[] | null;
};

type CompanyListResponseApi = {
  items: CompanyRecordApi[];
  page: number;
  pageSize: number;
  total: number;
};

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value !== 'string') {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? String(value) : null;
    }

    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeStringArray(values?: string[] | null): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

function normalizeCompanyRecord(record: CompanyRecordApi): CompanyRecord {
  return {
    pk:
      typeof record.pk === 'number'
        ? Number.isFinite(record.pk)
          ? record.pk
          : null
        : typeof record.pk === 'string' && record.pk.trim().length > 0 && !Number.isNaN(Number(record.pk))
          ? Number(record.pk)
          : null,
    id: toNullableString(record.id),
    titulo: toNullableString(record.titulo),
    descricao: toNullableString(record.descricao),
    endereco: toNullableString(record.endereco),
    celular: toNullableString(record.celular),
    email: toNullableString(record.email),
    sala: toNullableString(record.sala),
    logo: toNullableString(record.logo),
    galeria: normalizeStringArray(record.galeria),
    midia: normalizeStringArray(record.midia),
    createdAt: toNullableString(record.createdAt ?? null),
    updatedAt: toNullableString(record.updatedAt ?? null)
  };
}

export async function getCategories(): Promise<CategorySummary[]> {
  const { data } = await client.get<CategorySummary[]>('/categories');
  return data.map((category) => ({
    slug: category.slug,
    label: category.label,
    total: category.total
  }));
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

  const { data } = await client.get<CompanyListResponseApi>('/companies', { params });

  return {
    items: data.items.map((item) => normalizeCompanyRecord(item)),
    page: data.page,
    pageSize: data.pageSize,
    total: data.total
  };
}

export async function getCompany({ category, id }: { category: string; id: string | number }): Promise<CompanyRecord> {
  const { data } = await client.get<CompanyRecordApi>(`/companies/${category}/${id}`);
  return normalizeCompanyRecord(data);
}
