const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Configuración de Nodemailer para Gmail (simplificada)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verificar conexión al inicio
transporter.verify(function (error, success) {
  if (error) {
    console.log("--- ERROR DE CONFIGURACIÓN DE EMAIL ---");
    console.error(error);
  } else {
    console.log("✅ Servidor de email listo para enviar mensajes");
  }
});

// Endpoint para recibir cotizaciones
app.post('/api/quote', async (req, res) => {
  const { name, email, phone, company, serviceType, passengers, date, details } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (Nombre, Email, Teléfono)' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'busesmoviter@hotmail.com', // Destinatario final
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
        <p><strong>Detalles:</strong></p>
        <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${details || 'Sin detalles adicionales'}</p>
      </div>
    `
  };

  try {
    // Solo intentaremos enviar si las credenciales están configuradas
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('--- MODO DESARROLLO: Datos recibidos (sin configurar email) ---');
      console.log(req.body);
    }
    
    res.status(200).json({ message: 'Cotización recibida y enviada con éxito' });
  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud. Por favor intente más tarde.' });
  }
});

app.get('/', (req, res) => {
  res.send('Buses Moviter API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
