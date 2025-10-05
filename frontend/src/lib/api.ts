export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export interface CompanyCategoryResponse {
  updatedAt: string;
  categories: CompanyCategory[];
}

export interface CompanyCategory {
  id: string;
  name: string;
  description: string;
  companies: Company[];
}

export interface Company {
  id: string;
  name: string;
  summary: string;
  details: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
}

export interface SearchResponse {
  query: string;
  updatedAt: string | null;
  categories: Array<Pick<CompanyCategory, 'id' | 'name' | 'description'>>;
  companies: Array<Company & { categoryId: string; categoryName: string }>;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  companyId?: string;
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Falha ao comunicar com a API (${response.status})`);
  }

  return (await response.json()) as T;
}

export async function fetchCategories(): Promise<CompanyCategoryResponse> {
  const response = await fetch(`${API_BASE}/categories`, {
    headers: {
      Accept: 'application/json'
    }
  });

  return parseJson<CompanyCategoryResponse>(response);
}

export async function submitContact(payload: ContactPayload) {
  const response = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return parseJson<{ message: string }>(response);
}

export async function searchDirectory(query: string): Promise<SearchResponse> {
  const searchParams = new URLSearchParams({ q: query });
  const response = await fetch(`${API_BASE}/search?${searchParams.toString()}`, {
    headers: {
      Accept: 'application/json'
    }
  });

  return parseJson<SearchResponse>(response);
}
