import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Container from '../components/layout/Container';
import { fetchAreas } from '../lib/api';
import { formatFieldLabel, formatFieldValue } from '../lib/format';
import { useSEO } from '../hooks/useSEO';

const heroHighlights = [
  'Ambientes empresariais, consultórios, lojas e conveniências em um único endereço.',
  'Infraestrutura com estacionamento, acessibilidade, facilities e monitoramento 24h.',
  'Localização privilegiada no coração de Jaguariúna com fácil acesso às principais vias.'
];

const featureItems = [
  {
    title: 'Salas prontas para operar',
    description: 'Espaços moduláveis com climatização, cabeamento estruturado e apoio técnico para todos os segmentos.',
    icon: (
      <svg
        aria-hidden
        className="h-8 w-8 text-primary-600"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
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
    title: 'Saúde e bem-estar integrados',
    description: 'Consultórios acessíveis, recepções compartilhadas e infraestrutura para exames e terapias.',
    icon: (
      <svg
        aria-hidden
        className="h-8 w-8 text-primary-600"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path d="M12 2a7 7 0 0 0-7 7c0 4.5 7 13 7 13s7-8.5 7-13a7 7 0 0 0-7-7z" />
        <path d="M12 8v4" strokeLinecap="round" />
        <path d="M10 10h4" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Gastronomia e conveniência',
    description: 'Restaurantes, cafés, serviços públicos e facilidades para quem trabalha ou visita o complexo.',
    icon: (
      <svg
        aria-hidden
        className="h-8 w-8 text-primary-600"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path d="M6 3h12" strokeLinecap="round" />
        <path d="M6 8h12" strokeLinecap="round" />
        <path d="M6 13h12" strokeLinecap="round" />
        <path d="M4 3v10a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V3" />
      </svg>
    )
  },
  {
    title: 'Ambiente seguro e acolhedor',
    description: 'Controle de acesso, limpeza, manutenção predial e suporte operacional especializado.',
    icon: (
      <svg
        aria-hidden
        className="h-8 w-8 text-primary-600"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 11l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
];

const comfortHighlights = [
  {
    title: 'Recepção centralizada',
    description: 'Atendimento qualificado, triagem e apoio a visitantes para cada segmento do empreendimento.'
  },
  {
    title: 'Infraestrutura completa',
    description: 'Estacionamento, elevadores inteligentes, climatização, segurança e manutenção em tempo integral.'
  },
  {
    title: 'Ambientes flexíveis',
    description: 'Salas que se adaptam a diferentes tamanhos de operação com possibilidade de expansão modular.'
  }
];

const servicesHighlights = [
  {
    title: '+180 empresas e serviços',
    description: 'Negócios que movimentam a economia da região e oferecem soluções para toda a cidade.'
  },
  {
    title: '10 segmentos especializados',
    description: 'Administração, saúde, beleza, gastronomia, advocacia, coworking e muitos outros setores reunidos.'
  },
  {
    title: 'Endereço estratégico',
    description: 'Rua Amazonas, 504 · Centro de Jaguariúna — acesso rápido às principais vias e transporte público.'
  }
];

const quickInfos = [
  { label: 'Horário de funcionamento', value: 'Segunda a sexta: 8h às 20h · Sábado: 8h às 14h' },
  { label: 'Telefone', value: '(19) 3833-5600' },
  { label: 'E-mail', value: 'contato@jaguarcenterplaza.com.br' }
];

export default function HomePage() {
  const query = useQuery({ queryKey: ['areas'], queryFn: fetchAreas });

  useSEO({
    title: 'Jaguar Center Plaza — Seu polo de serviços em Jaguariúna',
    description:
      'Empreendimento multiuso com salas comerciais, consultórios, gastronomia e serviços essenciais. Conheça as categorias disponíveis e agende sua visita.',
    canonical: 'https://www.jaguarcenterplaza.com.br/'
  });

  const areas = query.data?.items ?? [];
  const areaHighlights = useMemo(() => areas.slice(0, 6), [areas]);

  return (
    <div className="space-y-24 pb-24">
      <section className="bg-gradient-to-b from-[#0b4f6c] to-[#16607e] py-20 text-white">
        <Container className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em]">
              Jaguar Center Plaza
            </span>
            <div className="space-y-5">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Seu polo de serviços, saúde, gastronomia e negócios em Jaguariúna
              </h1>
              <p className="text-lg text-white/80">
                Tudo o que sua empresa precisa para prosperar: infraestrutura moderna, atendimento integrado e uma comunidade de negócios que cresce junto com a cidade.
              </p>
            </div>
            <ul className="space-y-3 text-base text-white/80">
              {heroHighlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-400/20 text-accent-200">
                    <svg aria-hidden className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/salas"
                className="inline-flex items-center rounded-full bg-accent-400 px-6 py-3 text-sm font-semibold text-[#0b4f6c] shadow-sm transition hover:bg-accent-300"
              >
                Conheça as salas disponíveis
              </Link>
              <Link
                to="/contato"
                className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Quero agendar uma visita
              </Link>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-8 backdrop-blur">
            <h2 className="text-lg font-semibold">Informações rápidas</h2>
            <p className="mt-2 text-sm text-white/70">
              Estamos prontos para receber sua operação com atendimento personalizado e infraestrutura completa.
            </p>
            <ul className="mt-6 space-y-4 text-sm text-white/80">
              {quickInfos.map((info) => (
                <li key={info.label} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-200">{info.label}</span>
                  <span>{info.value}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl bg-white/5 p-4 text-sm text-white/70">
              Rua Amazonas, 504 · Centro · Jaguariúna · SP
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="space-y-10">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Tudo para o seu conforto</p>
            <h2 className="section-title text-primary-900">Ambientes pensados para bem-estar e produtividade</h2>
            <p className="section-subtitle">
              Do primeiro atendimento ao pós-venda, o Jaguar Center Plaza oferece infraestrutura completa para empresas, profissionais de saúde, serviços públicos, lojas e operações de conveniência.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featureItems.map((feature) => (
              <div key={feature.title} className="flex h-full flex-col gap-4 rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">{feature.icon}</span>
                <h3 className="text-xl font-semibold text-primary-800">{feature.title}</h3>
                <p className="text-sm text-[#4f5d55]">{feature.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Estrutura completa</p>
            <h2 className="section-title text-primary-900">Tudo para o seu conforto e bem-estar</h2>
            <p className="section-subtitle">
              Recepção trilíngue, estacionamento com valet, espaços para eventos, internet de alta velocidade e suporte operacional garantem a melhor experiência para clientes e equipes.
            </p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {comfortHighlights.map((item) => (
                <li key={item.title} className="rounded-2xl border border-primary-100 bg-[#f4f6f1] p-5">
                  <h3 className="text-lg font-semibold text-primary-800">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#4f5d55]">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-primary-100 bg-[#f4f6f1] p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-primary-800">Sempre em movimento</h3>
              <p className="mt-3 text-sm text-[#4f5d55]">
                Eventos corporativos, workshops, ativações de marcas e encontros promovem networking e ampliam as oportunidades de negócios.
              </p>
              <Link
                to="/contato"
                className="mt-6 inline-flex items-center rounded-full bg-accent-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-400"
              >
                Fale com a nossa equipe
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {servicesHighlights.map((item) => (
                <div key={item.title} className="rounded-3xl border border-primary-100 bg-white p-6 text-sm text-[#4f5d55] shadow-sm">
                  <span className="text-lg font-semibold text-primary-800">{item.title}</span>
                  <p className="mt-2">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="space-y-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Categorias de salas</p>
              <h2 className="section-title text-primary-900">Conheça os segmentos disponíveis no Jaguar Center Plaza</h2>
              <p className="section-subtitle">
                As categorias abaixo são carregadas diretamente do banco de dados e representam as oportunidades reais para instalação da sua empresa. Clique para ver todos os detalhes de cada área.
              </p>
            </div>
            <Link
              to="/salas"
              className="inline-flex h-fit items-center rounded-full border border-primary-200 px-5 py-2 text-sm font-semibold text-primary-700 transition hover:border-primary-400 hover:text-primary-600"
            >
              Ver todas as salas
            </Link>
          </div>

          {query.isLoading && <p className="text-sm text-[#4f5d55]">Carregando categorias diretamente do banco de dados...</p>}
          {query.isError && !query.isLoading && (
            <p className="text-sm text-red-600">Não foi possível carregar as categorias agora. Tente novamente em instantes.</p>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {areaHighlights.map((area) => {
              const records = area.records.slice(0, 2);

              return (
                <article key={area.id} className="flex h-full flex-col gap-5 rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-2xl font-semibold text-primary-900">{area.name}</h3>
                      <Link to={`/salas#${area.slug || area.id}`} className="text-sm font-semibold text-accent-500 hover:text-accent-400">
                        Ver detalhes
                      </Link>
                    </div>
                    {area.description && <p className="text-sm text-[#4f5d55]">{area.description}</p>}
                  </div>

                  {records.length === 0 ? (
                    <p className="text-sm text-[#4f5d55]">
                      Em breve adicionaremos mais detalhes desta categoria. Entre em contato para reservar sua sala.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {records.map((record) => {
                        const fieldEntries = Object.entries(record.fields).slice(0, 4);

                        return (
                          <div key={record.id} className="rounded-2xl bg-[#f4f6f1] p-5">
                            <h4 className="text-lg font-semibold text-primary-800">{record.name}</h4>
                            {fieldEntries.length > 0 ? (
                              <dl className="mt-3 space-y-2 text-sm text-[#4f5d55]">
                                {fieldEntries.map(([key, value]) => (
                                  <div key={key} className="flex gap-2">
                                    <dt className="min-w-[120px] text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">
                                      {formatFieldLabel(key)}
                                    </dt>
                                    <dd>{formatFieldValue(value)}</dd>
                                  </div>
                                ))}
                              </dl>
                            ) : (
                              <p className="mt-3 text-sm text-[#4f5d55]">Entre em contato para conhecer a configuração completa desta sala.</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-gradient-to-r from-[#0b4f6c] via-[#145b77] to-[#1d6b88] py-16 text-white">
        <Container className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold sm:text-4xl">Pronto para fazer parte do Jaguar Center Plaza?</h2>
            <p className="max-w-2xl text-lg text-white/80">
              Agende uma visita guiada, conheça as categorias disponíveis e descubra como podemos adaptar um espaço sob medida para a sua operação.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/contato"
              className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b4f6c] shadow-sm transition hover:bg-accent-100"
            >
              Fale com o time comercial
            </Link>
            <Link
              to="/salas"
              className="inline-flex items-center rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              Ver todas as salas
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
