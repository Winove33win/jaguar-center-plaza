import axios from 'axios';

const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const api = axios.create({
  baseURL: baseUrl || '/api'
});

async function fetchFallbackJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Falha ao carregar fallback ${path}`);
  }
  return response.json() as Promise<T>;
}

export interface AreaRecord {
  id: string;
  name: string;
  fields: Record<string, unknown>;
}

export interface AreaItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  records: AreaRecord[];
}

export interface AreasResponse {
  items: AreaItem[];
  generatedAt?: string;
}

export interface CompanyMedia {
  url: string;
  alt?: string;
}

export interface CompanySocialLink {
  label: string;
  url: string;
  type?: 'website' | 'instagram' | 'facebook' | 'whatsapp' | 'linkedin';
}

export interface CompanySummary {
  id: string;
  slug?: string;
  name: string;
  tagline?: string;
  shortDescription?: string;
  description?: string;
  coverImage?: string;
  logo?: string;
  highlight?: boolean;
  room?: string;
  phones?: string[];
  emails?: string[];
  whatsapp?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  address?: string;
  mapsUrl?: string;
  schedule?: string;
  services?: string[];
  gallery?: CompanyMedia[];
  socialLinks?: CompanySocialLink[];
  detailPath?: string;
  listPath?: string;
}

export interface CompanyCategory {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  headline?: string;
  heroImage?: string;
  cardImage?: string;
  companies: CompanySummary[];
}

export interface CategoriesResponse {
  categories: CompanyCategory[];
  generatedAt?: string;
}

export interface LibrasLeadPayload {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
  honeypot?: string;
}

const AREAS_FALLBACK = '/assets/areas-fallback.json';
const CATEGORIES_FALLBACK = '/assets/categories-fallback.json';

export async function fetchAreas(): Promise<AreasResponse> {
  try {
    const response = await api.get<AreasResponse>('/areas');
    return response.data;
  } catch (error) {
    console.warn('Falha ao buscar áreas, usando fallback.', error);
    return fetchFallbackJson<AreasResponse>(AREAS_FALLBACK);
  }
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  try {
    const response = await api.get<CategoriesResponse>('/categories');
    return response.data;
  } catch (error) {
    console.warn('Falha ao buscar categorias, usando fallback.', error);
    return fetchFallbackJson<CategoriesResponse>(CATEGORIES_FALLBACK);
  }
}

export async function submitLibrasLead(payload: LibrasLeadPayload) {
  const body = { ...payload, source: payload.source || 'contact' };
  return api.post('/leads/libras', body);
}
