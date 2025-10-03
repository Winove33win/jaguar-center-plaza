import { NavLink } from 'react-router-dom';
import Container from './Container';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Sobre nós', to: '/sobre-nos' },
  { label: 'Contato', to: '/contato' },
  { label: 'Empresas', to: '/empresas' }
];

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
      <Container className="flex items-center justify-between py-4">
        <NavLink to="/" className="text-xl font-semibold text-primary-700">
          Jaguar Center Plaza
        </NavLink>
        <nav className="hidden gap-6 text-sm font-medium text-slate-600 sm:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'text-primary-600 font-semibold' : 'hover:text-primary-500'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sm:hidden">
          <select
            aria-label="Navegação principal"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            onChange={(event) => {
              const value = event.target.value;
              if (value) {
                window.location.href = value;
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Menu
            </option>
            {navItems.map((item) => (
              <option key={item.to} value={item.to}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </Container>
    </header>
  );
}
