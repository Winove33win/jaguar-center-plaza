import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Container from '../components/layout/Container';
import { getCategories, getCompanies, type CategorySummary, type CompanyRecord } from '../api/companies';
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

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  administracao:
    'Empresas de consultoria, gestão administrativa e serviços corporativos preparados para apoiar sua operação.',
  advocacia:
    'Advogados e escritórios especializados em diversas áreas do direito para atender empresas e pessoas físicas.',
  beleza:
    'Salões, barbearias e clínicas de estética que oferecem experiências de beleza e bem-estar.',
  contabilidade:
    'Serviços contábeis, fiscais e financeiros para manter a organização da sua empresa em dia.',
  imobiliaria:
    'Consultorias imobiliárias e correspondentes que facilitam locações, vendas e investimentos.',
  industrias:
    'Empresas industriais e de suporte técnico que atendem às demandas produtivas da região.',
  lojas:
    'Lojas e pontos de conveniência que tornam o dia a dia no Jaguar Center Plaza mais prático.',
  saude:
    'Clínicas, consultórios e profissionais de saúde com atendimento completo e acolhedor.',
  servicos_publicos:
    'Serviços essenciais, públicos e institucionais que simplificam a rotina dos visitantes.'
};

const PAGE_SIZE = 12;

function formatCompaniesLabel(count: number) {
  if (count === 1) {
    return '1 empresa';
  }

  return `${count} empresas`;
}

