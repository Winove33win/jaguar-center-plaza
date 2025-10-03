import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f6f1]">
      <Header />
      <main className="flex-1 pb-20 pt-0">{children}</main>
      <Footer />
    </div>
  );
}
