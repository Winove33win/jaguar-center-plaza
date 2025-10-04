import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
});

export type TableName =
  | 'administracao'
  | 'advocacia'
  | 'beleza'
  | 'contabilidade'
  | 'imobiliaria'
  | 'industrias'
  | 'lojas';

const TABLE_METADATA: Record<
  TableName,
  {
    name: string;
    description: string;
  }
> = {
  administracao: {
    name: 'Administração',
    description: 'Empresas de gestão, consultorias corporativas e soluções administrativas para negócios.'
  },
  advocacia: {
    name: 'Advocacia',
    description: 'Escritórios jurídicos e especialistas que atendem demandas consultivas e contenciosas.'
  },
  beleza: {
    name: 'Beleza & Bem-estar',
    description: 'Salões, barbearias e centros de estética focados em cuidados pessoais e bem-estar.'
  },
  contabilidade: {
    name: 'Contabilidade & Finanças',
    description: 'Consultorias e escritórios contábeis que apoiam a saúde financeira de empresas.'
  },
  imobiliaria: {
    name: 'Imobiliárias & Condomínios',
    description: 'Empresas que atuam em locação, venda e administração de imóveis e condomínios.'
  },
  industrias: {
    name: 'Indústrias & Serviços Técnicos',
    description: 'Fornecedores técnicos e indústrias que movimentam a cadeia de produção local.'
  },
  lojas: {
    name: 'Lojas & Conveniência',
    description: 'Comércios, alimentação e serviços rápidos para o dia a dia de quem visita o centro.'
  }
};

const COMPANY_FIELD_CANDIDATES = {
  id: ['id', 'uuid', 'pk'],
  name: ['titulo', 'nome', 'name', 'empresa', 'razao_social', 'fantasia'],
  summary: ['resumo', 'descricao_curta', 'descricao_resumida', 'descricao', 'texto_curto', 'headline'],
  details: ['detalhes', 'descricao_completa', 'informacoes', 'texto', 'sobre', 'descricao'],
  phone: ['telefone', 'celular', 'whatsapp', 'fone', 'contato', 'contato_telefone'],
  email: ['email', 'e_mail', 'contato_email'],
  address: ['endereco', 'endereco_completo', 'localizacao', 'local', 'address', 'sala'],
  hours: ['horario', 'horario_funcionamento', 'funcionamento', 'horarios', 'atendimento']
} as const;

const DATE_FIELD_CANDIDATES = [
  'updated_date',
  'updated_at',
  'ultima_atualizacao',
  'modified_at',
  'created_date',
  'created_at',
  'data_criacao'
];

function ensureString(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return fallback;
}

function pickValue(row: Record<string, unknown>, candidates: readonly string[], fallback = ''): string {
  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(row, candidate)) {
      const result = ensureString(row[candidate], fallback);
      if (result) {
        return result;
      }
    }
  }

  return fallback;
}

function humanizeTableName(table: string) {
  return table
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toCompany(table: TableName, row: Record<string, unknown>, index: number) {
  const idCandidate = pickValue(row, COMPANY_FIELD_CANDIDATES.id, `${table}-${index + 1}`);
  const metadata = TABLE_METADATA[table];

  const name = pickValue(row, COMPANY_FIELD_CANDIDATES.name, metadata?.name ?? humanizeTableName(table));
  const summary = pickValue(row, COMPANY_FIELD_CANDIDATES.summary, '');
  const details = pickValue(row, COMPANY_FIELD_CANDIDATES.details, summary);
  const phone = pickValue(row, COMPANY_FIELD_CANDIDATES.phone, '');
  const email = pickValue(row, COMPANY_FIELD_CANDIDATES.email, '');
  const address = pickValue(row, COMPANY_FIELD_CANDIDATES.address, '');
  const hours = pickValue(row, COMPANY_FIELD_CANDIDATES.hours, '');

  return {
    id: idCandidate || `${table}-${index + 1}`,
    name,
    summary,
    details,
    phone,
    email,
    address,
    hours
  } satisfies Company;
}

function extractLatestDate(rows: Array<Record<string, unknown>>): string | null {
  let latest: Date | null = null;

  for (const row of rows) {
    for (const field of DATE_FIELD_CANDIDATES) {
      if (!Object.prototype.hasOwnProperty.call(row, field)) {
        continue;
      }

      const value = row[field];
      if (!value) {
        continue;
      }

      const date = new Date(value as string);
      if (!Number.isNaN(date.valueOf())) {
        if (!latest || date > latest) {
          latest = date;
        }
      }
    }
  }

  return latest ? latest.toISOString() : null;
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

export interface CompanyCategory {
  id: TableName;
  name: string;
  description: string;
  companies: Company[];
}

export interface CompanyCategoryResponse {
  updatedAt: string;
  categories: CompanyCategory[];
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  companyId?: string;
}

export async function getHealth() {
  const response = await api.get<{ ok: boolean; time: string }>('/health');
  return response.data;
}

export async function getTables() {
  const response = await api.get<{ tables: TableName[] }>('/tables');
  return response.data.tables;
}

type MaybePaginatedResponse<Row> =
  | Row[]
  | {
      data?: Row[];
      pagination?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
      } | null;
    };

function ensureRowArray<Row>(payload: MaybePaginatedResponse<Row>): Row[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

export async function getList(table: TableName) {
  const response = await api.get<MaybePaginatedResponse<Record<string, unknown>>>(`/${table}`);
  return ensureRowArray(response.data);
}

export async function getById(table: TableName, id: string) {
  const response = await api.get<Record<string, unknown>>(`/${table}/${encodeURIComponent(id)}`);
  return response.data;
}

export async function fetchCategories(): Promise<CompanyCategoryResponse> {
  const tables = await getTables();

  const categories = await Promise.all(
    tables.map(async (table) => {
      const rows = await getList(table);
      const companies = rows.map((row, index) => toCompany(table, row, index));
      const metadata = TABLE_METADATA[table] ?? {
        name: humanizeTableName(table),
        description: ''
      };

      return {
        id: table,
        name: metadata.name,
        description: metadata.description,
        companies,
        latestUpdate: extractLatestDate(rows)
      };
    })
  );

  const latestUpdate = categories
    .map((category) => category.latestUpdate)
    .filter((value): value is string => Boolean(value))
    .sort()
    .reverse()[0];

  return {
    updatedAt: latestUpdate ?? new Date().toISOString(),
    categories: categories.map(({ latestUpdate: _ignored, ...category }) => category)
  };
}

export async function submitContact(payload: ContactPayload) {
  const response = await api.post('/contact', payload);
  return response.data;
}

export default api;
