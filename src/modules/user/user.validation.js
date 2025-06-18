import { body } from 'express-validator';

export const userSchema = {
  register: [
    body('username').isAlphanumeric().isLength({ min: 3 }),
    body('password').isLength({ min: 6 }),
    body('email').isEmail(),
  ],
};
