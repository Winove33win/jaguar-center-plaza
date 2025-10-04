import { Link } from 'react-router-dom';
import Container from '../components/layout/Container';
import { useSEO } from '../hooks/useSEO';

const featureItems = [
  {
    title: 'Salas comerciais',
    description: 'Ambientes moduláveis com climatização, piso elevado e suporte técnico para empresas de todos os portes.',
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
    title: 'Saúde integrada',
    description: 'Consultórios acessíveis, recepção compartilhada e infraestrutura para exames, procedimentos e terapias.',
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
    description: 'Salões, barbearias, spas e clínicas de estética com instalações prontas para atendimento premium.',
    icon: (
      <svg aria-hidden className="h-7 w-7 text-primary-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 16c4-4 7-9 7-13" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 7c0 5.523-3.582 10-8 10 1.724 2.354 4.527 4 7.5 4 5.523 0 10-4.03 10-9 0-2.876-1.58-5.395-4-6.903" />
      </svg>
    )
  },
  {
    title: 'Serviços essenciais',
    description: 'Lotéricas, cartórios, alimentação e facilidades abertas ao público em um endereço estratégico.',
    icon: (
      <svg aria-hidden className="h-7 w-7 text-primary-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M3 5h18M5 5v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5" />
        <path d="M9 9h6" strokeLinecap="round" />
        <path d="M12 9v8" strokeLinecap="round" />
      </svg>
    )
  }
];

const highlightItems = [
  { title: '+180 empresas', description: 'Negócios e serviços que movimentam diariamente o ecossistema do Jaguar Center Plaza.' },
  { title: '10 segmentos', description: 'Espaços dedicados para administração, advocacia, saúde, beleza, gastronomia e muito mais.' },
  { title: 'Localização estratégica', description: 'No coração de Jaguariúna, com fácil acesso às principais rodovias da região metropolitana de Campinas.' }
];

const quickInfos = [
  { label: 'Horário de funcionamento', value: 'Segunda a sexta: 8h às 20h · Sábado: 8h às 14h' },
  { label: 'Endereço', value: 'Rua Amazonas, 504 · Centro · Jaguariúna · SP' },
  { label: 'Telefone', value: '(19) 3833-5600' }
];

export default function HomePage() {
  useSEO({
    title: 'Jaguar Center Plaza — O complexo empresarial de Jaguariúna',
    description:
      'Salas comerciais, consultórios, serviços essenciais e áreas de convivência em um endereço completo para empresas e cidadãos de Jaguariúna.'
  });

  return (
    <section className="space-y-24 py-16">
      <Container className="space-y-12">
        <header className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Jaguar Center Plaza</p>
            <h1 className="text-5xl font-semibold text-slate-900">O ponto de encontro dos serviços em Jaguariúna</h1>
            <p className="text-lg text-slate-600">
              Estrutura completa para profissionais liberais, clínicas, escritórios e operações públicas. Aqui sua empresa
              se conecta a uma comunidade vibrante, com conveniência, segurança e eventos permanentes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/salas"
                className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500"
              >
                Explore as salas disponíveis
              </Link>
              <Link
                to="/sobre-nos"
                className="inline-flex items-center rounded-full border border-primary-200 px-6 py-3 text-sm font-semibold text-primary-700 transition hover:border-primary-400 hover:text-primary-600"
              >
                Conheça o Jaguar Center Plaza
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
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Estrutura completa</p>
          <h2 className="section-title">Mais do que um centro comercial, um ecossistema de oportunidades</h2>
          <p className="section-subtitle">
            A cada andar você encontra soluções sob medida para sua operação: recepção integrada, estacionamento amplo,
            apoio de facilities, tecnologia e segurança 24h. Tudo pensado para que você cuide apenas do crescimento do seu
            negócio.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {highlightItems.map((item) => (
            <div key={item.title} className="flex flex-col gap-3 rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
              <span className="text-2xl font-semibold text-primary-600">{item.title}</span>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="space-y-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Experiência Jaguar Center</p>
            <h2 className="section-title">Eventos, capacitação e networking o ano todo</h2>
            <p className="section-subtitle">
              Workshops, feiras, lançamentos e ações de relacionamento conectam empresas, cidadãos e o poder público em um
              calendário vibrante. Seja para reunir sua equipe ou apresentar um novo serviço à cidade, o Jaguar Center Plaza
              está pronto para receber.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/contato"
                className="inline-flex items-center rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-400"
              >
                Agende uma visita guiada
              </Link>
              <Link
                to="/salas"
                className="inline-flex items-center rounded-full border border-primary-200 px-6 py-3 text-sm font-semibold text-primary-700 transition hover:border-primary-400 hover:text-primary-600"
              >
                Veja todas as áreas
              </Link>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Conveniências</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Estacionamento com controle de acesso e valet</li>
                <li>Praça de alimentação e cafés especiais</li>
                <li>Espaços para eventos corporativos e treinamentos</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Suporte operacional</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Recepção centralizada e concierge bilíngue</li>
                <li>Monitoramento 24h e portaria eletrônica</li>
                <li>Internet de alta velocidade e backup de energia</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
