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

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'busesmoviter@hotmail.com',
        subject: `Nueva Cotización: ${name}`,
        html: `<h3>Solicitud de Cotización</h3>
               <p><strong>Cliente:</strong> ${name}</p>
               <p><strong>Tel:</strong> ${phone}</p>
               <p><strong>Pasajeros:</strong> ${passengers}</p>
               <p><strong>Empresa:</strong> ${company || 'N/A'}</p>
               <p><strong>Detalles:</strong> ${details || 'N/A'}</p>`
      });
      console.log('📧 Email enviado con éxito');
    } catch (e) {
      console.error('❌ Error en proceso de email:', e.message);
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
