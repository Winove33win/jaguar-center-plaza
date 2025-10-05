import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Container from '../components/layout/Container';
import { fetchCategories, type CompanyCategory } from '../lib/api';
import { useSEO } from '../hooks/useSEO';

const featureItems = [
  {
    title: 'Salas comerciais',
    description: 'Estruturas moduláveis, climatizadas e com segurança patrimonial 24h para receber o seu negócio.',
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
    title: 'Clínicas & saúde',
    description: 'Ambientes preparados para consultórios, laboratórios e serviços de bem-estar com acessibilidade total.',
    icon: (
      <svg aria-hidden className="h-7 w-7 text-primary-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M12 2a7 7 0 0 0-7 7c0 4.5 7 13 7 13s7-8.5 7-13a7 7 0 0 0-7-7z" />
        <path d="M12 8v4" strokeLinecap="round" />
        <path d="M10 10h4" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Beleza & estética',
    description: 'Salões, barbearias, spas e centros de estética reunidos para quem busca experiências completas.',
    icon: (
      <svg aria-hidden className="h-7 w-7 text-primary-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 16c4-4 7-9 7-13" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 7c0 5.523-3.582 10-8 10 1.724 2.354 4.527 4 7.5 4 5.523 0 10-4.03 10-9 0-2.876-1.58-5.395-4-6.903" />
      </svg>
    )
  },
  {
    title: 'Serviços essenciais',
    description: 'Lotéricas, bancos, cartórios, alimentação e facilidades do dia a dia em um só endereço.',
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

type CategoryCard = {
  title: string;
  description: string;
  companiesLabel: string;
  image: string;
};

const fallbackCategoryCards: CategoryCard[] = [
  {
    title: 'Serviços corporativos',
    description: 'Contabilidade, advocacia, tecnologia e consultorias preparadas para apoiar o crescimento das empresas.',
    companiesLabel: '18 empresas',
    image: '/Fachada.jpg'
  },
  {
    title: 'Saúde & bem-estar',
    description: 'Clínicas médicas, odontológicas, pilates, fisioterapia e terapias integrativas em ambientes acolhedores.',
    companiesLabel: '12 empresas',
    image: '/Fachada3.jpg'
  },
  {
    title: 'Gastronomia & conveniência',
    description: 'Restaurantes, cafeterias, mercado e opções rápidas para quem precisa praticidade no dia a dia.',
    companiesLabel: '9 empresas',
    image: '/Fachada4.jpg'
  },
  {
    title: 'Beleza & estética',
    description: 'Centros de estética, salões e barbearias com serviços premium e profissionais especializados.',
    companiesLabel: '15 empresas',
    image: '/Fachada5.jpg'
  }
];

const newsPosts = [
  {
    title: 'Campanha do Agasalho 2024 no Jaguar Center Plaza',
    date: '12 de junho de 2024',
    excerpt: 'Junte-se a nós na arrecadação de cobertores e agasalhos em parceria com as instituições sociais da cidade.',
    image: '/333984251_205311685379957_6835703374332389472_n.jpg'
  },
  {
    title: 'Feira de Negócios e Networking com empresas residentes',
    date: '28 de maio de 2024',
    excerpt: 'Uma tarde para conectar empreendedores, fornecedores e investidores com palestras e rodadas de negócios.',
    image: '/333674171_999380511025032_54232673152881839_n.jpg'
  },
  {
    title: 'Oficinas de qualidade de vida para colaboradores',
    date: '15 de abril de 2024',
    excerpt: 'Programação com aulas de yoga, acompanhamento nutricional e palestras sobre saúde mental no auditório.',
    image: '/img-jaguar-center-plaza-001-768x460.jpg'
  }
];

function formatCompaniesLabel(count: number) {
  if (count === 1) {
    return '1 empresa';
  }

  return `${count} empresas`;
}

export default function HomePage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const categories = data?.categories ?? [];

  useSEO({
    title: 'Jaguar Center Plaza — Tudo para o seu conforto e bem-estar',
    description:
      'Conheça o Jaguar Center Plaza, um shopping corporativo com serviços de administração, advocacia, beleza, contabilidade, saúde, imóveis, indústrias e serviços públicos. Shopping corporativo de Jaguariúna com empresas de serviços, saúde, gastronomia, estética e conveniência em um único endereço.',
    canonical: 'https://www.jaguarcenterplaza.com.br/'
  });

  const categoryImages = ['/Fachada.jpg', '/Fachada3.jpg', '/Fachada4.jpg', '/Fachada5.jpg'];
  const dynamicCategoryCards: CategoryCard[] = categories.slice(0, 4).map((category: CompanyCategory, index) => ({
    title: category.name,
    description:
      category.description?.trim()?.length
        ? category.description
        : 'Conheça o mix de empresas que oferecem serviços completos para o seu dia a dia.',
    companiesLabel: formatCompaniesLabel(category.companies?.length ?? 0),
    image: categoryImages[index % categoryImages.length]
  }));

  const categoryCards: CategoryCard[] = dynamicCategoryCards.length > 0 ? dynamicCategoryCards : fallbackCategoryCards;

  return (
    <div className="space-y-24 pb-24">
      <section className="relative isolate overflow-hidden">
        <img src="/Fachada.jpg" alt="Fachada do Jaguar Center Plaza" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b4f6c]/80 via-[#1d6b4c]/75 to-primary-700/75" aria-hidden />
        <div className="absolute -left-24 top-1/3 h-72 w-72 -translate-y-1/2 rounded-full bg-accent-400/40 blur-3xl" aria-hidden />
        <div className="absolute -right-20 bottom-0 h-80 w-80 translate-y-1/3 rounded-full bg-primary-500/40 blur-3xl" aria-hidden />

        <Container className="relative z-10 grid gap-12 py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-center">
          <div className="space-y-6 text-white">
            <p className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
              Jaguar Center Plaza
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              O destino completo para conectar negócios e experiências memoráveis
            </h1>
            <p className="text-lg text-white/80">
              Somos o primeiro shopping corporativo da região com um ecossistema que integra soluções empresariais, conveniência, saúde e bem-estar em um único endereço estratégico.
            </p>
            <p className="text-lg text-white/80">
              Um ambiente completo para empresas, profissionais e visitantes com infraestrutura moderna, segurança, conforto e eventos o ano inteiro.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/empresas"
                className="inline-flex items-center rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-accent-400"
              >
                Conheça as empresas
              </Link>
              <Link
                to="/contato"
                className="inline-flex items-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Agende uma visita
              </Link>
            </div>
            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              {quickInfos.map((info) => (
                <div key={info.label} className="rounded-2xl bg-white/15 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent-100">{info.label}</p>
                  <p className="mt-1 text-sm font-medium text-white">{info.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl bg-white/90 p-8 text-primary-800 shadow-xl backdrop-blur">
              <h2 className="text-xl font-semibold">Tudo para o seu conforto e bem-estar</h2>
              <p className="mt-3 text-sm text-[#4f5d55]">
                Salas comerciais, clínicas, laboratórios, escritórios, gastronomia, conveniência, beleza e serviços públicos em um só endereço.
              </p>
              <div className="mt-6 space-y-4">
                {featureItems.slice(0, 2).map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                      {feature.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-800">{feature.title}</p>
                      <p className="text-xs text-[#4f5d55]">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl bg-primary-50 p-5 text-sm text-primary-700">
                <p className="font-semibold">Estacionamento com 600 vagas e monitoramento 24h.</p>
                <p className="mt-1 text-xs text-primary-600">Acesso fácil pelas principais vias de Jaguariúna e região metropolitana de Campinas.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="-mt-16 lg:-mt-20">
        <Container>
          <div className="rounded-3xl bg-white p-10 shadow-xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-500">Aqui você encontra</p>
              <h2 className="mt-3 text-3xl font-bold text-primary-800 sm:text-4xl">Tudo para o seu conforto e bem-estar</h2>
              <p className="mt-4 text-base text-[#4f5d55]">
                Um mix completo de soluções para quem busca praticidade, networking e qualidade de vida no mesmo lugar.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featureItems.map((feature) => (
                <div key={feature.title} className="flex flex-col gap-4 rounded-2xl bg-[#f4f6f1] p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-800">{feature.title}</h3>
                    <p className="mt-2 text-sm text-[#4f5d55]">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="empresas">
        <Container className="space-y-12">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-500">Empresas por setor</p>
            <h2 className="text-3xl font-bold text-primary-800 sm:text-4xl">Jaguar Center Plaza é o endereço dos principais serviços da cidade</h2>
            <p className="text-base text-[#4f5d55]">
              Mais de 70 empresas dos segmentos corporativo, saúde, estética, gastronomia e conveniência prontas para atender você e sua empresa.
            </p>
          </div>

          {isLoading && (
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="text-sm text-[#4f5d55]">Carregando categorias...</p>
            </div>
          )}

          {isError && !isLoading && (
            <div className="rounded-3xl bg-red-50 p-6 shadow-lg">
              <p className="text-sm text-red-600">Não foi possível carregar as categorias agora. Tente novamente em instantes.</p>
            </div>
          )}

          {!isLoading && categories.length === 0 && !isError && (
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="text-sm text-[#4f5d55]">Nenhuma categoria cadastrada no momento.</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {categoryCards.map((card) => (
              <article key={card.title} className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg">
                <div className="relative h-44 w-full overflow-hidden">
                  <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-700">
                    {card.companiesLabel}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="text-xl font-semibold text-primary-800">{card.title}</h3>
                  <p className="flex-1 text-sm text-[#4f5d55]">{card.description}</p>
                  <Link
                    to="/empresas"
                    className="inline-flex items-center text-sm font-semibold text-primary-600 transition-colors hover:text-accent-500"
                  >
                    Ver empresas
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 py-16">
        <Container className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-200">Eventos corporativos</p>
            <h2 className="text-3xl font-bold sm:text-4xl">Auditórios, salas de reunião e espaços para ativações</h2>
            <p className="text-base text-white/80">
              Rooftop com vista panorâmica, áreas modulares para treinamentos, lounges corporativos e suporte especializado em produção de eventos.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/90">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent-300" />
                Plataforma digital para reservar espaços e acompanhar relatórios de performance.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent-300" />
                Equipe de produção executiva, cenografia e suporte técnico para eventos corporativos.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent-300" />
                Conexão com fornecedores homologados de catering, tecnologia e experiências imersivas.
              </li>
            </ul>
            <Link
              to="/contato"
              className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-lg transition-colors hover:bg-accent-200"
            >
              Solicitar proposta
            </Link>
          </div>
          <div className="relative space-y-6">
            <div className="space-y-4 rounded-2xl bg-white/90 p-6 text-sm text-primary-700 shadow-lg backdrop-blur">
              <h3 className="text-lg font-semibold text-primary-800">Infraestrutura completa</h3>
              <p className="text-[#4f5d55]">
                Estacionamento para convidados, salas de apoio, camarins, wi-fi dedicado, sonorização e equipe de recepção bilíngue para seus eventos.
              </p>
            </div>
            <div className="space-y-4 rounded-2xl bg-white/90 p-6 text-sm text-primary-700 shadow-lg backdrop-blur">
              <h3 className="text-lg font-semibold text-primary-800">Hospitalidade e serviços</h3>
              <p className="text-[#4f5d55]">
                Concierge corporativo, curadoria gastronômica e programação cultural que potencializa experiências inesquecíveis.
              </p>
            </div>
          </div>
        </Container>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-200/70 blur-3xl" aria-hidden />
        <div className="absolute -bottom-10 -left-10 h-52 w-52 rounded-full bg-primary-300/60 blur-3xl" aria-hidden />
      </section>

      <section id="novidades">
        <Container className="space-y-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-500">Novidades e eventos</p>
            <h2 className="text-3xl font-bold text-primary-800 sm:text-4xl">Acompanhe o que acontece no Jaguar Center Plaza</h2>
            <p className="text-base text-[#4f5d55]">
              Programação cultural, ações sociais, eventos corporativos e novidades das empresas residentes.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {newsPosts.map((post) => (
              <article key={post.title} className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg">
                <div className="relative h-48 w-full overflow-hidden">
                  <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                  <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-700">
                    {post.date}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="text-xl font-semibold text-primary-800">{post.title}</h3>
                  <p className="flex-1 text-sm text-[#4f5d55]">{post.excerpt}</p>
                  <Link
                    to="/contato"
                    className="inline-flex items-center text-sm font-semibold text-primary-600 transition-colors hover:text-accent-500"
                  >
                    Saiba mais
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
