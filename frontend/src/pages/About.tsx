import Container from '../components/layout/Container';
import { useSEO } from '../hooks/useSEO';

const milestones = [
  {
    year: '1996',
    title: 'Fundação do condomínio',
    description:
      'O Jaguar Center Plaza é inaugurado em 05 de agosto de 1996 na Rua Cândido Bueno, 1299, consolidando um endereço estratégico no centro de Jaguariúna.'
  },
  {
    year: '2005',
    title: 'Ampliação das operações',
    description:
      'A estrutura recebe novas salas comerciais e aprimora o atendimento às empresas com serviços essenciais a poucos passos, incluindo acesso facilitado a redes bancárias.'
  },
  {
    year: '2018',
    title: 'Modernização da infraestrutura',
    description:
      'Estacionamento ampliado, escada rolante, elevador de serviço e sistema de monitoramento por câmeras reforçam a experiência e a segurança para condôminos e visitantes.'
  }
];

const values = [
  {
    title: 'Localização privilegiada',
    description:
      'Estamos em uma das principais vias de Jaguariúna, facilitando o acesso de clientes e parceiros a bancos, serviços públicos e ao comércio local.'
  },
  {
    title: 'Estrutura completa',
    description:
      'Com 50 salas comerciais, estacionamento amplo, escada rolante e elevador de serviço, oferecemos comodidade para operações de diferentes portes.'
  },
  {
    title: 'Ambiente seguro e acolhedor',
    description:
      'Monitoramento por câmeras e paisagismo cuidadoso criam um espaço agradável para trabalhar, receber clientes e construir relacionamentos duradouros.'
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
          <h1 className="section-title">Um endereço tradicional para fazer negócios em Jaguariúna</h1>
          <p className="section-subtitle">
            Fundado em 1996, o Condomínio Jaguar Center Plaza reúne empresas e profissionais que transformam o centro da cidade
            em um polo comercial vibrante. Nossa infraestrutura é pensada para facilitar a rotina de quem empreende e de quem
            busca serviços essenciais em um único endereço.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6 rounded-3xl border border-primary-100 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Nossa essência</h2>
            <p className="text-sm text-slate-600">
              Localizado na Rua Cândido Bueno, 1299, o Jaguar Center Plaza coloca empresas em uma região central, com fácil
              conexão a serviços financeiros, alimentação e transporte. Cada sala recebe atenção especial para garantir
              conforto, acessibilidade e a hospitalidade que nossos condôminos merecem.
            </p>
            <p className="text-sm text-slate-600">
              A administração do condomínio oferece suporte próximo às empresas instaladas, promovendo melhorias contínuas na
              infraestrutura, zelando pela segurança e estimulando um ambiente colaborativo que fortalece o comércio local de
              Jaguariúna.
            </p>
          </div>

          <aside className="space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Indicadores</h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li>
                <span className="block text-2xl font-semibold text-primary-600">50</span>
                salas comerciais distribuídas em um único empreendimento
              </li>
              <li>
                <span className="block text-2xl font-semibold text-primary-600">1996</span>
                ano de inauguração do Jaguar Center Plaza
              </li>
              <li>
                <span className="block text-2xl font-semibold text-primary-600">(19) 3837-3391</span>
                canal direto para informações e suporte administrativo
              </li>
            </ul>
          </aside>
        </div>
      </Container>

      <Container className="space-y-10">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Linha do tempo</p>
          <h2 className="section-title">Tradição que acompanha o desenvolvimento da cidade</h2>
          <p className="section-subtitle">
            Desde a fundação, acompanhamos as transformações de Jaguariúna ao oferecer infraestrutura moderna, segurança e
            facilidades que ajudam empreendedores a prosperar. A cada etapa, reforçamos nosso compromisso com quem escolhe o
            Jaguar Center Plaza como ponto de referência.
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
            <h2 className="section-title">Estrutura pronta para receber diferentes negócios</h2>
            <p className="section-subtitle">
              Muito mais do que um conjunto de salas, somos um condomínio preparado para receber empresas de diversos segmentos
              com suporte administrativo, manutenção constante e atenção à experiência de clientes e colaboradores.
            </p>
            <p className="text-sm text-slate-600">
              Do estacionamento amplo ao monitoramento por câmeras, passando pelo paisagismo e pelas áreas de circulação, cada
              detalhe contribui para que o Jaguar Center Plaza seja um local confortável, seguro e funcional para quem trabalha
              e visita.
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
