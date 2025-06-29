import { Router } from 'express';
import passport from '../../../config/passport.js';
import jwt from 'jsonwebtoken';
import config from '../../../config/index.js';

const router = Router();

// Iniciar autenticación con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback de Google
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const user = req.user;
  // Generar JWT
  const token = jwt.sign({ userId: user._id, rol: user.rol }, config.jwtSecret, { expiresIn: config.jwtExpires });
  // Redirigir al frontend Angular usando hash routing
  const base = config.frontendUrl.replace(/\/$/, '');
  // Redirige a la ruta de login con token en query
  res.redirect(`${base}/#/login?token=${token}`);
});

export default router;
