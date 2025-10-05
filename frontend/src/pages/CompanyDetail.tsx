import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Container from '../components/layout/Container';
import {
  fetchCategories,
  type CompanyCategory,
  type CompanySummary,
  type CompanySocialLink,
  type CompanyMedia
} from '../lib/api';
import { useSEO } from '../hooks/useSEO';

function formatPhone(value: string) {
  return value.replace(/[^+\d]/g, '');
}

function normalizeLink(link?: string) {
  if (!link) return undefined;
  if (link.startsWith('http')) return link;
  return `https://${link.replace(/^\/+/, '')}`;
}

export default function CompanyDetailPage() {
  const { categorySlug = '', companySlug = '' } = useParams();
  const { data, isLoading, isError } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const categories = data?.categories ?? [];

  const { category, company } = useMemo(() => {
    const foundCategory = categories.find((item: CompanyCategory) => (item.slug || item.id) === categorySlug);
    const foundCompany = foundCategory?.companies?.find((item: CompanySummary) => (item.slug || item.id) === companySlug);

    return { category: foundCategory, company: foundCompany };
  }, [categories, categorySlug, companySlug]);

  useSEO({
    title: company
      ? `${company.name} · ${category?.name ?? 'Empresas'} · Jaguar Center Plaza`
      : 'Empresa não encontrada · Jaguar Center Plaza',
    description:
      company?.shortDescription ||
      company?.description ||
      'Conheça as empresas que fazem parte do Jaguar Center Plaza e seus diferenciais de atendimento.',
    canonical: company ? `https://www.jaguarcenterplaza.com.br/empresas/${categorySlug}/${companySlug}` : undefined
  });

  const gallery = company?.gallery ?? [];
  const socialLinks: CompanySocialLink[] = company?.socialLinks ?? [];
  const heroImage = company?.coverImage || category?.heroImage || '/Fachada5.jpg';

  return (
    <div className="space-y-16 pb-20">
      <section className="relative overflow-hidden bg-primary-900 text-white">
        <div className="absolute inset-0">
          <img src={heroImage} alt={company?.name || 'Empresa'} className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-800/90 to-primary-700/80" aria-hidden />
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
                <Link to={`/empresas/${category.slug || category.id}`} className="transition hover:text-white">
                  {category.name}
                </Link>
              </>
            )}
            {company && (
              <>
                <span>/</span>
                <span className="text-white/80">{company.name}</span>
              </>
            )}
          </nav>
          <div className="space-y-4">
            {company?.logo && (
              <img src={company.logo} alt={company.name} className="h-16 w-auto" />
            )}
            <h1 className="text-4xl font-bold sm:text-5xl">{company ? company.name : 'Empresa não encontrada'}</h1>
            {company?.tagline && <p className="text-base font-semibold uppercase tracking-[0.25em] text-accent-200">{company.tagline}</p>}
            {company?.shortDescription && <p className="max-w-3xl text-base text-white/85 sm:text-lg">{company.shortDescription}</p>}
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-8">
            {company?.description && (
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h2 className="text-2xl font-semibold text-primary-800">Sobre a empresa</h2>
                <p className="mt-3 text-base leading-relaxed text-[#4f5d55]">{company.description}</p>
                {company.services && company.services.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-lg font-semibold text-primary-800">Principais serviços</h3>
                    <ul className="space-y-2 text-sm text-[#4f5d55]">
                      {company.services.map((service) => (
                        <li key={service} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {gallery.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary-800">Galeria</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {gallery.map((item: CompanyMedia) => (
                    <div key={item.url} className="overflow-hidden rounded-2xl shadow-lg">
                      <img src={item.url} alt={item.alt || company?.name || 'Empresa'} className="h-60 w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <h2 className="text-xl font-semibold text-primary-800">Informações de contato</h2>
              <div className="mt-4 space-y-4 text-sm text-[#4f5d55]">
                {company?.phones && company.phones.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500">Telefone</p>
                    <ul className="mt-2 space-y-1">
                      {company.phones.map((phone) => (
                        <li key={phone}>
                          <a href={`tel:${formatPhone(phone)}`} className="font-medium text-primary-700 hover:text-accent-500">
                            {phone}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {company?.emails && company.emails.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500">E-mail</p>
                    <ul className="mt-2 space-y-1">
                      {company.emails.map((email) => (
                        <li key={email}>
                          <a href={`mailto:${email}`} className="font-medium text-primary-700 hover:text-accent-500">
                            {email}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {company?.whatsapp && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500">WhatsApp</p>
                    <a
                      href={normalizeLink(company.whatsapp)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 font-medium text-primary-700 hover:text-accent-500"
                    >
                      Conversar pelo WhatsApp
                      <svg aria-hidden className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 3.5A11.24 11.24 0 0 0 12.09 1 11 11 0 0 0 1 12.1 11 11 0 0 0 19 20.9L23 23l-2.18-4.09A11 11 0 0 0 23 12.09 11.24 11.24 0 0 0 20 3.5Zm-7.91 16a8.49 8.49 0 0 1-7.7-12.4 8.47 8.47 0 0 1 7.48-4.59h.32a8.5 8.5 0 0 1 6 14.49l-.44.44 1 1.83-2-.53-.49.14a8.45 8.45 0 0 1-4.23 1.08Z" />
                        <path d="M16.31 13.81a1.5 1.5 0 0 0-1-1.06c-.27-.15-.63-.3-1.09-.51a.79.79 0 0 0-.89.16l-.39.4a.33.33 0 0 1-.4.08 5.87 5.87 0 0 1-2.83-2.48.34.34 0 0 1 .05-.43l.34-.42a1.36 1.36 0 0 0 .24-1.22c-.07-.26-.52-1.26-.71-1.65s-.37-.38-.52-.38h-.45a.86.86 0 0 0-.62.28 2.08 2.08 0 0 0-.65 1.55 3.63 3.63 0 0 0 .77 1.9 8.32 8.32 0 0 0 3.5 3 5.31 5.31 0 0 0 1.45.45 1.93 1.93 0 0 0 1.26-.4 1.56 1.56 0 0 0 .48-1 .78.78 0 0 0-.03-.26Z" />
                      </svg>
                    </a>
                  </div>
                )}
                {company?.website && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500">Site</p>
                    <a
                      href={normalizeLink(company.website)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 font-medium text-primary-700 hover:text-accent-500"
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                      <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M7 17 17 7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </div>
                )}
                {company?.facebook && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500">Facebook</p>
                    <a
                      href={normalizeLink(company.facebook)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 font-medium text-primary-700 hover:text-accent-500"
                    >
                      {company.facebook.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {company?.instagram && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500">Instagram</p>
                    <a
                      href={normalizeLink(company.instagram)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 font-medium text-primary-700 hover:text-accent-500"
                    >
                      {company.instagram.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {company?.address && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500">Endereço</p>
                    <p className="mt-2 font-medium text-primary-700">{company.address}</p>
                    {company.mapsUrl && (
                      <a
                        href={normalizeLink(company.mapsUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-accent-500"
                      >
                        Ver no mapa
                        <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z" />
                          <circle cx="12" cy="11" r="2.5" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
                {company?.schedule && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500">Horário de atendimento</p>
                    <p className="mt-2 font-medium text-primary-700">{company.schedule}</p>
                  </div>
                )}
              </div>
            </div>

            {socialLinks.length > 0 && (
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h2 className="text-xl font-semibold text-primary-800">Redes e canais</h2>
                <ul className="mt-4 space-y-3 text-sm text-[#4f5d55]">
                  {socialLinks.map((social) => (
                    <li key={social.url}>
                      <a
                        href={normalizeLink(social.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 font-semibold text-primary-700 hover:text-accent-500"
                      >
                        {social.label}
                        <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M7 17 17 7" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </Container>
      </section>

      {!isLoading && !isError && !company && (
        <Container>
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
            <h2 className="text-2xl font-semibold text-primary-800">Empresa não encontrada</h2>
            <p className="mt-2 text-sm text-[#4f5d55]">
              A empresa que você buscou pode ter sido removida ou está temporariamente indisponível.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link to="/empresas" className="inline-flex items-center rounded-full bg-primary-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-600">
                Ver todas as empresas
              </Link>
              {category && (
                <Link
                  to={`/empresas/${category.slug || category.id}`}
                  className="inline-flex items-center rounded-full border border-primary-200 px-5 py-2 text-sm font-semibold text-primary-700 transition hover:border-primary-300 hover:text-primary-800"
                >
                  Voltar para {category.name}
                </Link>
              )}
            </div>
          </div>
        </Container>
      )}
    </div>
  );
}
