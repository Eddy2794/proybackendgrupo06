import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const authMiddleware = (req, res, next) => {
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