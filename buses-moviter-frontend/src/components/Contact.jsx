import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section id="contacto" className="contact-corporate-section">
      <div className="contact-bg-pattern"></div>
      <Container>
        <motion.div 
          className="text-center mb-5 pb-3"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Canales de Atención</h2>
          <p className="contact-subtitle">Estamos disponibles para responder sus dudas y coordinar sus requerimientos.</p>
        </motion.div>

        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
          <Row className="g-4 justify-content-center">
            <Col lg={4}>
              <motion.div 
                className="contact-info-panel-modern"
                variants={itemVariants}
              >
                <h3 className="panel-title-modern">Sede Central</h3>
                <div className="info-item-modern">
                  <div className="info-icon-wrapper">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <span className="info-tag-modern">Ubicación</span>
                    <p className="info-txt-modern">Santiago, Región Metropolitana, Chile</p>
                  </div>
                </div>
                <div className="info-item-modern">
                  <div className="info-icon-wrapper">
                    <FaClock />
                  </div>
                  <div>
                    <span className="info-tag-modern">Horario Operativo</span>
                    <p className="info-txt-modern">Lunes a Viernes: 08:30 - 18:30</p>
                  </div>
                </div>
              </motion.div>
            </Col>

            <Col lg={4} md={6}>
              <motion.div 
                className="contact-card-interactive"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <div className="card-accent-line"></div>
                <div className="interactive-icon-box">
                  <FaPhoneAlt />
                </div>
                <h4>Llamada Directa</h4>
                <p>Hable con uno de nuestros ejecutivos para una atención personalizada.</p>
                <div className="links-stack">
                  <a href="tel:+56981796847" className="interactive-link">+56 9 8179 6847</a>
                  <a href="tel:+56991580069" className="interactive-link">+56 9 9158 0069</a>
                </div>
              </motion.div>
            </Col>

            <Col lg={4} md={6}>
              <motion.div 
                className="contact-card-interactive"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <div className="card-accent-line"></div>
                <div className="interactive-icon-box">
                  <FaEnvelope />
                </div>
                <h4>Email Corporativo</h4>
                <p>Envíenos sus requerimientos técnicos para una cotización formal.</p>
                <a href="mailto:busesmoviter@hotmail.com" className="interactive-link email-link">
                  busesmoviter@hotmail.com
                </a>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </Container>
    </section>
  );
};

export default Contact;
