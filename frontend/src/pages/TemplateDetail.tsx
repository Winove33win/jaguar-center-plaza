import { useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import Container from '../components/layout/Container';
import { useSEO } from '../hooks/useSEO';
import { createCheckoutSession, fetchTemplate } from '../lib/api';

const stripeCache = new Map<string, Promise<Stripe | null>>();

function getStripe(publicKey: string) {
  if (!publicKey) {
    return null;
  }

  if (!stripeCache.has(publicKey)) {
    stripeCache.set(publicKey, loadStripe(publicKey));
  }

  return stripeCache.get(publicKey) ?? null;
}

export default function TemplateDetailPage() {
  const { slug = '' } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['template', slug],
    queryFn: () => fetchTemplate(slug),
    enabled: Boolean(slug)
  });

  useSEO({
    title: data ? `${data.name} — Templates Jaguar Center Plaza` : 'Templates — Jaguar Center Plaza',
    description: data?.description,
    canonical: data ? `https://www.jaguarcenterplaza.com.br/templates/${data.slug}` : undefined
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error('Template não carregado');

      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/templates/${data.slug}?status=success`;
      const cancelUrl = `${baseUrl}/templates/${data.slug}?status=cancel`;

      const response = await createCheckoutSession(data.slug, { successUrl, cancelUrl });

      if (response.url) {
        window.location.href = response.url;
        return;
      }

      const sessionId = response.sessionId || response.id;
      const publicKey = response.publicKey || import.meta.env.VITE_STRIPE_PUBLIC_KEY;

      if (!sessionId || !publicKey) {
        throw new Error('Não foi possível iniciar o checkout no momento.');
      }

      const stripePromise = getStripe(publicKey);
      if (!stripePromise) {
        throw new Error('Stripe não configurado.');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe indisponível.');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    }
  });

  const priceLabel = useMemo(() => {
    if (!data) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: data.currency || 'BRL'
    }).format(data.price || 0);
  }, [data]);

  async function handleCheckout() {
    const toastId = toast.loading('Gerando checkout...');
    try {
      await mutation.mutateAsync();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível iniciar o checkout.';
      toast.error(message);
    } finally {
      toast.dismiss(toastId);
    }
  }

  return (
    <section className="py-16">
      <Container className="max-w-5xl space-y-12">
        {isLoading && <p className="text-sm text-slate-500">Carregando template...</p>}
        {isError && !isLoading && <p className="text-sm text-red-500">Não foi possível carregar este template.</p>}
        {!isLoading && !data && !isError && (
          <p className="text-sm text-slate-500">Template não encontrado.</p>
        )}

        {data && (
          <article className="space-y-10">
            <header className="space-y-4">
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                {data.category}
              </span>
              <h1 className="text-4xl font-semibold text-slate-900">{data.name}</h1>
              <p className="text-lg text-slate-600">{data.description}</p>
              {priceLabel && <p className="text-3xl font-semibold text-primary-600">{priceLabel}</p>}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={mutation.isPending}
                className="inline-flex items-center rounded-full bg-primary-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {mutation.isPending ? 'Redirecionando...' : 'Comprar template'}
              </button>
            </header>

            {data.config?.previewImages?.length ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {data.config.previewImages.map((image) => (
                  <img key={image} src={image} alt="Pré-visualização do template" className="h-64 w-full rounded-3xl object-cover shadow" />
                ))}
              </div>
            ) : null}

            {data.features.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900">O que acompanha</h2>
                <ul className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                  {data.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary-500" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {data.config?.sections?.length ? (
              <section className="space-y-6">
                <h2 className="text-2xl font-semibold text-slate-900">Estrutura do template</h2>
                <div className="grid gap-6">
                  {data.config.sections.map((section) => (
                    <div
                      key={section.id || section.title}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="text-xl font-semibold text-slate-900">{section.title}</h3>
                      {section.description && <p className="mt-2 text-sm text-slate-600">{section.description}</p>}
                      {section.image && (
                        <img src={section.image} alt="" className="mt-4 h-48 w-full rounded-2xl object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </article>
        )}
      </Container>
    </section>
  );
}
