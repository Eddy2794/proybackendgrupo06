import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  dbUri: process.env.DB_URI,
  jwtSecret: process.env.JWT_SECRET,
};