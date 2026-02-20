require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
const { Client } = require("@googlemaps/google-maps-services-js");

const app = express();
const PORT = process.env.PORT || 8080;

// 1. RUTA DE SALUD (Prioridad absoluta para Railway)
app.get('/', (req, res) => {
  res.status(200).send('✅ Servidor Buses Moviter Activo');
});

// 2. Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// 3. Configuración de Email Forzando IPv4
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  tls: {
    rejectUnauthorized: false,
    servername: 'smtp.gmail.com'
  }
});

// 4. Endpoint de Cotización con Respuesta Inmediata
app.post('/api/quote', async (req, res) => {
  const { name, email, phone, serviceType, passengers, date, tripType, trips, details, company } = req.body;

  // Validación básica
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  // RESPUESTA INMEDIATA: Le decimos al frontend (y a Railway) que todo está en proceso
  // Esto evita que la conexión se quede colgada y Railway mate el proceso
  res.status(200).json({ message: 'Solicitud recibida, procesando envío de email...' });

  // Lógica en segundo plano (Background)
  (async () => {
    try {
      let totalDistanceKm = 0;
      let tripsHtml = '';
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      if (Array.isArray(trips) && trips.length > 0) {
        for (const [index, trip] of trips.entries()) {
          if (trip.origin && trip.destination) {
            try {
              const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:${trip.origin.value.place_id}&destinations=place_id:${trip.destination.value.place_id}&mode=driving&avoid=highways&key=${apiKey}`;
              const distRes = await axios.get(url);
              if (distRes.data.status === 'OK') {
                const meters = distRes.data.rows[0].elements[0].distance.value;
                totalDistanceKm += (meters / 1000);
                if (tripType === 'roundTrip') totalDistanceKm += (meters / 1000);
              }
            } catch (err) { console.error('Error calculando distancia:', err.message); }
          }
        }
      }

      const estimatedBudget = totalDistanceKm > 0 
        ? `$${(totalDistanceKm * 2500).toLocaleString('es-CL')} CLP`
        : 'No calculado';

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'busesmoviter@hotmail.com',
        subject: `Nueva Cotización: ${serviceType} - ${name}`,
        html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #004080;">Nueva Solicitud de Cotización</h2>
          <p><strong>Cliente:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email} | <strong>Tel:</strong> ${phone}</p>
          <p><strong>Pasajeros:</strong> ${passengers} | <strong>Fecha:</strong> ${date}</p>
          <p><strong>Distancia:</strong> ${totalDistanceKm.toFixed(2)} km</p>
          <p><strong>Presupuesto Sugerido:</strong> ${estimatedBudget}</p>
          <hr>
          <p><strong>Detalles:</strong> ${details || 'Sin detalles'}</p>
        </div>`
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Email enviado con éxito');
    } catch (error) {
      console.error('❌ Error en proceso de segundo plano:', error.message);
    }
  })();
});

// 5. ARRANQUE DEL SERVIDOR
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SERVIDOR ACTIVO EN PUERTO: ${PORT}`);
});
