import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Container from 'components/layout/Container';
import { fetchCategories, type CompanyCategory } from 'lib/api';
import { useSEO } from 'hooks/useSEO';

export default function CompaniesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  useSEO({
    title: 'Empresas — Jaguar Center Plaza',
    description:
      'Confira a lista completa de empresas presentes no Jaguar Center Plaza, organizada por categorias como administração, advocacia, beleza, saúde, serviços públicos e mais.',
    canonical: 'https://www.jaguarcenterplaza.com.br/empresas',
    jsonLd: data
      ? data.categories.map((category) => ({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: category.name,
          description: category.description,
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: category.name,
            itemListElement: category.companies.map((company, index) => ({
              '@type': 'OfferCatalog',
              position: index + 1,
              name: company.name,
              description: company.summary,
              url: `https://www.jaguarcenterplaza.com.br/empresas#${company.id}`
            }))
          }
        }))
      : undefined
  });

  const categories = data?.categories ?? [];

  const filteredCategories = useMemo(() => {
    if (selectedCategory === 'todas') {
      return categories;
    }
    return categories.filter((category) => category.id === selectedCategory);
  }, [categories, selectedCategory]);

  return (
    <section>
      <Container>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">Empresas</p>
          <h1 className="section-title">Cada necessidade, uma solução no Jaguar Center Plaza</h1>
          <p className="section-subtitle">
            Explore o nosso diretório e descubra os serviços disponíveis em cada categoria. A curadoria é pensada
            para facilitar a vida de quem trabalha, empreende e visita o complexo diariamente.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSelectedCategory('todas')}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              selectedCategory === 'todas'
                ? 'border-primary-500 bg-primary-500 text-white shadow'
                : 'border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:text-primary-600'
            }`}
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selectedCategory === category.id
                  ? 'border-primary-500 bg-primary-500 text-white shadow'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:text-primary-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="mt-12 space-y-16">
          {isLoading && <p className="text-sm text-slate-500">Carregando empresas...</p>}
          {!isLoading && filteredCategories.length === 0 && (
            <p className="text-sm text-slate-500">Não encontramos empresas para essa categoria.</p>
          )}
          {filteredCategories.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))}
        </div>
      </Container>
    </section>
  );
}

interface CategorySectionProps {
  category: CompanyCategory;
}

function CategorySection({ category }: CategorySectionProps) {
  return (
    <section aria-labelledby={`category-${category.id}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id={`category-${category.id}`} className="text-2xl font-semibold text-slate-900">
            {category.name}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{category.description}</p>
        </div>
        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
          {category.companies.length} empresas
        </span>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {category.companies.map((company) => (
          <article
            key={company.id}
            id={company.id}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-100/60 blur-3xl transition group-hover:bg-primary-200/60" aria-hidden />
            <div className="relative space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{company.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{company.summary}</p>
              </div>
              <p className="text-sm text-slate-600">{company.details}</p>
              <dl className="grid gap-2 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <dt className="font-semibold text-slate-700">Telefone:</dt>
                  <dd>{company.phone}</dd>
                </div>
                <div className="flex items-start gap-2">
                  <dt className="font-semibold text-slate-700">E-mail:</dt>
                  <dd>
                    <a href={`mailto:${company.email}`} className="text-primary-600">
                      {company.email}
                    </a>
                  </dd>
                </div>
                <div className="flex items-start gap-2">
                  <dt className="font-semibold text-slate-700">Localização:</dt>
                  <dd>{company.address}</dd>
                </div>
                <div className="flex items-start gap-2">
                  <dt className="font-semibold text-slate-700">Horário:</dt>
                  <dd>{company.hours}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
