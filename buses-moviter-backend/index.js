require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
// Railway inyecta la variable PORT. Si no existe, usamos 8080.
const PORT = process.env.PORT || 8080;

// 1. LOG DE CUALQUIER ACTIVIDAD (Para saber si alguien toca la puerta)
app.use((req, res, next) => {
  console.log(`📩 Petición entrante: ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// 2. RUTA DE SALUD (Debe responder al instante)
app.get('/', (req, res) => {
  res.status(200).send('OK_BUSES_MOVITER');
});

app.use(cors({ origin: '*' }));
app.use(express.json());

// 3. LOG DE VARIABLES (Para ver qué está pasando adentro)
console.log('--- DIAGNÓSTICO DE RAILWAY ---');
console.log('PORT Variable:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// 4. Lógica de Email (Sin cambios, pero aislada)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

app.post('/api/quote', async (req, res) => {
  // ... tu lógica de cotización ...
  res.status(200).json({ message: 'Procesando' });
});

// 5. ARRANQUE (FORZANDO 0.0.0.0 y PORT Dinámico)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SERVIDOR ESCUCHANDO EN EL PUERTO: ${PORT}`);
  console.log(`🌍 ACCESIBLE EN: 0.0.0.0:${PORT}`);
});
