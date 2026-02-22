require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = Number(process.env.PORT) || 8080;

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
      
      console.log('🔄 Iniciando envío de email para:', name);

      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Variables de entorno EMAIL_USER o EMAIL_PASS no configuradas');
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { 
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS 
        }
      });

      console.log('📤 Intentando conectar con Gmail...');
      
      const info = await transporter.sendMail({
        from: `Buses Moviter <${process.env.EMAIL_USER}>`,
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
      
      console.log('📧 Email enviado con éxito:', info.messageId);
    } catch (e) {
      console.error('❌ Error en proceso de email:', e);
      if (e.code === 'ECONNRESET') {
        console.error('💡 Nota: ECONNRESET puede deberse a problemas de red o bloqueos de Gmail.');
      }
      if (e.code === 'ETIMEDOUT') {
        console.error('💡 Nota: ETIMEDOUT indica que no se pudo conectar al servidor de Gmail. Verifica el puerto (465/587) y la red de Railway.');
      }
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
