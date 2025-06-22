import * as service from '../service/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const { username, password, ...personaData } = req.body;
    const result = await service.register({ personaData, username, password });
    return res.success('Registro exitoso', {
      token: result.token,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await service.login(req.body);
    return res.success(result.message, {
      token: result.token,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { userId } = req.user;
    await service.changePassword(userId, req.body);
    return res.success('Contraseña actualizada correctamente');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await service.logout(token);
    }
    return res.success('Logout exitoso');
  } catch (error) {
    next(error);
  }
};
