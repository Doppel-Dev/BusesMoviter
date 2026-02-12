import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BusLogo from './BusLogo';
import './NavigationBar.css';

const NavigationBar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className={scrolled ? 'navbar-corporate scrolled' : 'navbar-corporate'}
    >
      <Container>
        <Navbar.Brand href="#home" className="brand-corporate d-flex align-items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <BusLogo size={55} className="me-3 brand-logo-anim" />
          </motion.div>
          <span className="brand-text-wrapper">
            <span className="brand-accent">BUSES</span> MOVITER
          </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {['Servicios', 'Clientes', 'Galería', 'Contacto'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
              >
                <Nav.Link 
                  href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
                  className="nav-link-corporate"
                >
                  <span className="nav-link-text">{item}</span>
                  <span className="nav-link-underline"></span>
                </Nav.Link>
              </motion.div>
            ))}
            <motion.div
               initial={{ x: 20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.5, duration: 0.5 }}
               className="ms-lg-4 mt-3 mt-lg-0"
            >
              <Link to="/cotizar" className="btn-nav-cta">Cotizar Ahora</Link>
            </motion.div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
