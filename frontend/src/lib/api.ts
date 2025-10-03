import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
});

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

export async function fetchCategories() {
  const response = await api.get<CompanyCategoryResponse>('/api/categories');
  return response.data;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  companyId?: string;
}

export async function submitContact(payload: ContactPayload) {
  const response = await api.post('/api/contact', payload);
  return response.data;
}

export default api;
