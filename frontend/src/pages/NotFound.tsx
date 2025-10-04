import { Link } from 'react-router-dom';
import Container from '../components/layout/Container';
import { useSEO } from '../hooks/useSEO';

export default function NotFoundPage() {
  useSEO({
    title: 'Página não encontrada — Jaguar Center Plaza',
    description: 'Ops! O conteúdo que você procura não está mais disponível.'
  });

  return (
    <section className="py-24">
      <Container className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">Erro 404</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">Conteúdo não encontrado</h1>
        <p className="mt-4 text-base text-slate-600">
          Verifique se o endereço digitado está correto ou volte para a página inicial para continuar navegando pelo Jaguar Center Plaza.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-500"
          >
            Voltar para o início
          </Link>
          <Link
            to="/contato"
            className="inline-flex items-center rounded-full border border-primary-200 px-6 py-3 text-sm font-semibold text-primary-700 transition hover:border-primary-400 hover:text-primary-600"
          >
            Falar com a equipe
          </Link>
        </div>
      </Container>
    </section>
  );
}
