import * as torneoRepo from '../repository/torneo.repository.js';

export const createTorneo = async (torneoData) => {
    return await torneoRepo.create(torneoData);
}

export const getTorneoById = async (id) => {
    const torneo = torneoRepo.findById(id);

    if (!torneo) {
        throw new Error('Torneo no encontrado');
    }

    return torneo;
}

export const getAllTorneos = async () => {
    return await torneoRepo.findAll();
}

export const deleteTorneo = async (id) => {
    const torneo = torneoRepo.findById(id);

    if (!torneo) {
        throw new Error('Torneo no encontrado');
    }
    return await torneoRepo.deleteById(id);
}

export const updateTorneo = async (id, updateData) => {
    const existingTorneo = await torneoRepo.findById(id);
    if (!existingTorneo) {
        throw new Error('Torneo no encontrado')
    }
    return await torneoRepo.updateById(id, updateData);
}