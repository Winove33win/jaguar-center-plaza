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

export async function getCategories(): Promise<CategorySummary[]> {
  const { data } = await client.get<CategorySummary[]>('/categories');
  return data;
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

  const { data } = await client.get<CompanyListResponse>('/companies', { params });
  return data;
}

export async function getCompany({ category, id }: { category: string; id: string | number }): Promise<CompanyRecord> {
  const { data } = await client.get<CompanyRecord>(`/companies/${category}/${id}`);
  return data;
}
