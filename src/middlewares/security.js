import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import xssSanitizer from 'express-xss-sanitizer';
import { doubleCsrf } from 'csrf-csrf';

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

const {
  generateToken,
  doubleCsrfProtection,
  invalidCsrfTokenError,
} = doubleCsrf({
  getSecret: (req) => req.cookies["XSRF-TOKEN"],
  cookieName: "XSRF-TOKEN",
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getTokenFromRequest: (req) => req.headers["x-xsrf-token"]
});

export const applySecurity = (app, useCsrf = false) => {
  app.use(helmet());
  app.use(xssSanitizer());
  app.use(mongoSanitize());
  app.use(rateLimiter);

  if (useCsrf) {
    app.use(generateToken);
    app.use(doubleCsrfProtection);
  }
};

export const csrfErrorHandler = (err, req, res, next) => {
  if (err === invalidCsrfTokenError) {
    return res.status(403).json({ message: "Token CSRF inválido o ausente." });
  }
  next(err);
};