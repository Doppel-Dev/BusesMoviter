import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaCheckCircle, FaBus, FaCalendarAlt, FaUserAlt, FaPhoneAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './QuoteForm.css';

const QuoteForm = () => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceType: '',
    passengers: '',
    date: '',
    details: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep(3); // Mostrar un estado de "procesando" o simplemente saltar al final si es rápido
    
    try {
      const response = await fetch('http://localhost:5000/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Hubo un error al enviar la solicitud. Por favor, intente llamando directamente.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (submitted) {
    return (
      <Container className="quote-form-container d-flex align-items-center justify-content-center">
        <motion.div 
          className="success-message-box text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <FaCheckCircle className="success-icon" />
          <h2>¡Solicitud Recibida!</h2>
          <p>Hemos recibido sus datos exitosamente. Un ejecutivo se pondrá en contacto con usted en las próximas 24 horas hábiles.</p>
          <Link to="/" className="btn-corporate-primary text-decoration-none d-inline-block mt-3">
            Volver al Inicio
          </Link>
        </motion.div>
      </Container>
    );
  }

  return (
    <div className="quote-page-wrapper">
      <div className="quote-page-bg"></div>
      
      <Container className="quote-form-container py-5">
        <Link to="/" className="back-link mb-4 d-inline-flex align-items-center">
          <FaArrowLeft className="me-2" /> Volver al Inicio
        </Link>

        <motion.div 
          className="quote-card-modern shadow-lg"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Row className="g-0">
            <Col lg={4} className="quote-sidebar d-none d-lg-block">
              <div className="sidebar-content">
                <div className="sidebar-header">
                  <FaBus className="sidebar-bus-icon" />
                  <h3>Cotización <br />Premium</h3>
                  <p>Obtenga un presupuesto detallado para sus necesidades de transporte corporativo.</p>
                </div>
                
                <div className="step-indicators mt-5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`step-item ${step >= i ? 'active' : ''}`}>
                      <span className="step-num">{i}</span>
                      <span className="step-label">
                        {i === 1 ? 'Datos Personales' : i === 2 ? 'Detalles del Viaje' : 'Confirmación'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
            
            <Col lg={8} className="quote-main-form">
              <Form onSubmit={handleSubmit} className="p-4 p-md-5">
                <AnimatePresence mode='wait'>
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                    >
                      <h2 className="form-title mb-4">Información de Contacto</h2>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nombre Completo</Form.Label>
                            <Form.Control 
                              type="text" 
                              name="name" 
                              required 
                              placeholder="Ej: Juan Pérez" 
                              onChange={handleChange}
                              value={formData.name}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Teléfono de Contacto</Form.Label>
                            <Form.Control 
                              type="tel" 
                              name="phone" 
                              required 
                              placeholder="+56 9 1234 5678" 
                              onChange={handleChange}
                              value={formData.phone}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>Correo Electrónico</Form.Label>
                            <Form.Control 
                              type="email" 
                              name="email" 
                              required 
                              placeholder="juan@empresa.cl" 
                              onChange={handleChange}
                              value={formData.email}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group className="mb-4">
                            <Form.Label>Empresa (Opcional)</Form.Label>
                            <Form.Control 
                              type="text" 
                              name="company" 
                              placeholder="Nombre de su organización" 
                              onChange={handleChange}
                              value={formData.company}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="d-flex justify-content-end mt-4">
                        <button type="button" className="btn-corporate-primary quote-btn" onClick={nextStep}>
                          Siguiente Paso
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                    >
                      <h2 className="form-title mb-4">Detalles del Servicio</h2>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Tipo de Servicio</Form.Label>
                            <Form.Select 
                              name="serviceType" 
                              required 
                              onChange={handleChange}
                              value={formData.serviceType}
                            >
                              <option value="">Seleccione...</option>
                              <option value="Personal">Transporte de Personal</option>
                              <option value="Especial">Viaje Especial / Gira</option>
                              <option value="Industria">Sector Industrial</option>
                              <option value="Otro">Otro</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>N° de Pasajeros aprox.</Form.Label>
                            <Form.Control 
                              type="number" 
                              name="passengers" 
                              required 
                              placeholder="Ej: 40" 
                              onChange={handleChange}
                              value={formData.passengers}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>Fecha Estimada</Form.Label>
                            <Form.Control 
                              type="date" 
                              name="date" 
                              required 
                              onChange={handleChange}
                              value={formData.date}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group className="mb-4">
                            <Form.Label>Detalles Adicionales</Form.Label>
                            <Form.Control 
                              as="textarea" 
                              rows={3} 
                              name="details" 
                              placeholder="Ruta, requerimientos especiales, etc." 
                              onChange={handleChange}
                              value={formData.details}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="form-actions-wrapper d-flex justify-content-between">
                        <button type="button" className="btn-corporate-outline-dark quote-btn" onClick={prevStep}>
                          Atrás
                        </button>
                        <button type="submit" className="btn-corporate-primary quote-btn">
                          Solicitar Presupuesto
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Form>
            </Col>
          </Row>
        </motion.div>
      </Container>
    </div>
  );
};

export default QuoteForm;
