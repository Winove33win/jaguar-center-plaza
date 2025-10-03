import Container from '../components/layout/Container';
import { useSEO } from '../hooks/useSEO';

const timeline = [
  {
    year: '2012',
    title: 'Inauguração do Jaguar Center Plaza',
    description:
      'Nasce o primeiro shopping corporativo do interior com foco em negócios, conveniência e experiências para toda a comunidade.'
  },
  {
    year: '2016',
    title: 'Expansão para o eixo de inovação',
    description:
      'Criamos o Piso Tech, conectando startups, indústrias e laboratórios para acelerar o desenvolvimento de novos produtos.'
  },
  {
    year: '2020',
    title: 'Transformação digital completa',
    description:
      'Lançamos aplicativo próprio, plataforma de eventos híbridos e concierge digital para nossos clientes corporativos.'
  },
  {
    year: '2024',
    title: 'Jaguar Center Plaza 360',
    description:
      'Reposicionamento de marca com foco em ESG, hospitalidade premium e experiências omnicanal para visitantes e parceiros.'
  }
];

export default function AboutPage() {
  useSEO({
    title: 'Sobre nós — Jaguar Center Plaza',
    description:
      'Conheça a história, a visão e o compromisso do Jaguar Center Plaza em ser o hub mais completo da região.',
    canonical: 'https://www.jaguarcenterplaza.com.br/sobre-nos'
  });

  return (
    <div className="space-y-20">
      <section>
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">Sobre nós</p>
            <h1 className="section-title">Um ecossistema vivo que conecta pessoas, marcas e oportunidades</h1>
            <p className="section-subtitle">
              O Jaguar Center Plaza nasceu para ser mais do que um shopping. Somos um ambiente plural, onde negócios
              prosperam, serviços facilitam o dia a dia e experiências unem a comunidade.
            </p>
          </div>
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Nossa visão 2030</h2>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                Ser referência latino-americana em complexos multiuso que integram varejo, serviços, saúde e inovação.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                Transformar dados em inteligência para apoiar lojistas e parceiros com decisões rápidas e assertivas.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                Reduzir 50% das emissões de carbono até 2030 e ampliar iniciativas de impacto social na região.
              </li>
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container>
          <h2 className="section-title">Nossa trajetória</h2>
          <p className="section-subtitle">Marcos que construíram o Jaguar Center Plaza ao longo dos anos.</p>
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {timeline.map((item) => (
              <article key={item.year} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <span className="text-sm font-semibold uppercase tracking-wide text-primary-600">{item.year}</span>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="section-title">Pilares que guiam nossas decisões</h2>
            <p className="section-subtitle">
              Cuidamos das pessoas, do planeta e dos negócios com iniciativas contínuas e mensuráveis.
            </p>
          </div>
          <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Hospitalidade</h3>
              <p className="mt-2 text-sm text-slate-600">
                Concierge humano e digital, lounges exclusivos e atendimento bilíngue para visitantes e executivos.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Inovação aplicada</h3>
              <p className="mt-2 text-sm text-slate-600">
                Laboratórios vivos em parceria com universidades, sensores IoT e analytics para gestão predial.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Sustentabilidade</h3>
              <p className="mt-2 text-sm text-slate-600">
                Energia limpa, certificações ambientais, reciclagem inteligente e programas de logística reversa.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Impacto social</h3>
              <p className="mt-2 text-sm text-slate-600">
                Programas de capacitação para jovens, inclusão produtiva e parcerias com organizações sociais locais.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
