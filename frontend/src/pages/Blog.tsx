import { FormEvent, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import Container from '../components/layout/Container';
import { useSEO } from '../hooks/useSEO';
import { fetchBlogPosts } from '../lib/api';

const PER_PAGE = 6;

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const search = searchParams.get('q') ?? '';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['blog-posts', { page, search }],
    queryFn: () => fetchBlogPosts({ page, perPage: PER_PAGE, search: search || undefined })
  });

  useSEO({
    title: 'Blog — Jaguar Center Plaza',
    description:
      'Acompanhe as últimas novidades, eventos e conteúdos especiais do Jaguar Center Plaza. Dicas de negócios, cultura local e muito mais.',
    canonical: 'https://www.jaguarcenterplaza.com.br/blog'
  });

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const items = data?.items ?? [];

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get('q') || '');
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('page', '1');
    setSearchParams(params);
  }

  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  return (
    <section className="py-16">
      <Container>
        <header className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Blog</p>
          <h1 className="text-4xl font-semibold text-slate-900">Histórias e novidades do Jaguar Center Plaza</h1>
          <p className="text-lg text-slate-600">
            Conteúdo feito para quem empreende, trabalha e circula pelo nosso centro comercial. Inspire-se com cases,
            eventos e tendências que movem Jaguariúna.
          </p>
        </header>

        <form onSubmit={handleSearch} className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Buscar por título ou palavra-chave"
            className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
          <button
            type="submit"
            className="rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500"
          >
            Buscar
          </button>
        </form>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {isLoading && <p className="text-sm text-slate-500">Carregando posts...</p>}
          {isError && !isLoading && <p className="text-sm text-red-500">Não foi possível carregar o blog agora.</p>}
          {!isLoading && items.length === 0 && !isError && (
            <p className="text-sm text-slate-500">Nenhum post encontrado.</p>
          )}

          {items.map((post) => (
            <article key={post.slug} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              {post.coverImage && (
                <img src={post.coverImage} alt="" className="h-56 w-full object-cover transition group-hover:scale-[1.02]" />
              )}
              <div className="space-y-4 p-6">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-primary-500">
                  {post.tags.length > 0 && post.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt} className="text-slate-400">
                      {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                    </time>
                  )}
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">{post.title}</h2>
                <p className="text-sm text-slate-600">{post.excerpt}</p>
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center text-sm font-semibold text-primary-600 transition hover:text-primary-500"
                >
                  Ler artigo completo
                  <span aria-hidden className="ml-2">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="mt-12 flex flex-wrap items-center gap-3" aria-label="Paginação">
            {pages.map((itemPage) => {
              const params = new URLSearchParams(searchParams);
              params.set('page', String(itemPage));
              const href = `/blog?${params.toString()}`;
              const isCurrent = itemPage === page;
              return (
                <Link
                  key={itemPage}
                  to={href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isCurrent
                      ? 'bg-primary-600 text-white shadow'
                      : 'bg-white text-primary-700 shadow-sm hover:bg-primary-50'
                  }`}
                >
                  {itemPage}
                </Link>
              );
            })}
          </nav>
        )}
      </Container>
    </section>
  );
}
