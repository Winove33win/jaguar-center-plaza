import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Container from '../components/layout/Container';
import { useSEO } from '../hooks/useSEO';
import { fetchBlogPosts, fetchCases, fetchTemplates } from '../lib/api';

const featureItems = [
  {
    title: 'Salas comerciais',
    description: 'Estruturas moduláveis e climatizadas com toda a infraestrutura corporativa do Jaguar Center Plaza.',
    icon: (
      <svg aria-hidden className="h-7 w-7 text-primary-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 21h16" strokeLinecap="round" />
        <path d="M6 21V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16" />
        <rect x="9" y="9" width="2" height="2" fill="currentColor" stroke="none" />
        <rect x="13" y="9" width="2" height="2" fill="currentColor" stroke="none" />
        <rect x="9" y="13" width="2" height="2" fill="currentColor" stroke="none" />
        <rect x="13" y="13" width="2" height="4" fill="currentColor" stroke="none" />
      </svg>
    )
  },
  {
    title: 'Clínicas e saúde',
    description: 'Consultórios prontos, acessibilidade e suporte para serviços médicos, odontológicos e terapias integrativas.',
    icon: (
      <svg aria-hidden className="h-7 w-7 text-primary-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M12 2a7 7 0 0 0-7 7c0 4.5 7 13 7 13s7-8.5 7-13a7 7 0 0 0-7-7z" />
        <path d="M12 8v4" strokeLinecap="round" />
        <path d="M10 10h4" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Beleza e bem-estar',
    description: 'Espaços completos para salões, barbearias, spas e centros de estética com forte fluxo diário.',
    icon: (
      <svg aria-hidden className="h-7 w-7 text-primary-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 16c4-4 7-9 7-13" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 7c0 5.523-3.582 10-8 10 1.724 2.354 4.527 4 7.5 4 5.523 0 10-4.03 10-9 0-2.876-1.58-5.395-4-6.903" />
      </svg>
    )
  },
  {
    title: 'Serviços essenciais',
    description: 'Lotéricas, bancos, cartórios, alimentação e facilidades abertas ao público todos os dias.',
    icon: (
      <svg aria-hidden className="h-7 w-7 text-primary-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M3 5h18M5 5v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5" />
        <path d="M9 9h6" strokeLinecap="round" />
        <path d="M12 9v8" strokeLinecap="round" />
      </svg>
    )
  }
];

const quickInfos = [
  { label: 'Horário de funcionamento', value: 'Seg. a sex. das 8h às 20h · Sáb. das 8h às 14h' },
  { label: 'Endereço', value: 'Rua Amazonas, 504 · Centro · Jaguariúna' },
  { label: 'Telefone', value: '(19) 3833-5600' }
];

export default function HomePage() {
  const blogQuery = useQuery({ queryKey: ['home-blog'], queryFn: () => fetchBlogPosts({ page: 1, perPage: 3 }) });
  const casesQuery = useQuery({ queryKey: ['home-cases'], queryFn: fetchCases });
  const templatesQuery = useQuery({ queryKey: ['home-templates'], queryFn: fetchTemplates });

  useSEO({
    title: 'Jaguar Center Plaza — O complexo empresarial de Jaguariúna',
    description:
      'Salas comerciais, consultórios, espaços de eventos e serviços integrados em um único endereço. Conecte sua empresa ao ecossistema do Jaguar Center Plaza.'
  });

  const blogPosts = blogQuery.data?.items ?? [];
  const cases = casesQuery.data?.items?.slice(0, 2) ?? [];
  const templates = templatesQuery.data?.items?.slice(0, 2) ?? [];

  return (
    <section className="space-y-24 py-16">
      <Container className="space-y-12">
        <header className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Jaguar Center Plaza</p>
            <h1 className="text-5xl font-semibold text-slate-900">O ponto de encontro dos negócios em Jaguariúna</h1>
            <p className="text-lg text-slate-600">
              Mais de 180 empresas convivem diariamente em um ambiente com infraestrutura completa, serviços essenciais e
              oportunidades de networking. Aqui você encontra espaços moduláveis, eventos estratégicos e soluções digitais para
              acelerar sua operação.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/cases"
                className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500"
              >
                Conheça os cases
              </Link>
              <Link
                to="/templates"
                className="inline-flex items-center rounded-full border border-primary-200 px-6 py-3 text-sm font-semibold text-primary-700 transition hover:border-primary-400 hover:text-primary-600"
              >
                Explore os templates digitais
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-primary-100 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Informações rápidas</h2>
            <ul className="mt-6 space-y-4 text-sm text-slate-600">
              {quickInfos.map((info) => (
                <li key={info.label} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">{info.label}</span>
                  <span>{info.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featureItems.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">{feature.icon}</span>
              <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Últimas do blog</p>
            <h2 className="text-3xl font-semibold text-slate-900">O que está acontecendo por aqui</h2>
          </div>
          <Link to="/blog" className="text-sm font-semibold text-primary-600 transition hover:text-primary-500">
            Ver todas as notícias →
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {blogQuery.isLoading && <p className="text-sm text-slate-500">Carregando posts...</p>}
          {!blogQuery.isLoading && blogPosts.length === 0 && (
            <p className="text-sm text-slate-500">Nenhuma notícia publicada até o momento.</p>
          )}
          {blogPosts.map((post) => (
            <article key={post.slug} className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {post.coverImage && (
                <img src={post.coverImage} alt="" className="h-48 w-full object-cover" />
              )}
              <div className="flex flex-1 flex-col space-y-4 p-6">
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-primary-500">
                  {post.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
                <h3 className="text-2xl font-semibold text-slate-900">{post.title}</h3>
                <p className="text-sm text-slate-600">{post.excerpt}</p>
                {post.publishedAt && (
                  <time dateTime={post.publishedAt} className="mt-auto text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                  </time>
                )}
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center text-sm font-semibold text-primary-600 transition hover:text-primary-500"
                >
                  Ler matéria completa →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>

      <Container className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Cases</p>
            <h2 className="text-3xl font-semibold text-slate-900">Empresas que crescem com a gente</h2>
          </div>
          <Link to="/cases" className="text-sm font-semibold text-primary-600 transition hover:text-primary-500">
            Ver todos os cases →
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {casesQuery.isLoading && <p className="text-sm text-slate-500">Carregando cases...</p>}
          {cases.map((item) => (
            <article key={item.slug} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {item.thumbnail && <img src={item.thumbnail} alt="" className="h-52 w-full object-cover" />}
              <div className="space-y-4 p-6">
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-primary-500">
                  {item.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
                <h3 className="text-2xl font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>

      <Container className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Templates</p>
            <h2 className="text-3xl font-semibold text-slate-900">Digitalize sua presença com rapidez</h2>
          </div>
          <Link to="/templates" className="text-sm font-semibold text-primary-600 transition hover:text-primary-500">
            Ver todos os templates →
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {templatesQuery.isLoading && <p className="text-sm text-slate-500">Carregando templates...</p>}
          {templates.map((template) => (
            <article key={template.slug} className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {template.thumbnail && (
                <img src={template.thumbnail} alt="" className="h-52 w-full object-cover" />
              )}
              <div className="flex flex-1 flex-col space-y-4 p-6">
                <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                  {template.category}
                </span>
                <h3 className="text-2xl font-semibold text-slate-900">{template.name}</h3>
                <p className="text-sm text-slate-600">{template.description}</p>
                <p className="text-lg font-semibold text-primary-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: template.currency || 'BRL' }).format(
                    template.price || 0
                  )}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
