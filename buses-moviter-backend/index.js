const express = require('express');
const cors = require('cors');
const app = express();

// 1. EL PUERTO DEBE SER EL QUE RAILWAY ASIGNE (OBLIGATORIO)
const PORT = process.env.PORT || 8080;

// 2. RESPUESTA INMEDIATA (Esto es lo que Railway necesita ver)
app.get('/', (req, res) => {
  console.log('✅ HEALTH CHECK RECIBIDO EXITOSAMENTE');
  res.status(200).send('Servidor Buses Moviter OK');
});

// 3. Middlewares mínimos
app.use(cors({ origin: '*' }));
app.use(express.json());

// 4. Ruta de prueba para confirmar que el servidor está vivo
app.get('/api/status', (req, res) => {
  res.json({ status: 'active', port: PORT });
});

// 5. ARRANQUE SIN RESTRICCIONES (Escuchar en todas las IPs)
app.listen(PORT, '0.0.0.0', () => {
  console.log('--- SERVIDOR INICIADO ---');
  console.log('📍 Puerto asignado por Railway:', PORT);
});

// Manejador de cierre elegante
process.on('SIGTERM', () => {
  console.log('⚠️ Railway envió señal de apagado (SIGTERM)');
  process.exit(0);
});
