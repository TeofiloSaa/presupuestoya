const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ── Configuración de Passport Google ─────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

      if (!user && email) {
        // Si ya existe una cuenta con ese email, la vincula
        user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId: profile.id },
          });
        } else {
          user = await prisma.user.create({
            data: {
              email,
              googleId: profile.id,
              name: profile.displayName,
            },
          });
        }
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
));

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
};

function signAndSetCookie(res, user) {
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.cookie('token', token, COOKIE_OPTS);
  return token;
}

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name: name?.trim() || null },
    });

    signAndSetCookie(res, user);
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    signAndSetCookie(res, user);
    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────
router.post('/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ ok: true });
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'No autenticado' });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ id: user.id, email: user.email, name: user.name });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// ── GET /api/auth/google ──────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);

// ── GET /api/auth/google/callback ─────────────────────────────
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: process.env.NODE_ENV === 'production'
      ? '/login?error=google'
      : 'http://localhost:5173/login?error=google',
  }),
  (req, res) => {
    signAndSetCookie(res, req.user);
    const home = process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:5173/';
    res.redirect(home);
  }
);

module.exports = router;
