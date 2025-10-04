import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Container from '../components/layout/Container';
import { useSEO } from '../hooks/useSEO';
import { fetchTemplates } from '../lib/api';

export default function TemplatesPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['templates'], queryFn: fetchTemplates });

  useSEO({
    title: 'Templates profissionais — Jaguar Center Plaza',
    description:
      'Landing pages, sites institucionais e catálogos digitais prontos para personalizar. Escolha um template e acelere sua presença online.',
    canonical: 'https://www.jaguarcenterplaza.com.br/templates'
  });

  const items = data?.items ?? [];

  return (
    <section className="py-16">
      <Container className="space-y-12">
        <header className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Templates</p>
          <h1 className="text-4xl font-semibold text-slate-900">Sites prontos para vender por você</h1>
          <p className="text-lg text-slate-600">
            Cada template foi desenvolvido com foco em velocidade, performance e storytelling. Ideal para quem quer lançar uma
            presença digital profissional em poucos dias.
          </p>
        </header>

        {isLoading && <p className="text-sm text-slate-500">Carregando templates...</p>}
        {isError && !isLoading && (
          <p className="text-sm text-red-500">Não foi possível carregar os templates neste momento.</p>
        )}
        {!isLoading && items.length === 0 && !isError && (
          <p className="text-sm text-slate-500">Ainda não temos templates publicados.</p>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {items.map((template) => (
            <article key={template.slug} className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {template.thumbnail && (
                <img src={template.thumbnail} alt="" className="h-60 w-full object-cover" />
              )}
              <div className="flex flex-1 flex-col space-y-6 p-8">
                <div className="space-y-2">
                  <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                    {template.category}
                  </span>
                  <h2 className="text-3xl font-semibold text-slate-900">{template.name}</h2>
                  <p className="text-sm text-slate-600">{template.description}</p>
                </div>

                <ul className="grid gap-2 text-sm text-slate-600">
                  {template.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                  <p className="text-2xl font-semibold text-primary-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: template.currency || 'BRL'
                    }).format(template.price || 0)}
                  </p>
                  <Link
                    to={`/templates/${template.slug}`}
                    className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-500"
                  >
                    Ver detalhes
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
