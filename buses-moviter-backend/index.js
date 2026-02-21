const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
// Railway asigna el puerto. NO lo fuerces en variables.
const PORT = process.env.PORT || 8080;

// 1. CONFIGURACIÓN DE CORS (DEBE SER LO PRIMERO)
// Esto permite que busesmoviter.com hable con Railway
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. MIDDLEWARES BÁSICOS
app.use(express.json());

// 3. RUTA DE SALUD (Para que Railway vea el círculo VERDE ✅)
app.get('/', (req, res) => {
  console.log('✅ Railway Health Check recibido');
  res.status(200).send('Servidor Buses Moviter Online');
});

// 4. CONFIGURACIÓN DE EMAIL (Usando variables de Railway)
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

// 5. ENDPOINT DE COTIZACIÓN
app.post('/api/quote', async (req, res) => {
  console.log('📩 Solicitud de cotización recibida de:', req.body.name);
  
  // Responder de inmediato para evitar que Railway mate el proceso por lentitud
  res.status(200).json({ message: 'Solicitud en proceso' });

  // Procesar en segundo plano
  (async () => {
    try {
      const { name, email, phone, passengers, serviceType, trips, tripType, company, details } = req.body;
      let totalDistanceKm = 0;
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      // Cálculo de distancia (opcional si falla Google Maps)
      if (Array.isArray(trips) && apiKey) {
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
        html: `
          <div style="font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #004080;">Nueva Cotización</h2>
            <p><strong>Cliente:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email} | <strong>Tel:</strong> ${phone}</p>
            <p><strong>Empresa:</strong> ${company || 'No indicada'}</p>
            <p><strong>Servicio:</strong> ${serviceType} | <strong>Pasajeros:</strong> ${passengers}</p>
            <p><strong>Distancia:</strong> ${totalDistanceKm.toFixed(1)} km</p>
            <p><strong>Presupuesto Sugerido:</strong> ${budget}</p>
            <hr>
            <p><strong>Detalles:</strong> ${details || 'Sin detalles'}</p>
          </div>
        `
      });
      console.log('📧 Email enviado exitosamente');
    } catch (e) {
      console.error('❌ Error en el proceso de fondo:', e.message);
    }
  })();
});

// 6. ARRANQUE DEL SERVIDOR
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SERVIDOR ACTIVO EN PUERTO: ${PORT}`);
});
