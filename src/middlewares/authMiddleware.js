import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { isTokenBlacklisted } from '../modules/auth/service/auth.service.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'Token de autorización requerido',
      error: 'UNAUTHORIZED' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret || 'secret123');
    
    // Verificar si el token está en la lista negra
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ 
        message: 'Token inválido',
        error: 'TOKEN_BLACKLISTED' 
      });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado',
        error: 'TOKEN_EXPIRED' 
      });
    }
    
    return res.status(401).json({ 
      message: 'Token inválido',
      error: 'INVALID_TOKEN' 
    });
  }
};