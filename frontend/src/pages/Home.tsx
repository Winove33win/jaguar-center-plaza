import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Container from '../components/layout/Container';
import { fetchCategories } from '../lib/api';
import { useSEO } from '../hooks/useSEO';

export default function HomePage() {
  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const categories = data?.categories ?? [];

  useSEO({
    title: 'Jaguar Center Plaza — Seu hub de serviços, negócios e bem-estar',
    description:
      'Conheça o Jaguar Center Plaza, um shopping corporativo com serviços de administração, advocacia, beleza, contabilidade, saúde, imóveis, indústrias e serviços públicos.',
    canonical: 'https://www.jaguarcenterplaza.com.br/'
  });

  return (
    <div className="space-y-20">
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
        <Container className="grid gap-10 py-20 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm uppercase tracking-wide">
              Jaguar Center Plaza
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              O destino completo para conectar negócios e experiências memoráveis
            </h1>
            <p className="text-lg text-primary-50">
              Somos o primeiro shopping corporativo da região com um ecossistema que integra soluções
              empresariais, conveniência, saúde e bem-estar em um único endereço estratégico.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/empresas"
                className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-primary-700 shadow hover:bg-primary-50"
              >
                Conheça nossas empresas
              </Link>
              <Link
                to="/contato"
                className="rounded-md border border-white/70 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Agende uma visita guiada
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-white/10 blur-3xl" aria-hidden />
            <div className="relative rounded-3xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur">
              <h2 className="text-xl font-semibold">Nossos diferenciais</h2>
              <ul className="mt-6 space-y-4 text-sm text-primary-50">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-200" />
                  Agenda integrada para eventos corporativos e ativações de marca.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-200" />
                  Espaços moduláveis com infraestrutura de alto padrão e tecnologia embarcada.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-200" />
                  Rotas de mobilidade urbana, bicicletário e vestiários com lockers inteligentes.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-200" />
                  Concierge corporativo com serviços sob demanda para colaboradores e visitantes.
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">Categorias</p>
            <h2 className="section-title">Ecossistema completo para quem faz a cidade acontecer</h2>
            <p className="section-subtitle">
              Empresas que transformam o Jaguar Center Plaza em um ponto de encontro para empreendedores,
              profissionais e famílias.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {isLoading && <p className="text-sm text-slate-500">Carregando categorias...</p>}
            {!isLoading && categories.length === 0 && (
              <p className="text-sm text-slate-500">Nenhuma categoria cadastrada no momento.</p>
            )}
            {categories.map((category) => (
              <article key={category.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{category.name}</h3>
                    <p className="mt-2 text-sm text-slate-600">{category.description}</p>
                  </div>
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                    {category.companies.length} empresas
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {category.companies.slice(0, 3).map((company) => (
                    <li key={company.id} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-400" />
                      {company.name}
                    </li>
                  ))}
                </ul>
                <Link to="/empresas" className="mt-6 inline-flex items-center text-sm font-semibold text-primary-600">
                  Ver todas as empresas
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="section-title">Eventos, ativações e experiências sob medida</h2>
            <p className="section-subtitle">
              Auditórios de alta capacidade, rooftop panorâmico, arenas multiuso e lounges corporativos compõem o
              mix de espaços disponíveis para locação temporária ou recorrente.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                Plataforma digital para reservar espaços e acompanhar relatórios de performance.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                Equipe de produção executiva, cenografia e suporte técnico.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                Conexão com fornecedores homologados para catering, tecnologia e entretenimento.
              </li>
            </ul>
            <Link
              to="/contato"
              className="mt-8 inline-flex items-center rounded-md bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-primary-700"
            >
              Solicitar proposta
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-primary-600/10 p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-200/70 blur-3xl" aria-hidden />
            <div className="absolute -bottom-10 -left-10 h-52 w-52 rounded-full bg-primary-300/60 blur-3xl" aria-hidden />
            <div className="relative space-y-6">
              <div className="rounded-2xl border border-primary-100 bg-white/90 p-6 shadow-lg backdrop-blur">
                <h3 className="text-lg font-semibold text-primary-700">Fácil acesso</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Localização estratégica com conexão a três linhas de metrô, terminal de ônibus integrado e mais de
                  3.000 vagas de estacionamento rotativo.
                </p>
              </div>
              <div className="rounded-2xl border border-primary-100 bg-white/90 p-6 shadow-lg backdrop-blur">
                <h3 className="text-lg font-semibold text-primary-700">Hospitalidade premium</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Concierge bilíngue, salas de reunião com videoconferência e lounge executivo exclusivo para
                  parceiros corporativos.
                </p>
              </div>
              <div className="rounded-2xl border border-primary-100 bg-white/90 p-6 shadow-lg backdrop-blur">
                <h3 className="text-lg font-semibold text-primary-700">Sustentabilidade</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Certificação LEED Gold, geração fotovoltaica, reaproveitamento de água e gestão inteligente de
                  resíduos.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
