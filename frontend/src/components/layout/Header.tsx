import { useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Container from './Container';
import { fetchAreas } from '../../lib/api';

const navItems = [
  { label: 'Home', to: '/', type: 'route' as const },
  { label: 'Empresas', to: '/empresas', type: 'route' as const },
  { label: 'Sobre nós', to: '/sobre-nos', type: 'route' as const },
  { label: 'Contato', to: '/contato', type: 'route' as const }
];

export default function Header() {
  const query = useQuery({ queryKey: ['areas'], queryFn: fetchAreas });
  const areas = query.data?.items ?? [];
  const categoryLinks = useMemo(
    () =>
      areas.map((item) => ({
        label: item.name,
        slug: item.slug || item.id
      })),
    [areas]
  );

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <div className="bg-[#0b4f6c] text-white">
        <Container className="flex flex-col gap-2 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <span className="flex items-center gap-1.5 font-medium">
              <svg aria-hidden className="h-4 w-4 text-accent-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z" />
                <circle cx="12" cy="11" r="2.5" />
              </svg>
              Jaguar Center Plaza · Jaguariúna - SP
            </span>
            <span className="flex items-center gap-1">
              <svg aria-hidden className="h-4 w-4 text-accent-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 14" />
              </svg>
              Seg a Sex: 8h às 20h · Sáb: 8h às 14h
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:+551938335600" className="font-semibold text-accent-100 hover:text-white">
              (19) 3833-5600
            </a>
            <a href="mailto:contato@jaguarcenterplaza.com.br" className="hidden font-medium text-accent-100 hover:text-white md:inline">
              contato@jaguarcenterplaza.com.br
            </a>
          </div>
        </Container>
      </div>

      <div className="border-b border-primary-100 bg-white/95 backdrop-blur">
        <Container className="flex items-center justify-between gap-6 py-4">
          <NavLink to="/" className="flex items-center gap-3">
            <img
              src="/logo-jaguar-center-plaza-002-1-768x535.png"
              alt="Jaguar Center Plaza"
              className="h-12 w-auto"
            />
          </NavLink>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-primary-700 lg:flex">
            {navItems.map((item) => {
              if (item.type === 'anchor') {
                return (
                  <a key={item.label} href={item.to} className="hover:text-accent-500">
                    {item.label}
                  </a>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    isActive
                      ? 'text-accent-500'
                      : 'transition-colors hover:text-accent-500'
                  }
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="hidden shrink-0 lg:flex">
            <a
              href="/contato"
              className="inline-flex items-center rounded-full bg-accent-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-400"
            >
              Fale Conosco
            </a>
          </div>

          <div className="flex flex-1 justify-end lg:hidden">
            <select
              aria-label="Navegação principal"
              className="w-full max-w-[180px] rounded-full border border-primary-200 bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm"
              onChange={(event) => {
                const value = event.target.value;
                if (value) {
                  window.location.href = value;
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Menu
              </option>
              {navItems.map((item) => (
                <option key={item.label} value={item.to}>
                  {item.label}
                </option>
              ))}
              {categoryLinks.map((category) => (
                <option key={category.slug} value={`/empresas/${category.slug}`}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </Container>
      </div>
      {categoryLinks.length > 0 && (
        <div className="border-b border-primary-100 bg-[#f1f5ee]/90 backdrop-blur">
          <Container className="flex flex-wrap items-center gap-2 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-700">
            <span className="mr-2 hidden text-[10px] tracking-[0.3em] text-primary-500 sm:inline">Categorias</span>
            <div className="flex flex-wrap gap-2">
              {categoryLinks.map((category) => (
                <Link
                  key={category.slug}
                  to={`/empresas/${category.slug}`}
                  className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-primary-700 shadow-sm transition hover:bg-primary-100 hover:text-primary-800"
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
