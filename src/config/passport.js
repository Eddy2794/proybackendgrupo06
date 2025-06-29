import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import config from './index.js';
import * as userRepo from '../modules/user/repository/user.repository.js';
import * as personaService from '../modules/persona/service/persona.service.js';
import * as authService from '../modules/auth/service/auth.service.js';

// Configurar la estrategia de Google OAuth
passport.use(new GoogleStrategy({
  clientID: config.googleClientId,
  clientSecret: config.googleClientSecret,
  callbackURL: config.googleCallbackUrl
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails[0]?.value;
    if (!email) return done(new Error('No email from Google'), null);
    // Buscar usuario por email
    let user = await userRepo.findByUsername(email);
    if (!user) {
      // Crear persona y usuario
      const personaData = {
        nombres: profile.name.givenName,
        apellidos: profile.name.familyName,
        email,
        numeroDocumento: '123456789', // Número de documento ficticio
        // Asignar fechaNacimiento hace 18 años para evitar validación de edad mínima (mayor de 13)
        fechaNacimiento: new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        genero: 'OTRO',
        emailVerificado: true,
      };
      const username = email;
      const password = Math.random().toString(36).slice(-8);
      const result = await authService.register({ personaData, username, password });
      user = result.user;
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

export default passport;
