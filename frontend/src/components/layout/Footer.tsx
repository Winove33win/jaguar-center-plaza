import Container from './Container';

export default function Footer() {
  return (
    <footer className="mt-16 bg-slate-900 py-10 text-slate-300">
      <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">Jaguar Center Plaza</p>
          <p className="text-sm text-slate-400">Av. Jaguar, 1000 · Centro · Jaguaruana</p>
        </div>
        <p className="text-sm text-slate-400">© {new Date().getFullYear()} Jaguar Center Plaza. Todos os direitos reservados.</p>
      </Container>
    </footer>
  );
}
