import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Container from '../components/layout/Container';
import { fetchAreas } from '../lib/api';
import { formatFieldLabel, formatFieldValue } from '../lib/format';
import { useSEO } from '../hooks/useSEO';

export default function RoomsPage() {
  const query = useQuery({ queryKey: ['areas'], queryFn: fetchAreas });

  useSEO({
    title: 'Salas e espaços — Jaguar Center Plaza',
    description:
      'Conheça todos os segmentos disponíveis no Jaguar Center Plaza: administração, advocacia, saúde, beleza, gastronomia, coworking e muito mais.',
    canonical: 'https://www.jaguarcenterplaza.com.br/salas'
  });

  const areas = query.data?.items ?? [];

  const hasContent = useMemo(() => areas.some((area) => area.records.length > 0), [areas]);

  return (
    <section className="space-y-16 py-16">
      <Container className="space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Salas e segmentos</p>
        <h1 className="section-title">Todos os ambientes do Jaguar Center Plaza em um só lugar</h1>
        <p className="section-subtitle">
          Explore as áreas disponíveis no complexo. São espaços desenhados para diferentes perfis de negócios, com infraestrutura
          completa, flexibilidade de layout e suporte operacional dedicado.
        </p>
      </Container>

      <Container className="space-y-12">
        {query.isLoading && <p className="text-sm text-slate-500">Carregando informações das salas...</p>}
        {query.isError && !query.isLoading && (
          <p className="text-sm text-red-600">Não foi possível carregar as áreas agora. Tente novamente em instantes.</p>
        )}

        {!query.isLoading && !hasContent && (
          <p className="text-sm text-slate-500">Em breve publicaremos os detalhes das salas disponíveis.</p>
        )}

        <div className="space-y-12">
          {areas.map((area) => (
            <article key={area.id} id={area.slug || area.id} className="space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">
                  {(area.slug || area.id).replace(/_/g, ' ')}
                </span>
                <h2 className="text-3xl font-semibold text-slate-900">{area.name}</h2>
                {area.description && <p className="text-sm text-slate-600">{area.description}</p>}
              </div>

              {area.records.length === 0 ? (
                <p className="text-sm text-slate-500">Entre em contato para saber mais sobre as oportunidades nesta categoria.</p>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  {area.records.map((record) => (
                    <div key={`${area.id}-${record.id}`} className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">{record.name}</h3>
                        {Object.keys(record.fields).length > 0 && (
                          <dl className="mt-4 space-y-2 text-sm text-slate-600">
                            {Object.entries(record.fields).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <dt className="min-w-[120px] text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">
                                  {formatFieldLabel(key)}
                                </dt>
                                <dd className="text-sm text-slate-600">{formatFieldValue(value)}</dd>
                              </div>
                            ))}
                          </dl>
                        )}
                      </div>
                      <div className="mt-auto pt-4 text-sm text-slate-500">
                        Para mais detalhes, fale com nossa equipe comercial pelo telefone (19) 3833-5600 ou envie uma mensagem no
                        formulário de contato.
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
