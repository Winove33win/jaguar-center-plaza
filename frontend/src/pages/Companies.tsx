import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Container from '../components/layout/Container';
import { fetchCategories, type CompanyCategory } from '../lib/api';
import { useSEO } from '../hooks/useSEO';

function formatCompaniesLabel(count: number | undefined) {
  if (!count || count <= 0) {
    return 'Conheça as empresas';
  }

  if (count === 1) {
    return '1 empresa';
  }

  return `${count} empresas`;
}

export default function CompaniesPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const categories = data?.categories ?? [];

  useSEO({
    title: 'Empresas por setor · Jaguar Center Plaza',
    description:
      'Explore as empresas residentes do Jaguar Center Plaza organizadas por segmentos como administração, advocacia, contabilidade e beleza.',
    canonical: 'https://www.jaguarcenterplaza.com.br/empresas'
  });

  return (
    <div className="space-y-20 pb-20">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-500 py-24 text-white">
        <div className="absolute inset-0 bg-[url('/Fachada3.jpg')] bg-cover bg-center opacity-20" aria-hidden />
        <div className="absolute inset-0 bg-primary-900/60" aria-hidden />
        <Container className="relative z-10 space-y-6">
          <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
            Jaguar Center Plaza
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">Empresas por setor</h1>
          <p className="max-w-3xl text-base text-white/80 sm:text-lg">
            Conheça os segmentos presentes no Jaguar Center Plaza e encontre empresas especializadas em administração, advocacia, contabilidade, beleza e bem-estar.
          </p>
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent-200">
            <span>Consultorias</span>
            <span>Saúde corporativa</span>
            <span>Beleza & bem-estar</span>
            <span>Serviços essenciais</span>
          </div>
        </Container>
      </section>

      <section>
        <Container className="space-y-10">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-3xl font-bold text-primary-800 sm:text-4xl">Categorias de empresas</h2>
            <p className="text-base text-[#4f5d55]">
              Explore as categorias para descobrir serviços, contatos e diferenciais de cada empresa presente no complexo.
            </p>
          </div>

          {isLoading && (
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="text-sm text-[#4f5d55]">Carregando categorias...</p>
            </div>
          )}

          {isError && !isLoading && (
            <div className="rounded-3xl bg-red-50 p-6 shadow-lg">
              <p className="text-sm text-red-600">Não foi possível carregar as categorias agora. Tente novamente em instantes.</p>
            </div>
          )}

          {!isLoading && !isError && categories.length === 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="text-sm text-[#4f5d55]">Nenhuma categoria cadastrada no momento.</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category: CompanyCategory) => {
              const slug = category.slug || category.id;
              const companiesCount = category.companies?.length ?? 0;
              const image = category.cardImage || category.heroImage || '/Fachada5.jpg';

              return (
                <article key={slug} className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-56 w-full overflow-hidden">
                    <img src={image} alt={category.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-700">
                      {formatCompaniesLabel(companiesCount)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <h3 className="text-xl font-semibold text-primary-800">{category.name}</h3>
                    <p className="flex-1 text-sm text-[#4f5d55]">{category.description}</p>
                    <Link
                      to={`/empresas/${slug}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-colors hover:text-accent-500"
                    >
                      Ver mais
                      <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>
    </div>
  );
}
