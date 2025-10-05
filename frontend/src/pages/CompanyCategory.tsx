import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Container from '../components/layout/Container';
import { fetchCategories, type CompanyCategory as CompanyCategoryType, type CompanySummary } from '../lib/api';
import { useSEO } from '../hooks/useSEO';

function formatCompaniesLabel(count: number | undefined) {
  if (!count || count <= 0) {
    return 'Empresas disponíveis';
  }

  if (count === 1) {
    return '1 empresa';
  }

  return `${count} empresas`;
}

export default function CompanyCategoryPage() {
  const { categorySlug = '' } = useParams();
  const { data, isLoading, isError } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const categories = data?.categories ?? [];

  const category = useMemo<CompanyCategoryType | undefined>(
    () => categories.find((item) => (item.slug || item.id) === categorySlug),
    [categories, categorySlug]
  );

  useSEO({
    title: category
      ? `${category.name} · Empresas no Jaguar Center Plaza`
      : 'Categorias de empresas · Jaguar Center Plaza',
    description:
      category?.description ||
      'Descubra empresas residentes no Jaguar Center Plaza organizadas por categorias de serviços corporativos e bem-estar.'
  });

  const heroImage = category?.heroImage || '/Fachada4.jpg';
  const companies = category?.companies ?? [];

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
                <span className="text-white/80">{category.name}</span>
              </>
            )}
          </nav>
          <div className="space-y-4">
            <p className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
              {category ? category.headline || 'Empresas do setor' : 'Empresas por setor'}
            </p>
            <h1 className="text-4xl font-bold sm:text-5xl">{category ? category.name : 'Categorias de empresas'}</h1>
            {category?.description && <p className="max-w-3xl text-base text-white/80 sm:text-lg">{category.description}</p>}
            <div className="text-sm font-semibold text-accent-100">{formatCompaniesLabel(companies.length)}</div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="space-y-8">
          {isLoading && (
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="text-sm text-[#4f5d55]">Carregando empresas...</p>
            </div>
          )}

          {isError && !isLoading && (
            <div className="rounded-3xl bg-red-50 p-6 shadow-lg">
              <p className="text-sm text-red-600">Não foi possível carregar as empresas agora. Tente novamente em instantes.</p>
            </div>
          )}

          {!isLoading && !isError && !category && (
            <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
              <h2 className="text-2xl font-semibold text-primary-800">Categoria não encontrada</h2>
              <p className="mt-2 text-sm text-[#4f5d55]">A categoria que você procurou pode ter sido removida ou está indisponível no momento.</p>
              <div className="mt-6">
                <Link to="/empresas" className="inline-flex items-center rounded-full bg-primary-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-600">
                  Ver todas as categorias
                </Link>
              </div>
            </div>
          )}

          {category && companies.length === 0 && !isLoading && !isError && (
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="text-sm text-[#4f5d55]">Ainda não há empresas cadastradas nesta categoria.</p>
            </div>
          )}

          {category && companies.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {companies.map((company: CompanySummary) => {
                const companySlug = company.slug || company.id;
                const image = company.coverImage || category.heroImage || '/Fachada5.jpg';

                return (
                  <article key={companySlug} className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg">
                    <div className="relative h-48 w-full overflow-hidden">
                      <img src={image} alt={company.name} className="h-full w-full object-cover" />
                      {company.tagline && (
                        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-700">
                          {company.tagline}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <div className="space-y-1">
                        <h2 className="text-xl font-semibold text-primary-800">{company.name}</h2>
                        {company.shortDescription && <p className="text-sm text-[#4f5d55]">{company.shortDescription}</p>}
                      </div>
                      <div className="mt-auto">
                        <Link
                          to={`/empresas/${category.slug || category.id}/${companySlug}`}
                          className="inline-flex items-center rounded-full bg-primary-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
                        >
                          Saiba mais
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
