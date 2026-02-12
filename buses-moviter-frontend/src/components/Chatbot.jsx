import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaPaperPlane, FaComments } from 'react-icons/fa';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: '¡Hola! Soy MoviBot, el asistente virtual de Buses Moviter. ¿Le gustaría solicitar una cotización ahora mismo?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState('INIT');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    passengers: '',
    details: ''
  });

  const messagesEndRef = useRef(null);

  const resetChat = () => {
    setMessages([{ type: 'bot', text: '¡Hola! Soy MoviBot, el asistente virtual de Buses Moviter. ¿Le gustaría solicitar una cotización ahora mismo?' }]);
    setStep('INIT');
    setFormData({ name: '', email: '', phone: '', serviceType: '', passengers: '', details: '' });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const steps = {
    INIT: {
      question: '¿Desea iniciar una cotización?',
      options: ['Sí, por favor', 'No por ahora'],
      next: (val) => val.includes('Sí') ? 'ASK_NAME' : 'END'
    },
    ASK_NAME: {
      question: 'Perfecto. ¿Cuál es su nombre completo?',
      field: 'name',
      next: 'ASK_PHONE'
    },
    ASK_PHONE: {
      question: 'Gracias, {name}. ¿A qué número podemos contactarle?',
      field: 'phone',
      next: 'ASK_EMAIL'
    },
    ASK_EMAIL: {
      question: '¿Cuál es su correo electrónico?',
      field: 'email',
      next: 'ASK_SERVICE'
    },
    ASK_SERVICE: {
      question: '¿Qué tipo de servicio necesita?',
      options: ['Transporte de Personal', 'Viaje Especial', 'Sector Industrial', 'Otro'],
      field: 'serviceType',
      next: 'ASK_PASSENGERS'
    },
    ASK_PASSENGERS: {
      question: '¿Para cuántos pasajeros aproximadamente?',
      field: 'passengers',
      next: 'ASK_DETAILS'
    },
    ASK_DETAILS: {
      question: 'Finalmente, cuéntenos brevemente sobre la ruta o algún detalle especial.',
      field: 'details',
      next: 'FINISH'
    }
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const newMessages = [...messages, { type: 'user', text }];
    setMessages(newMessages);
    setInputValue('');

    const currentStepConfig = steps[step];
    
    // Validation Logic
    if (step === 'ASK_NAME') {
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!nameRegex.test(text) || text.length < 3) {
        setTimeout(() => {
          setMessages(prev => [...prev, { type: 'bot', text: 'Por favor, ingrese un nombre válido (solo letras).' }]);
        }, 500);
        return;
      }
    }

    if (step === 'ASK_PHONE') {
      const phoneRegex = /^[0-9\s\+\-\(\)]+$/;
      if (!phoneRegex.test(text) || text.length < 8) {
        setTimeout(() => {
          setMessages(prev => [...prev, { type: 'bot', text: 'Por favor, ingrese un número de teléfono válido.' }]);
        }, 500);
        return;
      }
    }

    if (step === 'ASK_EMAIL') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(text)) {
        setTimeout(() => {
          setMessages(prev => [...prev, { type: 'bot', text: 'Por favor, ingrese un correo electrónico válido (ej: nombre@correo.com).' }]);
        }, 500);
        return;
      }
    }

    if (step === 'INIT') {
      const lowerText = text.toLowerCase();
      const positiveKeywords = ['sí', 'si', 'cotizar', 'quiero', 'viaje', 'necesito', 'presupuesto', 'valor'];
      const isPositive = positiveKeywords.some(keyword => lowerText.includes(keyword));

      if (isPositive) {
        setStep('ASK_NAME');
        setMessages([...newMessages, { type: 'bot', text: steps.ASK_NAME.question }]);
      } else {
        setMessages([...newMessages, { type: 'bot', text: 'Entendido. Si necesita algo más, aquí estaré. ¡Tenga un buen día!' }]);
        setStep('END');
      }
      return;
    }

    // Process field update
    const updatedFormData = { ...formData, [currentStepConfig.field]: text };
    setFormData(updatedFormData);

    const nextStep = currentStepConfig.next;

    if (nextStep === 'FINISH') {
      setMessages([...newMessages, { type: 'bot', text: 'Procesando su solicitud...' }]);
      
      try {
        const response = await fetch('http://localhost:5000/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...updatedFormData,
            company: 'Chatbot Request',
            date: new Date().toLocaleDateString()
          }),
        });

        if (response.ok) {
          setMessages(prev => [...prev, { type: 'bot', text: `¡Listo ${updatedFormData.name}! Hemos recibido su solicitud. Un ejecutivo le contactará pronto. ¡Muchas gracias!` }]);
        } else {
          setMessages(prev => [...prev, { type: 'bot', text: 'Hubo un problema al enviar los datos, pero no se preocupe, puede llamarnos directamente al +56 9 8179 6847.' }]);
        }
      } catch (error) {
        setMessages(prev => [...prev, { type: 'bot', text: 'Parece que tengo problemas de conexión. Por favor, intente más tarde o contáctenos por WhatsApp.' }]);
      }
      setStep('END');
    } else {
      setStep(nextStep);
      let nextQuestion = steps[nextStep].question;
      // Replace placeholders
      nextQuestion = nextQuestion.replace('{name}', updatedFormData.name);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: nextQuestion, 
          options: steps[nextStep].options 
        }]);
      }, 500);
    }
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaComments />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chatbot-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
          >
            <div className="chatbot-header">
              <h3>MoviBot Asistente</h3>
              <button className="close-btn" onClick={() => setIsOpen(false)}><FaTimes /></button>
            </div>

            <div className="chatbot-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.type}`}>
                  {msg.text}
                  {msg.options && (
                    <div className="chatbot-options">
                      {msg.options.map(opt => (
                        <button key={opt} className="option-btn" onClick={() => handleSend(opt)}>{opt}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {step === 'END' && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-center mt-3"
                >
                  <button className="restart-btn" onClick={resetChat}>Nueva Consulta</button>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {step !== 'END' && (
              <div className="chatbot-input-area">
                <input 
                  type="text" 
                  placeholder="Escriba aquí..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)}
                />
                <button className="send-btn" onClick={() => handleSend(inputValue)}>
                  <FaPaperPlane />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
