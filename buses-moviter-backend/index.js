const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

// 1. CORS TOTALMENTE ABIERTO Y PRIMERO
app.use(cors());
app.options('*', cors()); // Habilitar pre-flight para todas las rutas

app.use(express.json());

// 2. RUTA DE SALUD
app.get('/', (req, res) => {
  res.status(200).send('Servidor Buses Moviter Online');
});

// 3. RUTA DE PRUEBA API
app.get('/api/quote', (req, res) => {
  res.status(200).send('API Quote está lista para recibir POST');
});

// 4. ENDPOINT REAL DE COTIZACIÓN
app.post('/api/quote', async (req, res) => {
  console.log('📩 Petición POST recibida en /api/quote');
  
  // Responder de inmediato para evitar bloqueos
  res.status(200).json({ message: 'Solicitud recibida' });

  // Lógica de fondo
  (async () => {
    try {
      const { name, email, phone, passengers, serviceType, company, details } = req.body;
      
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { rejectUnauthorized: false }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'busesmoviter@hotmail.com',
        subject: `Nueva Cotización: ${name}`,
        html: `<h3>Nueva Cotización</h3><p><strong>Cliente:</strong> ${name}</p><p><strong>Tel:</strong> ${phone}</p><p><strong>Servicio:</strong> ${serviceType}</p><p><strong>Pasajeros:</strong> ${passengers}</p><p><strong>Empresa:</strong> ${company || 'N/A'}</p><p><strong>Detalles:</strong> ${details || 'N/A'}</p>`
      });
      console.log('📧 Email enviado con éxito');
    } catch (e) {
      console.error('❌ Error enviando email:', e.message);
    }
  })();
});

// 5. ARRANQUE
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});
