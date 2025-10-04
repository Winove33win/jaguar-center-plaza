import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import Container from '../components/layout/Container';
import { useSEO } from '../hooks/useSEO';
import { fetchBlogPost } from '../lib/api';

export default function BlogPostPage() {
  const { slug = '' } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => fetchBlogPost(slug),
    enabled: Boolean(slug)
  });

  const formattedDate = useMemo(() => {
    if (!data?.publishedAt) return null;
    return new Date(data.publishedAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }, [data?.publishedAt]);

  useSEO({
    title: data ? `${data.title} — Blog Jaguar Center Plaza` : 'Blog — Jaguar Center Plaza',
    description: data?.excerpt,
    canonical: data ? `https://www.jaguarcenterplaza.com.br/blog/${data.slug}` : undefined
  });

  return (
    <section className="py-16">
      <Container className="max-w-4xl">
        <Link to="/blog" className="text-sm font-semibold text-primary-600 transition hover:text-primary-500">
          ← Voltar para o blog
        </Link>

        {isLoading && <p className="mt-12 text-sm text-slate-500">Carregando artigo...</p>}
        {isError && !isLoading && <p className="mt-12 text-sm text-red-500">Não foi possível carregar este artigo.</p>}
        {!isLoading && !data && !isError && (
          <p className="mt-12 text-sm text-slate-500">Artigo não encontrado.</p>
        )}

        {data && (
          <article className="mt-10 space-y-8">
            <header className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-primary-500">Blog</p>
              <h1 className="text-4xl font-semibold text-slate-900">{data.title}</h1>
              <p className="text-lg text-slate-600">{data.excerpt}</p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                {formattedDate && <time dateTime={data.publishedAt ?? undefined}>{formattedDate}</time>}
                {data.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                    #{tag}
                  </span>
                ))}
              </div>
            </header>

            {data.coverImage && (
              <img src={data.coverImage} alt="" className="h-auto w-full rounded-3xl object-cover shadow" />
            )}

            <div className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-primary-600">
              {renderContent(data.content)}
            </div>
          </article>
        )}
      </Container>
    </section>
  );
}

function renderContent(content: string) {
  if (!content) {
    return <p>Conteúdo em breve.</p>;
  }

  const paragraphs = content.split(/\n{2,}/).map((chunk) => chunk.trim()).filter(Boolean);

  return paragraphs.map((paragraph, index) => (
    <p key={index} className="whitespace-pre-line">
      {paragraph}
    </p>
  ));
}
