import { Router } from 'express';
import { registerUser, getUserProfile, loginUser } from './user.controller.js';
import { body } from 'express-validator';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = Router();

router.post(
  '/',
  [
    body('username').notEmpty(),
    body('password').isLength({ min: 6 }),
    body('email').isEmail()
  ],
  registerUser
);

router.post(
  '/login',
  [
    body('username').notEmpty(),
    body('password').notEmpty()
  ],
  loginUser
);

router.get('/:id', authMiddleware, getUserProfile);

export default router;