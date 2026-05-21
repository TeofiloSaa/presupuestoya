require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const path = require('path');

const pdfRoutes = require('./routes/pdf');
const authRoutes = require('./routes/auth');
const quotesRoutes = require('./routes/quotes');

const app = express();
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: /^http:\/\/localhost(:\d+)?$/,
    credentials: true,
  }));
}

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api', pdfRoutes);

const distPath = path.resolve(__dirname, '..', 'client', 'dist');
app.use(express.static(distPath));
app.get('/{*path}', (_req, res) =>
  res.sendFile('index.html', { root: distPath })
);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
