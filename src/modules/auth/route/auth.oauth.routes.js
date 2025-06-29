import { Router } from 'express';
import passport from '../../../config/passport.js';
import jwt from 'jsonwebtoken';
import config from '../../../config/index.js';
import * as userRepo from '../../user/repository/user.repository.js';

const router = Router();

// Función auxiliar para registrar historial de autenticación
const logAuthHistory = async (user, req, method = 'google-oauth', successful = true) => {
  try {
    // Agregar entrada al historial de autenticación si el usuario tiene esta propiedad
    if (user.historialAuth && Array.isArray(user.historialAuth)) {
      // Obtener IP real del request
      const ip = req.ip || 
                 req.connection?.remoteAddress || 
                 req.socket?.remoteAddress ||
                 req.headers['x-forwarded-for']?.split(',')[0] ||
                 '0.0.0.0';
      
      // Obtener User-Agent del request
      const userAgent = req.headers['user-agent'] || 'Google OAuth';
      
      const authEntry = {
        fechaLogin: new Date(),
        exitoso: successful,
        metodo: method,
        userAgent: userAgent,
        ip: ip
      };
      
      user.historialAuth.push(authEntry);
      
      // Mantener solo los últimos 10 registros
      if (user.historialAuth.length > 10) {
        user.historialAuth = user.historialAuth.slice(-10);
      }
      
      await user.save();
      console.log(`📊 Historial de autenticación registrado: ${method} - IP: ${ip}`);
    }
  } catch (error) {
    console.error('Error registrando historial de autenticación:', error);
  }
};

// Iniciar autenticación con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback de Google
router.get('/google/callback', passport.authenticate('google', { session: false }), async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      console.error('❌ No se pudo autenticar al usuario con Google');
      return res.redirect(`${config.frontendUrl}/#/login?error=auth_failed`);
    }

    // Asegurar que el último acceso esté actualizado (doble verificación)
    if (user.ultimoLogin) {
      const timeDiff = new Date() - new Date(user.ultimoLogin);
      // Si la diferencia es mayor a 1 minuto, actualizar
      if (timeDiff > 60000) {
        user.ultimoLogin = new Date();
        await user.save();
      }
    }

    // Generar JWT con información adicional
    const tokenPayload = {
      userId: user._id,
      rol: user.rol,
      loginMethod: 'google-oauth',
      loginTime: new Date().toISOString()
    };
    
    const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: config.jwtExpires });
    
    // Log de autenticación exitosa
    console.log(`✅ Google OAuth exitoso para usuario: ${user.username} (${user._id}) - Último acceso: ${user.ultimoLogin}`);
    
    // Registrar historial de autenticación con información del request
    await logAuthHistory(user, req, 'google-oauth', true);
    
    // Redirigir al frontend Angular usando hash routing
    const base = config.frontendUrl.replace(/\/$/, '');
    // Redirige a la ruta de login con token en query
    res.redirect(`${base}/#/login?token=${token}&method=google`);
    
  } catch (error) {
    console.error('❌ Error en callback de Google OAuth:', error);
    res.redirect(`${config.frontendUrl}/#/login?error=server_error`);
  }
});

// Ruta para obtener estadísticas de último acceso (solo para desarrollo/debugging)
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userRepo.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const stats = {
      userId: user._id,
      username: user.username,
      ultimoLogin: user.ultimoLogin,
      fechaRegistro: user.createdAt,
      estadoActual: user.estado,
      rol: user.rol,
      historialAuth: user.historialAuth || [],
      totalLogins: user.historialAuth ? user.historialAuth.filter(h => h.exitoso).length : 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas de usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
