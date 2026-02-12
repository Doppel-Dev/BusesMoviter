import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import videoBg from '../assets/video-bg.mp4';
import './Hero.css';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const titleVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <section id="home" className="hero-corporate">
      <div className="hero-video-wrapper">
        <video autoPlay loop muted playsInline className="hero-video-bg">
          <source src={videoBg} type="video/mp4" />
        </video>
        <div className="hero-overlay-gradient"></div>
        <div className="hero-noise"></div>
      </div>

      <Container className="h-100 position-relative">
        <motion.div 
          className="hero-content-box"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="overflow-hidden">
            <motion.h2 className="hero-tagline" variants={itemVariants}>
              LÍDERES EN TRANSPORTE PRIVADO
            </motion.h2>
          </div>
          
          <div className="overflow-hidden">
            <motion.h1 className="hero-main-title" variants={titleVariants}>
              35 Años moviendo <br />
              <span className="text-highlight">grandes proyectos</span>
            </motion.h1>
          </div>
          
          <motion.p className="hero-para" variants={itemVariants}>
            Soluciones integrales de transporte para industrias, obras civiles y viajes corporativos con el estándar más alto de seguridad y puntualidad.
          </motion.p>
          
          <motion.div className="hero-actions" variants={itemVariants}>
            <Button href="#servicios" className="btn-corporate-primary">
              Nuestros Servicios
            </Button>
            <Link to="/cotizar" className="btn-corporate-outline text-decoration-none">
              Solicitar Cotización
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default Hero;
