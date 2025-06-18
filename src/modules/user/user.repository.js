import User from './user.model.js';

export const create = (data) => new User(data).save();
export const findById = (id) => User.findById(id);
export const findByUsername = (username) => User.findOne({ username });