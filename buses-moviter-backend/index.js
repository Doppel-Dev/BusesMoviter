require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

// 1. RUTA DE SALUD (Mantenemos la victoria)
app.get('/', (req, res) => {
  res.status(200).send('Servidor Buses Moviter OK');
});

// 2. Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

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

  // Responder rápido para que Railway esté feliz
  res.status(200).json({ message: 'Solicitud recibida' });

  // Procesar en segundo plano
  (async () => {
    try {
      let totalDistanceKm = 0;
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      if (Array.isArray(trips)) {
        for (const trip of trips) {
          if (trip.origin?.value?.place_id && trip.destination?.value?.place_id) {
            try {
              const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:${trip.origin.value.place_id}&destinations=place_id:${trip.destination.value.place_id}&key=${apiKey}`;
              const distRes = await axios.get(url);
              if (distRes.data.status === 'OK') {
                const meters = distRes.data.rows[0].elements[0].distance.value;
                totalDistanceKm += (meters / 1000);
                if (tripType === 'roundTrip') totalDistanceKm += (meters / 1000);
              }
            } catch (err) { console.error('Error Maps:', err.message); }
          }
        }
      }

      const budget = totalDistanceKm > 0 ? `$${(totalDistanceKm * 2500).toLocaleString('es-CL')} CLP` : 'A convenir';

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'busesmoviter@hotmail.com',
        subject: `Nueva Cotización: ${name}`,
        html: `<h3>Solicitud de Cotización</h3><p><strong>Cliente:</strong> ${name}</p><p><strong>Tel:</strong> ${phone}</p><p><strong>Empresa:</strong> ${company || 'No indicada'}</p><p><strong>Pasajeros:</strong> ${passengers}</p><p><strong>Distancia:</strong> ${totalDistanceKm.toFixed(1)} km</p><p><strong>Presupuesto:</strong> ${budget}</p><hr><p><strong>Detalles:</strong> ${details || 'Sin detalles'}</p>`
      });
      console.log('📧 Email enviado con éxito');
    } catch (e) {
      console.error('❌ Error en proceso:', e.message);
    }
  })();
});

// 5. ARRANQUE
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 SERVIDOR ESTABLE EN LÍNEA EN PUERTO:', PORT);
});
