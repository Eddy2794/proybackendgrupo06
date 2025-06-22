import { Router } from 'express';
import * as profesorCtrl from '../controller/profesor-controller.js';
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Profesor:
 *       type: object
 *       required:
 *         - titulo
 *         - experiencia_anios
 *         - fecha_contratacion
 *         - salario
 *         - activo_laboral
 *         - personaData
 *       properties:
 *         titulo:
 *           type: string
 *           description: Título académico del profesor
 *           example: "Licenciado en Matemáticas"
 *         experiencia_anios:
 *           type: number
 *           description: Años de experiencia del profesor
 *           minimum: 0
 *           maximum: 50
 *           example: 10
 *         fecha_contratacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de contratación del profesor
 *           example: "2015-03-01T00:00:00.000Z"
 *         salario:
 *           type: number
 *           description: Salario del profesor
 *           minimum: 0
 *           example: 75000.50
 *         activo_laboral:
 *           type: boolean
 *           description: Estado laboral del profesor
 *           example: true
 *         personaData:
 *           type: object
 *           required:
 *             - nombres
 *             - apellidos
 *             - tipoDocumento
 *             - numeroDocumento
 *             - fechaNacimiento
 *             - genero
 *             - telefono
 *             - email
 *           properties:
 *             nombres:
 *               type: string
 *               description: Nombres de la persona
 *               example: "Ana María"
 *             apellidos:
 *               type: string
 *               description: Apellidos de la persona
 *               example: "Gómez Ruiz"
 *             tipoDocumento:
 *               type: string
 *               enum: [DNI, PASAPORTE, CEDULA]
 *               description: Tipo de documento
 *               example: "DNI"
 *             numeroDocumento:
 *               type: string
 *               description: Número de documento
 *               example: "12345678"
 *             fechaNacimiento:
 *               type: string
 *               format: date
 *               description: Fecha de nacimiento
 *               example: "1985-07-20"
 *             genero:
 *               type: string
 *               enum: [MASCULINO, FEMENINO, OTRO]
 *               description: Género de la persona
 *               example: "FEMENINO"
 *             telefono:
 *               type: string
 *               description: Número de teléfono
 *               example: "+5491155551234"
 *             email:
 *               type: string
 *               format: email
 *               description: Correo electrónico
 *               example: "ana.gomez@email.com"
 *             direccion:
 *               type: object
 *               properties:
 *                 calle:
 *                   type: string
 *                   example: "Av. Corrientes 123"
 *                 ciudad:
 *                   type: string
 *                   example: "Buenos Aires"
 *                 departamento:
 *                   type: string
 *                   example: "CABA"
 *                 codigoPostal:
 *                   type: string
 *                   example: "C1043"
 *                 pais:
 *                   type: string
 *                   example: "Argentina"
 *     ProfesorUpdate:
 *       type: object
 *       properties:
 *         titulo:
 *           type: string
 *           example: "Dr."
 *         experiencia_anios:
 *           type: number
 *           example: 12
 *         salario:
 *           type: number
 *           example: 85000
 *         activo_laboral:
 *           type: boolean
 *           example: true
 *         persona:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "685702f8601e7ff4d8d57162"
 *             nombres:
 *               type: string
 *               example: "Pedro José"
 *             apellidos:
 *               type: string
 *               example: "García López"
 *             email:
 *               type: string
 *               example: "pedro.garcia@email.com"
 *             telefono:
 *               type: string
 *               example: "+5491166667890"
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Error al procesar la solicitud"
 *         error:
 *           type: string
 *           example: "Detalles del error"
 */

/**
 * @swagger
 * /api/profesores:
 *   post:
 *     summary: Crear un nuevo profesor
 *     description: Registra un nuevo profesor con sus datos personales
 *     tags: [Profesores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Profesor'
 *           example:
 *             titulo: "Licenciado en Matemáticas"
 *             experiencia_anios: 10
 *             fecha_contratacion: "2015-03-01T00:00:00.000Z"
 *             salario: 75000.50
 *             activo_laboral: true
 *             personaData:
 *               nombres: "Ana María"
 *               apellidos: "Gómez Ruiz"
 *               tipoDocumento: "DNI"
 *               numeroDocumento: "12345678"
 *               fechaNacimiento: "1985-07-20"
 *               genero: "FEMENINO"
 *               telefono: "+5491155551234"
 *               email: "ana.gomez@email.com"
 *               direccion:
 *                 calle: "Av. Corrientes 123"
 *                 ciudad: "Buenos Aires"
 *                 departamento: "CABA"
 *                 codigoPostal: "C1043"
 *                 pais: "Argentina"
 *     responses:
 *       201:
 *         description: Profesor creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profesor registrado correctamente"
 *       400:
 *         description: Error en los datos de entrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *  
 *   get:
 *     summary: Obtener todos los profesores
 *     description: Retorna una lista de todos los profesores registrados
 *     tags: [Profesores]
 *     responses:
 *       200:
 *         description: Lista de profesores obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profesores obtenidos correctamente"
 *                 profesores:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Profesor'
 *       400:
 *         description: Error al obtener los profesores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/profesores/{id}:
 *   get:
 *     summary: Obtener profesor por ID
 *     description: Retorna los datos de un profesor específico por su ID
 *     tags: [Profesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del profesor
 *         example: "685702f8601e7ff4d8d57162"
 *     responses:
 *       200:
 *         description: Profesor obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profesor obtenido correctamente"
 *                 profesor:
 *                   $ref: '#/components/schemas/Profesor'
 *       400:
 *         description: Error al obtener el profesor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 
 *   put:
 *     summary: Actualizar profesor
 *     description: Actualiza los datos de un profesor existente
 *     tags: [Profesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del profesor
 *         example: "685702f8601e7ff4d8d57162"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfesorUpdate'
 *           example:
 *             titulo: "Dr."
 *             experiencia_anios: 12
 *             salario: 85000
 *             activo_laboral: true
 *             persona:
 *               _id: "685702f8601e7ff4d8d57162"
 *               nombres: "Pedro José"
 *               apellidos: "García López"
 *               email: "pedro.garcia@email.com"
 *               telefono: "+5491166667890"
 *     responses:
 *       200:
 *         description: Profesor actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profesor actualizado correctamente"
 *                 profesor:
 *                   $ref: '#/components/schemas/Profesor'
 *       400:
 *         description: Error al actualizar el profesor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'

 *   delete:
 *     summary: Eliminar profesor
 *     description: Elimina un profesor del sistema (borrado lógico)
 *     tags: [Profesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del profesor
 *         example: "685702f8601e7ff4d8d57162"
 *     responses:
 *       200:
 *         description: Profesor eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profesor eliminado correctamente"
 *                 profesor:
 *                   $ref: '#/components/schemas/Profesor'
 *       400:
 *         description: Error al eliminar el profesor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post('/', profesorCtrl.createProfesor);                 
router.get('/', profesorCtrl.getProfesores); 
router.get('/:id', profesorCtrl.getProfesorById);
router.put('/:id', profesorCtrl.editProfesor);                 
router.delete('/:id', profesorCtrl.deleteProfesor);             

export default router;