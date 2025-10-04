import Container from '../components/layout/Container';
import { useSEO } from '../hooks/useSEO';

const milestones = [
  {
    year: '2008',
    title: 'Inauguração do complexo',
    description:
      'Nasce o Jaguar Center Plaza, reunindo serviços essenciais e primeiras operações corporativas no coração de Jaguariúna.'
  },
  {
    year: '2014',
    title: 'Expansão para saúde e bem-estar',
    description:
      'Novos consultórios, clínicas e laboratórios ampliam o atendimento à população com infraestrutura completa e acessível.'
  },
  {
    year: '2021',
    title: 'Hub de inovação e eventos',
    description:
      'Espaços multiuso, coworking e auditórios recebem programas de aceleração, capacitações e encontros setoriais.'
  }
];

const values = [
  {
    title: 'Integração de serviços',
    description:
      'Reunimos diferentes segmentos para facilitar a rotina de empresas, empreendedores e cidadãos em um único endereço.'
  },
  {
    title: 'Hospitalidade e conveniência',
    description:
      'Experiência acolhedora com concierge dedicado, acessibilidade total, estacionamento e alimentação no mesmo local.'
  },
  {
    title: 'Sustentabilidade urbana',
    description:
      'Gestão responsável de recursos, eficiência energética e incentivo à mobilidade inteligente em Jaguariúna.'
  }
];

export default function AboutPage() {
  useSEO({
    title: 'Sobre nós — Jaguar Center Plaza',
    description:
      'Conheça a história, a estrutura e o propósito do Jaguar Center Plaza, o hub de serviços e negócios de Jaguariúna.',
    canonical: 'https://www.jaguarcenterplaza.com.br/sobre-nos'
  });

  return (
    <section className="space-y-24 py-16">
      <Container className="space-y-10">
        <header className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Sobre nós</p>
          <h1 className="section-title">Um hub completo que impulsiona Jaguariúna</h1>
          <p className="section-subtitle">
            O Jaguar Center Plaza nasceu para aproximar pessoas, marcas e serviços públicos em um mesmo lugar. Somos um polo de
            negócios que valoriza a economia local, gera empregos e oferece experiências memoráveis para milhares de visitantes
            todos os meses.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6 rounded-3xl border border-primary-100 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Nossa essência</h2>
            <p className="text-sm text-slate-600">
              Reunimos administração, advocacia, saúde, estética, gastronomia, coworking e serviços públicos em uma estrutura
              que não para de crescer. Cada detalhe foi pensado para garantir conforto, tecnologia e hospitalidade — desde a
              recepção até os espaços de convivência.
            </p>
            <p className="text-sm text-slate-600">
              Atuamos lado a lado com nossos condôminos para promover campanhas, eventos e treinamentos que fortalecem a
              comunidade empresarial de Jaguariúna. Nosso compromisso é ser um parceiro estratégico para quem empreende e para
              quem busca soluções completas em um só lugar.
            </p>
          </div>

          <aside className="space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Indicadores</h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li>
                <span className="block text-2xl font-semibold text-primary-600">+25 mil</span>
                visitantes mensais circulando pelo complexo
              </li>
              <li>
                <span className="block text-2xl font-semibold text-primary-600">12 mil m²</span>
                de área construída com acessibilidade universal
              </li>
              <li>
                <span className="block text-2xl font-semibold text-primary-600">200</span>
                vagas de estacionamento coberto e monitorado
              </li>
            </ul>
          </aside>
        </div>
      </Container>

      <Container className="space-y-10">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Linha do tempo</p>
          <h2 className="section-title">Evolução contínua ao lado da cidade</h2>
          <p className="section-subtitle">
            Crescemos acompanhando o desenvolvimento de Jaguariúna e das empresas que escolheram o Jaguar Center Plaza como
            casa. A cada expansão, novos segmentos e facilidades se somam para atender as necessidades da região.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {milestones.map((milestone) => (
            <div key={milestone.year} className="flex flex-col gap-3 rounded-3xl border border-primary-100 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">{milestone.year}</span>
              <h3 className="text-lg font-semibold text-slate-900">{milestone.title}</h3>
              <p className="text-sm text-slate-600">{milestone.description}</p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="space-y-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Nosso compromisso</p>
            <h2 className="section-title">Um ecossistema a serviço de pessoas e negócios</h2>
            <p className="section-subtitle">
              Mais do que alugar salas, conectamos histórias. Trabalhamos com curadoria ativa de marcas e profissionais para
              garantir diversidade de serviços e experiências positivas para quem visita o Jaguar Center Plaza todos os dias.
            </p>
            <p className="text-sm text-slate-600">
              Nossa equipe multidisciplinar acompanha desde o planejamento da operação até o dia a dia dos condôminos, oferecendo
              suporte comercial, jurídico e de marketing para potencializar resultados.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{value.title}</h3>
                <p className="mt-3">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
