import React from 'react';
import { Container, Carousel } from 'react-bootstrap';
import { motion } from 'framer-motion';
import './Gallery.css';

// Import images
import g1 from '../assets/gallery-1.jpg';
import g2 from '../assets/gallery-2.jpg';
import g3 from '../assets/gallery-3.jpg';
import g4 from '../assets/gallery-4.jpg';
import g5 from '../assets/gallery-5.jpg';
import g6 from '../assets/gallery-6.jpg';
import g7 from '../assets/gallery-7.jpg';
import g8 from '../assets/gallery-8.jpg';
import g9 from '../assets/gallery-9.jpg';
import g10 from '../assets/gallery-10.jpg';
import g11 from '../assets/gallery-11.jpg';
import g12 from '../assets/gallery-12.jpg';

const images = [
  { src: g1, title: 'Flota de buses modernos', desc: 'Equipamiento de última generación para su comodidad.' },
  { src: g2, title: 'Traslado Industrial', desc: 'Soluciones eficientes para el movimiento diario de trabajadores.' },
  { src: g3, title: 'Servicios de Empresa', desc: 'Compromiso con la continuidad operativa de su negocio.' },
  { src: g4, title: 'Servicios Especiales', desc: 'Máximo confort y flexibilidad en cada trayecto.' },
  { src: g5, title: 'Seguridad garantizada', desc: 'Estrictos protocolos de mantenimiento y seguridad.' },
  { src: g6, title: 'Servicios Corporativos', desc: 'Soluciones a medida para el traslado de ejecutivos y personal.' },
  { src: g7, title: 'Confort y tecnología', desc: 'Interiores diseñados para una experiencia de viaje superior.' },
  { src: g8, title: 'Logística de precisión', desc: 'Puntualidad y coordinación en cada servicio.' },
  { src: g11, title: 'Conductores calificados', desc: 'Personal con amplia trayectoria y capacitación.' },
  { src: g12, title: 'Disponibilidad nacional', desc: 'Cobertura integral a lo largo de todo Chile.' },
];

const Gallery = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
    }
  };

  return (
    <section id="galeria" className="gallery-corporate-section">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-5"
        >
          <h2 className="section-title">Nuestra Flota</h2>
          <p className="gallery-subtitle">Tecnología y confort a su disposición en cada kilómetro.</p>
        </motion.div>

        <motion.div 
          className="gallery-grid-modern"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {images.map((img, i) => (
            <motion.div 
              key={i} 
              className={`gallery-item-modern ${i % 5 === 0 ? 'wide' : i % 7 === 0 ? 'tall' : ''}`}
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="gallery-img-wrapper">
                <img src={img.src} alt={img.title} className="gallery-img-modern-content" />
                <div className="gallery-overlay-modern">
                  <div className="overlay-content-modern">
                    <span className="overlay-category">FLOTA</span>
                    <h4 className="overlay-title">{img.title}</h4>
                    <p className="overlay-desc">{img.desc}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};

export default Gallery;