export default function CompanyCategoryPage() {
  const { categorySlug = '' } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categorySlug]);

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    isError: isCategoriesError
  } = useQuery({ queryKey: ['company-categories'], queryFn: getCategories });
  const categories = categoriesData ?? [];

  const category = useMemo<CategorySummary | undefined>(
    () => categories.find((item) => item.slug === categorySlug),
    [categories, categorySlug]
  );

  const {
    data: companiesData,
    isLoading: isLoadingCompanies,
    isError: isCompaniesError
  } = useQuery({
    queryKey: ['companies', categorySlug, page, debouncedSearch],
    queryFn: () =>
      getCompanies({
        category: categorySlug,
        page,
        pageSize: PAGE_SIZE,
        q: debouncedSearch
      }),
    enabled: Boolean(categorySlug)
  });

  useSEO({
    title: category
      ? `${category.label} · Empresas no Jaguar Center Plaza`
      : 'Categorias de empresas · Jaguar Center Plaza',
    description:
      CATEGORY_DESCRIPTIONS[categorySlug ?? ''] ||
      'Descubra empresas residentes no Jaguar Center Plaza organizadas por categorias de serviços corporativos e bem-estar.'
  });

  const heroImage = CATEGORY_IMAGES[categorySlug] || '/Fachada4.jpg';
  const items = companiesData?.items ?? [];
  const total = companiesData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-16 pb-20">
      <section className="relative overflow-hidden bg-primary-900 text-white">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Setor" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-800/90 to-primary-700/80" aria-hidden />
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
                <span className="text-white/80">{category.label}</span>
              </>
            )}
          </nav>
          <div className="space-y-4">
            <p className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
              {category ? 'Empresas do setor' : 'Empresas por setor'}
            </p>
            <h1 className="text-4xl font-bold sm:text-5xl">{category ? category.label : 'Categorias de empresas'}</h1>
            <p className="max-w-3xl text-base text-white/80 sm:text-lg">
              {CATEGORY_DESCRIPTIONS[categorySlug] ||
                'Conheça as empresas presentes neste segmento no Jaguar Center Plaza.'}
            </p>
            {category && <div className="text-sm font-semibold text-accent-100">{formatCompaniesLabel(total)}</div>}
          </div>
        </Container>
      </section>

      <section>
        <Container className="space-y-8">
          <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-primary-800">Empresas cadastradas</h2>
              <p className="text-sm text-[#4f5d55]">
                Utilize a busca para encontrar empresas pelo nome ou descrição.
              </p>
            </div>
            <form
              className="flex w-full max-w-md items-center gap-3 rounded-full border border-primary-200 px-4 py-2 shadow-sm"
              onSubmit={(event) => event.preventDefault()}
            >
              <svg aria-hidden className="h-5 w-5 text-primary-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M15 15l5 5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="10" r="6" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome ou descrição"
                className="h-10 flex-1 bg-transparent text-sm outline-none"
              />
            </form>
          </div>

          {(isLoadingCategories || isLoadingCompanies) && (
            <div className="rounded-3xl bg-white p-6 text-sm text-[#4f5d55] shadow-lg">
              Carregando empresas...
            </div>
          )}

          {(isCategoriesError || isCompaniesError) && !isLoadingCompanies && (
            <div className="rounded-3xl bg-red-50 p-6 text-sm text-red-600 shadow-lg">
              Não foi possível carregar as empresas agora. Tente novamente em instantes.
            </div>
          )}

          {!isLoadingCompanies && !isCompaniesError && category && items.length === 0 && (
            <div className="rounded-3xl bg-white p-6 text-sm text-[#4f5d55] shadow-lg">
              Nenhuma empresa encontrada com os filtros selecionados.
            </div>
          )}

          {category && items.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {items.map((company: CompanyRecord, index) => {
                const identifier = company.id ?? (company.pk != null ? String(company.pk) : null);
                const key = identifier ?? `${index}-${company.titulo ?? 'empresa'}`;
                const detailPath = identifier ? `/empresas/${category.slug}/${identifier}` : null;
                return (
                  <article key={key} className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg">
                    {company.logo && (
                      <div className="flex items-center justify-center bg-primary-50 p-6">
                        <img src={company.logo} alt={company.titulo ?? 'Empresa'} className="max-h-20 object-contain" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-primary-800">{company.titulo || 'Empresa sem título'}</h3>
                        {company.descricao && <p className="text-sm text-[#4f5d55]">{company.descricao}</p>}
                      </div>
                      <div className="space-y-2 text-sm text-[#4f5d55]">
                        {company.endereco && (
                          <p>
                            <span className="font-semibold text-primary-700">Endereço:</span> {company.endereco}
                          </p>
                        )}
                        {company.sala && (
                          <p>
                            <span className="font-semibold text-primary-700">Sala:</span> {company.sala}
                          </p>
                        )}
                        {company.celular && (
                          <p>
                            <span className="font-semibold text-primary-700">Telefone:</span> {company.celular}
                          </p>
                        )}
                        {company.email && (
                          <p>
                            <span className="font-semibold text-primary-700">E-mail:</span> {company.email}
                          </p>
                        )}
                      </div>
                      <div className="mt-auto">
                        {detailPath ? (
                          <Link
                            to={detailPath}
                            className="inline-flex items-center rounded-full bg-primary-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
                          >
                            Ver detalhes
                          </Link>
                        ) : (
                          <span className="inline-flex cursor-not-allowed items-center rounded-full bg-primary-200 px-5 py-2 text-sm font-semibold text-white">
                            Detalhes indisponíveis
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {category && items.length > 0 && (
            <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-4 shadow-lg sm:flex-row sm:justify-between">
              <p className="text-sm text-[#4f5d55]">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="rounded-full border border-primary-300 px-4 py-2 text-sm font-semibold text-primary-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages}
                  className="rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-primary-400"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}

          {!category && !isLoadingCategories && !isCategoriesError && (
            <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
              <h2 className="text-2xl font-semibold text-primary-800">Categoria não encontrada</h2>
              <p className="mt-2 text-sm text-[#4f5d55]">
                A categoria que você procurou pode ter sido removida ou está indisponível no momento.
              </p>
              <div className="mt-6">
                <Link to="/empresas" className="inline-flex items-center rounded-full bg-primary-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-600">
                  Ver todas as categorias
                </Link>
              </div>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
