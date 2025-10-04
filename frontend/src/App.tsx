import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AboutPage from './pages/About';
import ContactPage from './pages/Contact';
import HomePage from './pages/Home';
import NotFoundPage from './pages/NotFound';
import RoomsPage from './pages/Rooms';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sobre-nos" element={<AboutPage />} />
        <Route path="/salas" element={<RoomsPage />} />
        <Route path="/contato" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
