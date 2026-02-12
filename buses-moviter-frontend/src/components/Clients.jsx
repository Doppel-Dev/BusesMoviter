import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import './Clients.css';

// Import logos
import logoIcafal from '../assets/logo-icafal.png';
import logoFernandezWood from '../assets/logo-fernandezwood.png';
import logo3L from '../assets/logo-3l.png';
import logoDeVicente from '../assets/logo-de-vicente.png';
import logoLaPaz from '../assets/logo-la-paz.jpg';
import logoLoCampino from '../assets/logo-lo-campino.jpg';

const clients = [
  { 
    name: 'Icafal', 
    sector: 'Ingeniería y Construcción',
    logo: <img src={logoIcafal} alt="Icafal" />
  },
  { 
    name: 'Fernandez Wood', 
    sector: 'Inmobiliaria',
    logo: <img src={logoFernandezWood} alt="Fernandez Wood" />
  },
  { 
    name: '3L', 
    sector: 'Constructora',
    logo: <img src={logo3L} alt="3L" />
  },
  { 
    name: 'La Paz', 
    sector: 'Inmobiliaria y Constructora',
    logo: <img src={logoLaPaz} alt="La Paz" />
  },
  { 
    name: 'De Vicente', 
    sector: 'Constructora',
    logo: <img src={logoDeVicente} alt="De Vicente" />
  },
  { 
    name: 'Lo Campino', 
    sector: 'Inmobiliaria',
    logo: <img src={logoLoCampino} alt="Lo Campino" />
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "backOut" }
  }
};

const Clients = () => {
  return (
    <section id="clientes" className="clients-corporate-section">
      <div className="clients-bg-glow"></div>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-5"
        >
          <h2 className="section-title">Confianza Empresarial</h2>
          <p className="clients-subtitle">
            Socio estratégico de las constructoras e inmobiliarias más importantes de Chile.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <Row className="g-4 justify-content-center">
            {clients.map((client, index) => (
              <Col key={index} lg={4} md={6}>
                <motion.div 
                  className="client-logo-card-modern"
                  variants={itemVariants}
                >
                  <div className="client-logo-svg-wrapper">
                    {client.logo}
                  </div>
                  <div className="client-details-modern">
                    <h4 className="client-name-modern">{client.name}</h4>
                    <p className="client-sector-modern">{client.sector}</p>
                  </div>
                  <div className="client-card-glow"></div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      </Container>
    </section>
  );
};

export default Clients;
