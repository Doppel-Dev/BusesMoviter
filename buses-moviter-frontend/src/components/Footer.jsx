import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import BusLogo from './BusLogo';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-corporate">
      <div className="footer-accent-line"></div>
      <Container>
        <Row className="align-items-center">
          <Col md={6}>
            <div className="footer-brand-corporate d-flex align-items-center">
              <BusLogo size={45} className="me-3" />
              <span><span className="brand-accent">BUSES</span> MOVITER</span>
            </div>
            <p className="footer-tagline">35 años de experiencia y compromiso con la industria chilena.</p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="footer-copy">
              &copy; {new Date().getFullYear()} Buses Moviter SpA. Todos los derechos reservados.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
