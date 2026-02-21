const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');

// 1. CONFIGURACIÓN INICIAL
const app = express();
const PORT = process.env.PORT || 8080;

// 2. RUTA DE SALUD (Prioridad #1 para que Railway no lo mate)
app.get('/', (req, res) => {
  console.log('✅ HEALTH CHECK EXITOSO');
  res.status(200).send('OK');
});

// 3. MIDDLEWARES
app.use(cors({ origin: '*' }));
app.use(express.json());

// 4. CONFIGURACIÓN DE EMAIL (Segura)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'busesmoviter.notificaciones@gmail.com',
    pass: 'dpzqehkmsrxvyvez'
  },
  tls: { rejectUnauthorized: false }
});

// 5. ENDPOINT DE COTIZACIÓN (Robusto)
app.post('/api/quote', async (req, res) => {
  console.log('📩 Recibida solicitud de:', req.body.name);
  
  // Responder de inmediato para que la conexión no se cuelgue
  res.status(200).json({ message: 'Recibido' });

  // Procesar envío en segundo plano
  try {
    const { name, phone, passengers, serviceType } = req.body;
    await transporter.sendMail({
      from: 'busesmoviter.notificaciones@gmail.com',
      to: 'busesmoviter@hotmail.com',
      subject: `Nueva Cotización: ${name}`,
      text: `Cliente: ${name}\nTeléfono: ${phone}\nPasajeros: ${passengers}\nServicio: ${serviceType}`
    });
    console.log('📧 Email enviado correctamente');
  } catch (err) {
    console.error('❌ Error enviando email:', err.message);
  }
});

// 6. ARRANQUE DEL SERVIDOR
app.listen(PORT, '0.0.0.0', () => {
  console.log('--- SERVIDOR BUSES MOVITER ACTIVO ---');
  console.log('📍 Puerto:', PORT);
});
