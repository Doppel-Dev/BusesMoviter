import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Hero from './components/Hero';
import Services from './components/Services';
import Clients from './components/Clients';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Chatbot from './components/Chatbot';
import QuoteForm from './components/QuoteForm';
import './App.css';

// ScrollToTop helper component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const HomePage = () => (
  <>
    <NavigationBar />
    <Hero />
    <Services />
    <Clients />
    <Gallery />
    <Contact />
    <Footer />
  </>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cotizar" element={<QuoteForm />} />
      </Routes>
      <WhatsAppButton />
      <Chatbot />
    </Router>
  );
}

export default App;
