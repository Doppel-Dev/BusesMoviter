import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaHardHat, FaBusAlt, FaHandshake, FaShieldAlt } from 'react-icons/fa';
import './Services.css';

const services = [
  {
    icon: <FaHardHat />,
    title: 'Transporte de Personal',
    desc: 'Traslado eficiente y seguro para cuadrillas de construcción y personal operativo en entornos industriales y corporativos.'
  },
  {
    icon: <FaBusAlt />,
    title: 'Viajes Especiales',
    desc: 'Servicios personalizados para eventos corporativos, giras técnicas y traslados de delegaciones a nivel nacional.'
  },
  {
    icon: <FaShieldAlt />,
    title: 'Seguridad Certificada',
    desc: 'Cumplimos con los más altos estándares de seguridad exigidos por las principales empresas industriales y de infraestructura.'
  },
  {
    icon: <FaHandshake />,
    title: 'Alianzas Estratégicas',
    desc: '35 años de experiencia trabajando codo a codo con las principales empresas de infraestructura de Chile.'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] }
  }
};

const Services = () => {
  return (
    <section id="servicios" className="services-corporate-section">
      <div className="services-bg-decoration"></div>
      <Container>
        <motion.div 
          className="text-center mb-5 pb-3"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Nuestra Experiencia</h2>
          <p className="services-intro">Soluciones de transporte diseñadas para la continuidad operativa de su empresa.</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <Row className="g-5">
            {services.map((s, i) => (
              <Col lg={3} md={6} key={i}>
                <motion.div
                  className="service-card-premium"
                  variants={cardVariants}
                >
                  <div className="card-inner-content">
                    <motion.div 
                      className="service-icon-box-modern"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {s.icon}
                    </motion.div>
                    <h3 className="service-card-title">{s.title}</h3>
                    <p className="service-card-text">{s.desc}</p>
                    <div className="card-footer-decoration"></div>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      </Container>
    </section>
  );
};

export default Services;
