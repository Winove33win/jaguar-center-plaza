import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import BlogPostPage from './pages/BlogPost';
import BlogPage from './pages/Blog';
import CasesPage from './pages/Cases';
import ContactPage from './pages/Contact';
import HomePage from './pages/Home';
import NotFoundPage from './pages/NotFound';
import TemplateDetailPage from './pages/TemplateDetail';
import TemplatesPage from './pages/Templates';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/templates/:slug" element={<TemplateDetailPage />} />
        <Route path="/contato" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
