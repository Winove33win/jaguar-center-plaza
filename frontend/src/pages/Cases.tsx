import { useQuery } from '@tanstack/react-query';
import Container from '../components/layout/Container';
import { useSEO } from '../hooks/useSEO';
import { fetchCases } from '../lib/api';

export default function CasesPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['cases'], queryFn: fetchCases });

  useSEO({
    title: 'Cases de sucesso — Jaguar Center Plaza',
    description:
      'Histórias reais de empresas que cresceram conosco no Jaguar Center Plaza. Conheça os resultados e inspirações de cada case.',
    canonical: 'https://www.jaguarcenterplaza.com.br/cases'
  });

  const items = data?.items ?? [];

  return (
    <section className="py-16">
      <Container className="space-y-12">
        <header className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Cases</p>
          <h1 className="text-4xl font-semibold text-slate-900">Resultados que provam a força do Jaguar Center Plaza</h1>
          <p className="text-lg text-slate-600">
            Confira como marcas e profissionais aproveitaram nossa estrutura para acelerar seus negócios. Cada case reúne
            desafios, estratégias e aprendizados compartilhados pelos próprios clientes.
          </p>
        </header>

        {isLoading && <p className="text-sm text-slate-500">Carregando cases...</p>}
        {isError && !isLoading && (
          <p className="text-sm text-red-500">Não foi possível carregar os cases neste momento.</p>
        )}
        {!isLoading && items.length === 0 && !isError && (
          <p className="text-sm text-slate-500">Ainda não temos cases publicados.</p>
        )}

        <div className="grid gap-12">
          {items.map((item) => (
            <article key={item.slug} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {item.thumbnail && (
                <img src={item.thumbnail} alt="" className="h-64 w-full object-cover" />
              )}
              <div className="space-y-6 p-8">
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-primary-500">
                  {item.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
                <h2 className="text-3xl font-semibold text-slate-900">{item.title}</h2>
                <p className="text-base text-slate-600">{item.summary}</p>
                <p className="text-sm text-slate-600">{item.description}</p>

                {item.gallery.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {item.gallery.map((image) => (
                      <figure key={image.url} className="overflow-hidden rounded-2xl border border-slate-100">
                        <img src={image.url} alt={image.alt} className="h-48 w-full object-cover" />
                        {image.alt && (
                          <figcaption className="px-4 py-2 text-xs text-slate-500">{image.alt}</figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
