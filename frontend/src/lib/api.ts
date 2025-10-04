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

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  publishedAt: string | null;
  updatedAt: string | null;
}

export interface BlogPost extends BlogPostSummary {
  content: string;
}

export interface BlogPostListResponse {
  items: BlogPostSummary[];
  pagination: Pagination;
}

export interface CaseGalleryItem {
  url: string;
  alt: string;
}

export interface CaseItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  thumbnail: string;
  tags: string[];
  gallery: CaseGalleryItem[];
  publishedAt: string | null;
  updatedAt: string | null;
}

export interface CaseListResponse {
  items: CaseItem[];
}

export interface TemplateConfigSection {
  id?: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface TemplateDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  thumbnail: string;
  features: string[];
  metadata: Record<string, unknown>;
  config: {
    previewImages?: string[];
    sections?: TemplateConfigSection[];
    [key: string]: unknown;
  };
  publishedAt: string | null;
  updatedAt: string | null;
}

export interface TemplateListResponse {
  items: TemplateDetail[];
}

export interface LibrasLeadPayload {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
  honeypot?: string;
}

const BLOG_FALLBACK = '/assets/blog-fallback.json';
const CASES_FALLBACK = '/assets/cases-fallback.json';
const TEMPLATES_FALLBACK = '/assets/templates-fallback.json';

export async function fetchBlogPosts(params: { page?: number; perPage?: number; search?: string } = {}): Promise<BlogPostListResponse> {
  try {
    const response = await api.get<BlogPostListResponse>('/blog-posts', { params });
    return response.data;
  } catch (error) {
    console.warn('Falha ao buscar posts, usando fallback.', error);
    return fetchFallbackJson<BlogPostListResponse>(BLOG_FALLBACK);
  }
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await api.get<BlogPost>(`/blog-posts/${slug}`);
    return response.data;
  } catch (error) {
    console.warn(`Falha ao buscar post ${slug}, usando fallback.`, error);
    const fallback = await fetchFallbackJson<BlogPostListResponse>(BLOG_FALLBACK);
    const match = (fallback.items as BlogPost[] | undefined)?.find((item) => item.slug === slug);
    return match ?? null;
  }
}

export async function fetchCases(): Promise<CaseListResponse> {
  try {
    const response = await api.get<CaseListResponse>('/cases');
    return response.data;
  } catch (error) {
    console.warn('Falha ao buscar cases, usando fallback.', error);
    return fetchFallbackJson<CaseListResponse>(CASES_FALLBACK);
  }
}

export async function fetchTemplates(): Promise<TemplateListResponse> {
  try {
    const response = await api.get<TemplateListResponse>('/templates');
    return response.data;
  } catch (error) {
    console.warn('Falha ao buscar templates, usando fallback.', error);
    return fetchFallbackJson<TemplateListResponse>(TEMPLATES_FALLBACK);
  }
}

export async function fetchTemplate(slug: string): Promise<TemplateDetail | null> {
  try {
    const response = await api.get<TemplateDetail>(`/templates/${slug}`);
    return response.data;
  } catch (error) {
    console.warn(`Falha ao buscar template ${slug}, usando fallback.`, error);
    const fallback = await fetchFallbackJson<TemplateListResponse>(TEMPLATES_FALLBACK);
    const match = (fallback.items as TemplateDetail[] | undefined)?.find((item) => item.slug === slug);
    return match ?? null;
  }
}

export async function submitLibrasLead(payload: LibrasLeadPayload) {
  const body = { ...payload, source: payload.source || 'templates' };
  return api.post('/leads/libras', body);
}

export interface CheckoutSessionResponse {
  id?: string;
  sessionId?: string;
  url?: string;
  publicKey?: string;
}

export async function createCheckoutSession(templateSlug: string, options?: { successUrl?: string; cancelUrl?: string }) {
  const response = await api.post<CheckoutSessionResponse>('/checkout', {
    templateSlug,
    ...options
  });
  return response.data;
}
