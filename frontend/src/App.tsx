import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/Home';
import AboutPage from './pages/About';
import ContactPage from './pages/Contact';
import CompaniesPage from './pages/Companies';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sobre-nos" element={<AboutPage />} />
        <Route path="/contato" element={<ContactPage />} />
        <Route path="/empresas" element={<CompaniesPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
