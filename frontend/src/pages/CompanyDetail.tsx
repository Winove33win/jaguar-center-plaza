import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Container from '../components/layout/Container';
import { getCategories, getCompany, type CategorySummary } from '../api/companies';
import { useSEO } from '../hooks/useSEO';

const CATEGORY_IMAGES: Record<string, string> = {
  administracao: '/Fachada.jpg',
  advocacia: '/Fachada3.jpg',
  beleza: '/Fachada4.jpg',
  contabilidade: '/Fachada5.jpg',
  imobiliaria: '/Fachada2.jpg',
  industrias: '/Fachada6.jpg',
  lojas: '/Fachada7.jpg',
  saude: '/Fachada8.jpg',
  servicos_publicos: '/Fachada9.jpg'
};

function normalizePhone(value: string | null) {
  if (!value) return null;
  return value.replace(/[^+\d]/g, '');
}

export default function CompanyDetailPage() {
  const { categorySlug = '', companySlug = '' } = useParams();

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    isError: isCategoriesError
  } = useQuery({ queryKey: ['company-categories'], queryFn: getCategories });

  const category = useMemo<CategorySummary | undefined>(
    () => categoriesData?.find((item) => item.slug === categorySlug),
    [categoriesData, categorySlug]
  );

  const {
    data: company,
    isLoading: isLoadingCompany,
    isError: isCompanyError
  } = useQuery({
    queryKey: ['company', categorySlug, companySlug],
    queryFn: () => getCompany({ category: categorySlug, id: companySlug }),
    enabled: Boolean(categorySlug && companySlug)
  });

  useSEO({
    title: company
      ? `${company.titulo ?? 'Empresa'} · ${category?.label ?? 'Empresas'} · Jaguar Center Plaza`
      : 'Empresa não encontrada · Jaguar Center Plaza',
    description:
      company?.descricao ||
      'Conheça as empresas que fazem parte do Jaguar Center Plaza e seus diferenciais de atendimento.',
    canonical: company ? `https://www.jaguarcenterplaza.com.br/empresas/${categorySlug}/${companySlug}` : undefined
  });

  const heroImage = CATEGORY_IMAGES[categorySlug] || '/Fachada5.jpg';

  const phones = useMemo(() => {
    const values = [] as string[];
    if (company?.celular) {
      values.push(company.celular);
    }
    return values;
  }, [company?.celular]);

  const emails = useMemo(() => {
    const values = [] as string[];
    if (company?.email) {
      values.push(company.email);
    }
    return values;
  }, [company?.email]);

  const isLoading = isLoadingCategories || isLoadingCompany;
  const hasError = isCategoriesError || isCompanyError;
  const showNotFound = !isLoading && !hasError && (!company || !category);

  return (
    <div className="space-y-16 pb-20">
      <section className="relative overflow-hidden bg-primary-900 text-white">
        <div className="absolute inset-0">
          <img src={heroImage} alt={company?.titulo || 'Empresa'} className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-800/90 to-primary-700/80" aria-hidden />
        </div>
        <Container className="relative z-10 space-y-6 py-24">
          <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent-200">
            <Link to="/" className="transition hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link to="/empresas" className="transition hover:text-white">
              Empresas
            </Link>
            {category && (
              <>
                <span>/</span>
                <Link to={`/empresas/${category.slug}`} className="transition hover:text-white">
                  {category.label}
                </Link>
              </>
            )}
            {company && (
              <>
                <span>/</span>
                <span className="text-white/80">{company.titulo ?? 'Empresa'}</span>
              </>
            )}
          </nav>
          <div className="space-y-4">
            {company?.logo && (
              <img src={company.logo} alt={company.titulo ?? 'Empresa'} className="h-16 w-auto" />
            )}
            <h1 className="text-4xl font-bold sm:text-5xl">{company?.titulo || 'Empresa não encontrada'}</h1>
            {company?.sala && (
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-200">Sala {company.sala}</p>
            )}
            {company?.descricao && <p className="max-w-3xl text-base text-white/85 sm:text-lg">{company.descricao}</p>}
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-8">
            {isLoading && (
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <p className="text-sm text-[#4f5d55]">Carregando informações da empresa...</p>
              </div>
            )}

            {hasError && (
              <div className="rounded-3xl bg-red-50 p-8 shadow-lg">
                <p className="text-sm text-red-600">Não foi possível carregar os detalhes desta empresa no momento.</p>
              </div>
            )}

            {company?.descricao && (
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h2 className="text-2xl font-semibold text-primary-800">Sobre a empresa</h2>
                <p className="mt-3 text-base leading-relaxed text-[#4f5d55]">{company.descricao}</p>
              </div>
            )}

            {showNotFound && (
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h2 className="text-2xl font-semibold text-primary-800">Empresa não encontrada</h2>
                <p className="mt-2 text-sm text-[#4f5d55]">
                  A empresa que você procurou pode ter sido removida ou está indisponível no momento.
                </p>
                <div className="mt-6">
                  <Link to="/empresas" className="inline-flex items-center rounded-full bg-primary-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-600">
                    Ver todas as empresas
                  </Link>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <h2 className="text-xl font-semibold text-primary-800">Informações de contato</h2>
              <div className="mt-4 space-y-4 text-sm text-[#4f5d55]">
                {phones.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500">Telefone</p>
                    <ul className="mt-2 space-y-1">
                      {phones.map((phone) => (
                        <li key={phone}>
                          <a href={`tel:${normalizePhone(phone)}`} className="font-medium text-primary-700 hover:text-accent-500">
                            {phone}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {emails.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500">E-mail</p>
                    <ul className="mt-2 space-y-1">
                      {emails.map((email) => (
                        <li key={email}>
                          <a href={`mailto:${email}`} className="font-medium text-primary-700 hover:text-accent-500">
                            {email}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {company?.endereco && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500">Endereço</p>
                    <p className="mt-2 font-medium text-primary-700">{company.endereco}</p>
                  </div>
                )}
                {company?.logo && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500">Identidade visual</p>
                    <img src={company.logo} alt={company.titulo ?? 'Logo da empresa'} className="mt-3 h-16 w-auto" />
                  </div>
                )}
              </div>
            </div>

            {company?.createdAt && (
              <div className="rounded-3xl bg-white p-6 text-xs text-[#4f5d55] shadow-lg">
                <p>
                  <span className="font-semibold text-primary-700">Cadastrada em:</span> {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                </p>
                {company.updatedAt && (
                  <p>
                    <span className="font-semibold text-primary-700">Atualizada em:</span> {new Date(company.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            )}
          </aside>
        </Container>
      </section>
    </div>
  );
}
