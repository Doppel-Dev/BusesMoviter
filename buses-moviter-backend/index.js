const express = require('express');
const cors = require('cors');

const app = express();

// 1. DIAGNÓSTICO DE RED (Para ver qué ve Railway)
const PORT = process.env.PORT || 8080;
console.log('--- RAILWAY NETWORK DEBUG ---');
console.log('PORT ENV:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// 2. RESPUESTA DE SALUD INMEDIATA
app.get('/', (req, res) => {
  console.log('✅ Petición recibida en /');
  res.status(200).send('OK');
});

app.use(cors({ origin: '*' }));
app.use(express.json());

// 3. RUTAS BÁSICAS
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', port: PORT });
});

// 4. ARRANQUE (Sin 0.0.0.0 para dejar que el sistema decida)
app.listen(PORT, () => {
  console.log(`🚀 SERVIDOR ESCUCHANDO EN PUERTO: ${PORT}`);
});

// Manejo de apagado
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM recibido');
  process.exit(0);
});
