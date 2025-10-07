import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AboutPage from './pages/About';
import ContactPage from './pages/Contact';
import HomePage from './pages/Home';
import CompaniesPage from './pages/Companies';
import CompanyCategoryPage from './pages/CompanyCategory';
import CompanyDetailPage from './pages/CompanyDetail';
import NotFoundPage from './pages/NotFound';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/empresas" element={<CompaniesPage />} />
        <Route path="/empresas/:categorySlug" element={<CompanyCategoryPage />} />
        <Route path="/empresas/:categorySlug/:companySlug" element={<CompanyDetailPage />} />
        <Route path="/sobre-nos" element={<AboutPage />} />
        <Route path="/contato" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
