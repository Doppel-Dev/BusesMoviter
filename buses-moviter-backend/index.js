const express = require('express');
const cors = require('cors');
const app = express();

// 1. PRIORIDAD TOTAL AL PUERTO DE RAILWAY
const PORT = process.env.PORT || 8080;

// 2. RESPUESTA UNIVERSAL (Para que cualquier Health Check de Railway pase)
app.use((req, res, next) => {
  if (req.url === '/') {
    return res.status(200).send('OK_BUSES_MOVITER');
  }
  next();
});

app.use(cors({ origin: '*' }));
app.use(express.json());

// 3. RUTAS BÁSICAS
app.get('/api/status', (req, res) => res.status(200).json({ status: 'active' }));

app.post('/api/quote', (req, res) => {
  console.log('📩 Cotización recibida:', req.body.name);
  res.status(200).json({ message: 'Recibido' });
});

// 4. ARRANQUE SIN BLOQUEOS
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SERVIDOR EN LÍNEA`);
  console.log(`📍 PUERTO: ${PORT}`);
});

// Mantener el proceso vivo y loguear si algo intenta cerrarlo
process.on('SIGTERM', () => {
  console.log('⚠️ Recibida señal SIGTERM, cerrando servidor...');
  server.close(() => {
    process.exit(0);
  });
});
