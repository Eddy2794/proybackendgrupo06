import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as repo from './user.repository.js';

export const register = async ({ username, password, email }) => {
  const hashed = await bcrypt.hash(password, 10);
  return repo.create({ username, password: hashed, email });
};

export const getUser = (id) => repo.findById(id);

export const login = async ({ username, password }) => {
  const user = await repo.findByUsername(username);
  if (!user) throw new Error('Usuario no encontrado');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Contraseña incorrecta');

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: '1h' }
  );

  return { token };
};