import { Router } from 'express';
import * as profesorCtrl from './profesor-controller.js';
const router = Router();

router.post('/', profesorCtrl.createProfesor);                 
router.get('/', profesorCtrl.getProfesores); 
router.get('/:id', profesorCtrl.getProfesorById);
router.put('/:id', profesorCtrl.editProfesor);                 
router.delete('/:id', profesorCtrl.deleteProfesor);             

export default router;