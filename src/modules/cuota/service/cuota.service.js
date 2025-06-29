import * as cuotaRepo from '../repository/cuota.repository.js';

// Crear una cuota (verifica que no exista una cuota igual para el mismo periodo y alumno-categoría)
export const crearCuota = async (data) => {
  const existente = await cuotaRepo.findOne({
    alumno_categoria_id: data.alumno_categoria_id,
    anio: data.anio,
    mes: data.mes
  });
  if (existente) throw new Error('Ya existe una cuota para este periodo y alumno');
  return await cuotaRepo.create(data);
};

// Obtener una cuota por su ID
export const obtenerCuotaPorId = async (id) => {
  const cuota = await cuotaRepo.findById(id);
  if (!cuota) throw new Error('Cuota no encontrada');
  return cuota;
};

// Obtener todas las cuotas de una relación alumno-categoría
export const obtenerCuotasPorAlumnoCategoria = async (alumnoCategoriaId) =>
  await cuotaRepo.findByAlumnoCategoria(alumnoCategoriaId);

// Actualizar una cuota por su ID
export const actualizarCuota = async (id, data) => {
  const cuota = await cuotaRepo.updateById(id, data);
  if (!cuota) throw new Error('Cuota no encontrada');
  return cuota;
};

// Eliminar una cuota de forma física
export const eliminarCuota = async (id) => {
  const cuota = await cuotaRepo.deleteById(id);
  if (!cuota) throw new Error('Cuota no encontrada');
  return cuota;
};

// Eliminar una cuota de forma lógica (soft delete)
export const deleteCuota = async (id, deletedBy = null) => {
  const cuota = await cuotaRepo.findById(id);
  if (!cuota) throw new Error('Cuota no encontrada');
  return await cuotaRepo.softDeleteById(id, deletedBy);
};

// Restaurar una cuota eliminada lógicamente
export const restoreCuota = async (id, restoredBy = null) => {
  const cuota = await cuotaRepo.findRawById(id);
  if (!cuota) throw new Error('Cuota no encontrada');
  return await cuotaRepo.restoreById(id, restoredBy);
};

// Obtener todas las cuotas por estado (PENDIENTE, PAGA, VENCIDA)
export const obtenerCuotasPorEstado = async (estado) => {
  return await cuotaRepo.findByEstado(estado);
};

// Obtener todas las cuotas de un periodo específico (año y mes)
export const obtenerCuotasPorPeriodo = async (anio, mes) => {
  return await cuotaRepo.findByPeriodo(anio, mes);
};

// Marcar una cuota como pagada
export const marcarCuotaComoPagada = async (id, datosPago) => {
  const cuota = await cuotaRepo.findById(id);
  if (!cuota) throw new Error('Cuota no encontrada');
  if (cuota.estado === 'PAGA') throw new Error('La cuota ya está pagada');
  return await cuotaRepo.updateById(id, {
    estado: 'PAGA',
    fecha_pago: datosPago.fecha_pago || new Date(),
    metodo_pago: datosPago.metodo_pago,
    usuario_cobro: datosPago.usuario_cobro,
    comprobante_numero: datosPago.comprobante_numero
  });
};

// Obtener todas las cuotas vencidas (pendientes y con fecha de vencimiento pasada)
export const obtenerCuotasVencidas = async (fechaReferencia = new Date()) => {
  return await cuotaRepo.findVencidas(fechaReferencia);
}; 