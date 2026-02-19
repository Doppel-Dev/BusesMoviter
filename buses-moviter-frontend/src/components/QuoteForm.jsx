import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaCheckCircle, FaBus, FaCalendarAlt, FaUserAlt, FaPhoneAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';
import "react-datepicker/dist/react-datepicker.css";
import './QuoteForm.css';

registerLocale('es', es);

const TripMap = React.memo(({ origin, destination, stops }) => {
  const [response, setResponse] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const lastRequest = React.useRef("");

  const directionsCallback = React.useCallback((res) => {
    if (res !== null) {
      if (res.status === 'OK') {
        setResponse(res);
        setError(null);
      } else {
        setError(res.status);
      }
      setLoading(false);
    }
  }, []);

  const waypointsStr = (stops || []).map(s => s.location?.value?.place_id).filter(Boolean).join('|');
  const currentRequestKey = `${origin?.value?.place_id}-${destination?.value?.place_id}-${waypointsStr}`;

  React.useEffect(() => {
    if (origin?.value?.place_id && destination?.value?.place_id && currentRequestKey !== lastRequest.current) {
      setLoading(true);
      setResponse(null);
      lastRequest.current = currentRequestKey;
    }
  }, [currentRequestKey]);

  if (!origin || !destination) return <div className="map-placeholder">Seleccione origen y destino para ver la ruta</div>;

  const waypoints = (stops || [])
    .filter(stop => stop.location?.value?.place_id)
    .map(stop => ({
      location: { placeId: stop.location.value.place_id },
      stopover: true
    }));

  return (
    <div className="mini-map-container mt-2" style={{ position: 'relative' }}>
      {loading && <div className="map-loading-overlay">Cargando ruta...</div>}
      {error && (
        <div className="map-error-overlay">
          <small>Error: {error === 'REQUEST_DENIED' ? 'Falta activar "Directions API"' : error}</small>
        </div>
      )}
      <GoogleMap
        id={`map-${origin.value.place_id}`}
        mapContainerStyle={{ height: '200px', width: '100%', borderRadius: '8px' }}
        zoom={12}
        center={{ lat: -33.4489, lng: -70.6693 }}
      >
        {!response && !error && (
          <DirectionsService
            options={{
              destination: { placeId: destination.value.place_id },
              origin: { placeId: origin.value.place_id },
              waypoints: waypoints,
              travelMode: 'DRIVING',
              avoidHighways: true,
            }}
            callback={directionsCallback}
          />
        )}
        {response !== null && (
          <DirectionsRenderer
            options={{
              directions: response,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
});

const QuoteForm = () => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceType: '',
    passengers: '',
    date: new Date(),
    tripType: 'roundTrip', // 'oneWay' o 'roundTrip'
    trips: [{ id: Date.now(), origin: null, stops: [], destination: null }],
    details: ''
  });

  const handleDateChange = (date) => {
    setFormData({ ...formData, date: date });
  };

  const addTrip = () => {
    setFormData({ ...formData, trips: [...formData.trips, { id: Date.now(), origin: null, stops: [], destination: null }] });
  };

  const removeTrip = (id) => {
    if (formData.trips.length > 1) {
      setFormData({ 
        ...formData, 
        trips: formData.trips.filter(trip => trip.id !== id) 
      });
    }
  };

  const addStop = (tripId) => {
    setFormData(prev => ({
      ...prev,
      trips: prev.trips.map(trip => 
        trip.id === tripId 
          ? { ...trip, stops: [...trip.stops, { id: Date.now(), location: null, time: '' }] } 
          : trip
      )
    }));
  };

  const removeStop = (tripId, stopId) => {
    setFormData(prev => ({
      ...prev,
      trips: prev.trips.map(trip => 
        trip.id === tripId 
          ? { ...trip, stops: trip.stops.filter(stop => stop.id !== stopId) } 
          : trip
      )
    }));
  };

  const handleStopChange = (val, tripId, stopId, field) => {
    setFormData(prev => ({
      ...prev,
      trips: prev.trips.map(trip => 
        trip.id === tripId 
          ? { 
              ...trip, 
              stops: trip.stops.map(stop => 
                stop.id === stopId ? { ...stop, [field]: val } : stop
              ) 
            } 
          : trip
      )
    }));
  };

  const handleTripChange = (val, id, field) => {
    setFormData(prev => ({
      ...prev,
      trips: prev.trips.map(trip => 
        trip.id === id ? { ...trip, [field]: val } : trip
      )
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setTimeout(() => {
          setLoading(false);
          setSubmitted(true);
        }, 3000); // 3 segundos de animación para que se aprecie el bus
      } else {
        setLoading(false);
        alert('Hubo un error al enviar la solicitud.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (loading) {
    return (
      <Container className="quote-form-container d-flex align-items-center justify-content-center">
        <div className="bus-loading-wrapper text-center">
          <div className="bus-path">
            <motion.div 
              className="bus-icon-loader"
              animate={{ x: [-100, 400] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <FaBus />
            </motion.div>
          </div>
          <h3 className="mt-4">Calculando su ruta...</h3>
          <p className="text-muted">Estamos procesando los trayectos con Google Maps</p>
        </div>
      </Container>
    );
  }

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
                            <div className="datepicker-wrapper">
                              <DatePicker
                                selected={formData.date}
                                onChange={handleDateChange}
                                dateFormat="dd/MM/yyyy"
                                className="form-control"
                                locale="es"
                                minDate={new Date()}
                                placeholderText="Seleccione una fecha"
                              />
                              <FaCalendarAlt className="datepicker-icon" />
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">Tipo de Viaje</Form.Label>
                            <div className="d-flex gap-4">
                              <Form.Check 
                                type="radio"
                                label="Solo Ida"
                                name="tripType"
                                id="oneWay"
                                value="oneWay"
                                checked={formData.tripType === 'oneWay'}
                                onChange={handleChange}
                              />
                              <Form.Check 
                                type="radio"
                                label="Ida y Vuelta"
                                name="tripType"
                                id="roundTrip"
                                value="roundTrip"
                                checked={formData.tripType === 'roundTrip'}
                                onChange={handleChange}
                              />
                            </div>
                            <Form.Text className="text-muted">
                              {formData.tripType === 'roundTrip' ? '* El presupuesto se calculará considerando el retorno.' : '* Presupuesto solo para el trayecto de ida.'}
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Label className="fw-bold mb-3">Defina sus Trayectos (Opcional)</Form.Label>
                          {formData.trips.map((trip, index) => (
                            <div key={trip.id} className="trip-segment-box p-3 mb-4 border rounded bg-light position-relative">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="badge bg-primary">Trayecto {index + 1}</span>
                                {formData.trips.length > 1 && (
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => removeTrip(trip.id)}
                                  >
                                    Eliminar
                                  </Button>
                                )}
                              </div>
                              <Row>
                                <Col md={6} className="mb-2">
                                  <Form.Label className="small fw-bold">Punto de Salida</Form.Label>
                                  <GooglePlacesAutocomplete
                                    apiKey="AIzaSyAcwokKJ7ngkj36HrmbeGplRlTf5SSzop8"
                                    autocompletionRequest={{ componentRestrictions: { country: ['cl'] } }}
                                    selectProps={{
                                      value: trip.origin,
                                      onChange: (val) => handleTripChange(val, trip.id, 'origin'),
                                      placeholder: "Ej: Metro Santa Ana",
                                      className: "google-autocomplete-container"
                                    }}
                                  />
                                </Col>
                                <Col md={6} className="mb-2">
                                  <Form.Label className="small fw-bold">Punto de Llegada</Form.Label>
                                  <GooglePlacesAutocomplete
                                    apiKey="AIzaSyAcwokKJ7ngkj36HrmbeGplRlTf5SSzop8"
                                    autocompletionRequest={{ componentRestrictions: { country: ['cl'] } }}
                                    selectProps={{
                                      value: trip.destination,
                                      onChange: (val) => handleTripChange(val, trip.id, 'destination'),
                                      placeholder: "Ej: Metro Cerrillos",
                                      className: "google-autocomplete-container"
                                    }}
                                  />
                                </Col>
                              </Row>

                              {/* Sección de Paradas Intermedias */}
                              <div className="stops-container mt-3 mb-3">
                                <Form.Label className="small fw-bold text-muted d-block mb-2">Paradas Intermedias (Opcional)</Form.Label>
                                {trip.stops.map((stop, sIndex) => (
                                  <div key={stop.id} className="stop-item-row d-flex gap-2 mb-2 align-items-start">
                                    <div className="flex-grow-1">
                                      <GooglePlacesAutocomplete
                                        apiKey="AIzaSyAcwokKJ7ngkj36HrmbeGplRlTf5SSzop8"
                                        autocompletionRequest={{ componentRestrictions: { country: ['cl'] } }}
                                        selectProps={{
                                          value: stop.location,
                                          onChange: (val) => handleStopChange(val, trip.id, stop.id, 'location'),
                                          placeholder: `Parada ${sIndex + 1}`,
                                          className: "google-autocomplete-container-small"
                                        }}
                                      />
                                    </div>
                                    <div style={{ width: '100px' }}>
                                      <Form.Control 
                                        type="text" 
                                        placeholder="7:00 AM" 
                                        size="sm"
                                        value={stop.time}
                                        onChange={(e) => handleStopChange(e.target.value, trip.id, stop.id, 'time')}
                                        title="Hora de salida"
                                      />
                                    </div>
                                    <Button 
                                      variant="link" 
                                      className="text-danger p-1" 
                                      onClick={() => removeStop(trip.id, stop.id)}
                                    >
                                      &times;
                                    </Button>
                                  </div>
                                ))}
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm" 
                                  className="mt-1"
                                  onClick={() => addStop(trip.id)}
                                >
                                  + Agregar Parada
                                </Button>
                              </div>

                              <TripMap origin={trip.origin} destination={trip.destination} stops={trip.stops} />
                            </div>
                          ))}
                          <Button 
                            variant="outline-primary" 
                            onClick={addTrip}
                            className="mb-4 w-100"
                          >
                            + Agregar otro Trayecto (Salida/Llegada)
                          </Button>
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
