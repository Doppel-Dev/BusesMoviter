const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
const { Client } = require("@googlemaps/google-maps-services-js");

// Solo cargar dotenv si NO estamos en producción o si no hay puerto definido
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
// PRIORIDAD ABSOLUTA AL PUERTO DE RAILWAY
const PORT = process.env.PORT || 8080;

// MANEJO DE ERRORES GLOBALES (Para que no muera en silencio)
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Error No Manejado (Rejection):', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Error Crítico (Exception):', error);
  process.exit(1);
});

// 1. RUTA DE SALUD INMEDIATA
app.get('/', (req, res) => {
  res.status(200).send('✅ Servidor Buses Moviter Activo');
});

// 2. Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// 3. Configuración de Email
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

// 4. Endpoint de Cotización
app.post('/api/quote', async (req, res) => {
  const { name, email, phone, serviceType, passengers, date, tripType, trips, details, company } = req.body;
  if (!name || !email || !phone) return res.status(400).json({ error: 'Faltan campos' });

  // Responder de inmediato para evitar timeouts en Railway
  res.status(200).json({ message: 'Solicitud en proceso' });

  // Lógica asíncrona en segundo plano
  (async () => {
    try {
      let totalDistanceKm = 0;
      let tripsHtml = '';
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      if (Array.isArray(trips)) {
        for (const trip of trips) {
          if (trip.origin?.value?.place_id && trip.destination?.value?.place_id) {
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:${trip.origin.value.place_id}&destinations=place_id:${trip.destination.value.place_id}&key=${apiKey}`;
            const res = await axios.get(url);
            if (res.data.status === 'OK') {
              const meters = res.data.rows[0].elements[0].distance.value;
              totalDistanceKm += (meters / 1000);
              if (tripType === 'roundTrip') totalDistanceKm += (meters / 1000);
            }
          }
        }
      }

      const budget = totalDistanceKm > 0 ? `$${(totalDistanceKm * 2500).toLocaleString('es-CL')} CLP` : 'A convenir';

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'busesmoviter@hotmail.com',
        subject: `Nueva Cotización: ${name}`,
        html: `<h3>Solicitud de Cotización</h3><p><strong>Cliente:</strong> ${name}</p><p><strong>Tel:</strong> ${phone}</p><p><strong>Pasajeros:</strong> ${passengers}</p><p><strong>Distancia:</strong> ${totalDistanceKm.toFixed(1)} km</p><p><strong>Presupuesto:</strong> ${budget}</p>`
      });
      console.log('📧 Email enviado exitosamente');
    } catch (e) {
      console.error('❌ Error procesando cotización:', e.message);
    }
  })();
});

// 5. ARRANQUE
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SERVIDOR INICIADO`);
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌐 Modo: ${process.env.NODE_ENV || 'development'}`);
});
