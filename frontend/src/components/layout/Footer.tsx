import Container from './Container';

const siteLinks = [
  { label: 'Home', href: '/' },
  { label: 'Empresas', href: '/empresas' },
  { label: 'Sobre nós', href: '/sobre-nos' },
  { label: 'Contato', href: '/contato' }
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-primary-900 text-primary-50">
      <Container className="grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-4">
          <img src="/logo-jaguar-center-plaza-002b-768x535.png" alt="Jaguar Center Plaza" className="h-16 w-auto" />
          <p className="text-sm leading-relaxed text-primary-100">
            Centro empresarial que reúne serviços corporativos, saúde, beleza, lojas e órgãos públicos em Jaguariúna.
          </p>
          <p className="text-sm text-primary-100">CNPJ 07.711.519/0001-80</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Nosso site</h3>
          <ul className="mt-4 space-y-2 text-sm text-primary-100">
            {siteLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="inline-flex items-center gap-2 transition-colors hover:text-accent-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-400" aria-hidden />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Horário</h3>
          <ul className="mt-4 space-y-2 text-sm text-primary-100">
            <li>Segunda a sexta-feira: 7h às 21h</li>
            <li>Sábados: 8h às 14h</li>
          </ul>
          <p className="mt-4 text-sm text-primary-100">Atendimento ao cliente: jaguarcenterplaza@hotmail.com</p>
        </div>

        <div className="space-y-3 text-sm text-primary-100">
          <h3 className="text-lg font-semibold text-white">Fale com a gente</h3>
          <p>Telefone: (19) 3837-3391</p>
          <p>E-mail: jaguarcenterplaza@hotmail.com</p>
          <div className="pt-2">
            <p className="text-sm font-semibold text-white">Endereço</p>
            <p>Rua Cândido Bueno, 1299 · Centro</p>
            <p>CEP 13910-033 · Jaguariúna · SP</p>
          </div>
          <a
            href="https://maps.app.goo.gl/ykhyvq3LvVVuuJMD6"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-400"
          >
            Como chegar
          </a>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="py-6 text-center text-xs text-primary-200">
          © {new Date().getFullYear()} Jaguar Center Plaza. Todos os direitos reservados.
        </Container>
      </div>
    </footer>
  );
}
