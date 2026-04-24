const express = require('express');
const cors = require('cors');
const path = require('path');
const pdfRoutes = require('./routes/pdf');

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// En dev se usa el proxy de Vite; en prod el frontend vive en el mismo origen
if (!isProd) {
  app.use(cors({ origin: /^http:\/\/localhost(:\d+)?$/ }));
}

app.use(express.json({ limit: '5mb' })); // espacio para el logo en base64

app.use('/api', pdfRoutes);

// En producción: servir el build de React
if (isProd) {
  const distPath = path.resolve(__dirname, '..', 'client', 'dist');
  app.use(express.static(distPath));
  app.get('/{*path}', (_req, res) =>
    res.sendFile('index.html', { root: distPath })
  );
}

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT} [${isProd ? 'producción' : 'desarrollo'}]`);
});
