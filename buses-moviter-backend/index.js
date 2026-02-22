require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. RUTA DE SALUD (Debe estar arriba de todo)
app.get('/', (req, res) => {
  res.status(200).send('OK - Backend is alive');
});

// Ruta adicional para salud
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// 2. CONFIGURACIÓN DE CORS (Completa)
app.use(cors());
app.options('*', cors()); // Manejar pre-flight de forma global

app.use(express.json());

// 3. LOG DE SUPERVIVENCIA (Para ver si el proceso sigue vivo)
setInterval(() => {
  console.log(`💓 Latido del servidor - ${new Date().toLocaleTimeString()} - Puerto: ${PORT}`);
}, 10000);

// 4. ENDPOINT DE COTIZACIÓN
app.post('/api/quote', async (req, res) => {
  console.log('📩 Petición POST recibida en /api/quote');
  
  // Responder de inmediato para evitar que Railway sospeche de lentitud
  res.status(200).json({ message: 'Solicitud recibida correctamente' });

  // Procesar email en segundo plano
  setImmediate(async () => {
    try {
      const { name, email, phone, passengers, serviceType, company, details } = req.body;
      
      console.log('🔄 Iniciando envío de email vía Resend para:', name);

      if (!process.env.RESEND_API_KEY) {
        throw new Error('Variable de entorno RESEND_API_KEY no configurada');
      }

      const { data, error } = await resend.emails.send({
        from: 'Buses Moviter <onboarding@resend.dev>',
        to: 'busesmoviter@hotmail.com',
        subject: `Nueva Cotización: ${name}`,
        html: `<h3>Solicitud de Cotización</h3>
               <p><strong>Cliente:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Tel:</strong> ${phone}</p>
               <p><strong>Pasajeros:</strong> ${passengers}</p>
               <p><strong>Servicio:</strong> ${serviceType}</p>
               <p><strong>Empresa:</strong> ${company || 'N/A'}</p>
               <p><strong>Detalles:</strong> ${details || 'N/A'}</p>`
      });

      if (error) {
        throw error;
      }
      
      console.log('📧 Email enviado con éxito vía Resend:', data.id);
    } catch (e) {
      console.error('❌ Error en proceso de email (Resend):', e.message || e);
    }
  });
});

// 5. ARRANQUE DEL SERVIDOR
const server = app.listen(PORT, () => {
  const { address, port } = server.address();
  console.log(`🚀 SERVIDOR ESCUCHANDO EN: http://${address}:${port}`);
});

// Capturar errores no manejados
process.on('uncaughtException', (err) => {
  console.error('❌ Error Crítico:', err.message);
});
