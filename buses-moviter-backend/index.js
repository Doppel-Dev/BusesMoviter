require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
const { Client } = require("@googlemaps/google-maps-services-js");

const app = express();
const googleMapsClient = new Client({});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173', // Para desarrollo local
    'https://busesmoviter.com',   // Tu dominio de Hostinger (Sin la barra / al final)
    'https://www.busesmoviter.com'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Configuración de Nodemailer para Gmail (Forzando IPv4 para Railway)
const transporter = nodemailer.createTransport({
  host: '74.125.142.108', // IP fija de smtp.gmail.com para forzar IPv4
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false,
    servername: 'smtp.gmail.com' // Necesario al usar la IP directa
  }
});

// Verificar conexión al inicio (envuelto en setImmediate para no bloquear el inicio del servidor)
setImmediate(() => {
  transporter.verify(function (error, success) {
    if (error) {
      console.log("--- ERROR DE CONFIGURACIÓN DE EMAIL ---");
      console.error(error);
    } else {
      console.log("✅ Servidor de email listo para enviar mensajes");
    }
  });
});

// Endpoint para recibir cotizaciones
app.post('/api/quote', async (req, res) => {
  const { name, email, phone, company, serviceType, passengers, date, tripType, trips, details } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (Nombre, Email, Teléfono)' });
  }

  let totalDistanceValue = 0; // en metros
  let tripsHtml = '';
  
  let validTrips = [];
  if (Array.isArray(trips)) {
    validTrips = trips.filter(t => t && t.origin && t.destination);
  }

  if (validTrips.length > 0) {
    for (const [index, trip] of validTrips.entries()) {
      const originLabel = trip.origin.label || 'Origen desconocido';
      const destinationLabel = trip.destination.label || 'Destino desconocido';
      let legDistanceText = 'No calculada';
      let stopsHtml = '';

      if (trip.stops && trip.stops.length > 0) {
        stopsHtml = '<div style="margin-left: 20px; font-size: 0.9em; color: #555;"><strong>Paradas:</strong><ul style="margin: 5px 0;">';
        trip.stops.forEach(stop => {
          if (stop.location) {
            stopsHtml += `<li>${stop.location.label} ${stop.time ? `(${stop.time})` : ''}</li>`;
          }
        });
        stopsHtml += '</ul></div>';
      }
      
      if (trip.origin.value && trip.destination.value) {
        try {
          const apiKey = process.env.GOOGLE_MAPS_API_KEY || "AIzaSyAcwokKJ7ngkj36HrmbeGplRlTf5SSzop8";
          const originId = trip.origin.value.place_id;
          const destinationId = trip.destination.value.place_id;
          
          const getDistance = async (start, end, intermediateStops) => {
            let url;
            if (intermediateStops && intermediateStops.length > 0) {
              const waypoints = intermediateStops
                .filter(s => s.location && s.location.value)
                .map(s => `place_id:${s.location.value.place_id}`)
                .join('|');
              url = `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${start}&destination=place_id:${end}&waypoints=${waypoints}&mode=driving&avoid=highways&key=${apiKey}`;
            } else {
              url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:${start}&destinations=place_id:${end}&mode=driving&avoid=highways&key=${apiKey}`;
            }
            
            const res = await axios.get(url);
            if (res.data.status === 'OK') {
              if (intermediateStops && intermediateStops.length > 0) {
                return res.data.routes[0].legs.reduce((acc, leg) => acc + leg.distance.value, 0);
              } else {
                return res.data.rows[0].elements[0].status === 'OK' ? res.data.rows[0].elements[0].distance.value : 0;
              }
            }
            return 0;
          };

          // Distancia de IDA
          const idaDistance = await getDistance(originId, destinationId, trip.stops);
          totalDistanceValue += idaDistance;

          // Distancia de VUELTA (si aplica, calculada de forma real)
          if (tripType === 'roundTrip') {
            const reversedStops = [...(trip.stops || [])].reverse();
            const vueltaDistance = await getDistance(destinationId, originId, reversedStops);
            totalDistanceValue += vueltaDistance;
          }
          
          legDistanceText = `${(idaDistance / 1000).toFixed(1)} km ida (evitando autopistas)${tripType === 'roundTrip' ? ' + retorno' : ''}`;
        } catch (error) {
          legDistanceText = `Error de Conexión: ${error.message}`;
        }
      } else {
        legDistanceText = 'Error: Datos de dirección incompletos';
      }

      tripsHtml += `
        <div style="margin-bottom: 15px; padding: 10px; background: #f0f4f8; border-radius: 5px; border-left: 4px solid #004080;">
          <p style="margin: 0;"><strong>Trayecto ${index + 1}:</strong></p>
          <p style="margin: 5px 0;">De: ${originLabel}</p>
          ${stopsHtml}
          <p style="margin: 5px 0;">A: ${destinationLabel}</p>
          <p style="margin: 5px 0 0 0; color: #004080; font-weight: bold;">Distancia: ${legDistanceText}</p>
        </div>
      `;
    }
  }

  // SIN MARGEN OPERATIVO, SOLO DISTANCIA REAL
  const finalDistanceValue = totalDistanceValue;
  const totalDistanceKm = finalDistanceValue / 1000;
  
  const estimatedBudget = totalDistanceKm > 0 
    ? `$${(totalDistanceKm * 2500).toLocaleString('es-CL')} CLP`
    : 'No calculado';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'busesmoviter@hotmail.com',
    subject: `Nueva Cotización: ${serviceType} - ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #004080; border-bottom: 2px solid #004080; padding-bottom: 10px;">Solicitud de Cotización</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Empresa:</strong> ${company || 'No especificada'}</p>
        <hr>
        <p><strong>Tipo de Servicio:</strong> ${serviceType}</p>
        <p><strong>Pasajeros:</strong> ${passengers}</p>
        <p><strong>Fecha Estimada:</strong> ${date}</p>
        <p><strong>Tipo de Viaje:</strong> ${tripType === 'roundTrip' ? 'Ida y Vuelta (Ruta real)' : 'Solo Ida'}</p>
        
        <h3 style="color: #004080;">Detalle de Trayectos:</h3>
        ${tripsHtml || '<p style="color: #666;">No se especificaron trayectos detallados.</p>'}
        
        <div style="margin-top: 20px; padding: 15px; background: #fff3f3; border: 1px solid #ffcdd2; border-radius: 5px;">
          <p style="margin: 0;"><strong>Distancia Total:</strong> ${totalDistanceKm.toFixed(2)} km</p>
          <p style="margin: 5px 0 0 0; font-size: 1.2em; color: #d9534f; font-weight: bold;">
            Presupuesto Sugerido (Interno): ${estimatedBudget}
          </p>
          <p style="margin-top: 5px; font-size: 0.8em; color: #666;">* Cálculo basado en rutas que evitan autopistas y sin márgenes adicionales.</p>
        </div>
        <hr>
        <p><strong>Detalles Adicionales:</strong></p>
        <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${details || 'Sin detalles adicionales'}</p>
      </div>
    `
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    }
    res.status(200).json({ message: 'Cotización recibida y enviada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
});

app.get('/', (req, res) => {
  res.send('Buses Moviter API is running...');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
