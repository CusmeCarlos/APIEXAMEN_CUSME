import { Router } from 'express';
import { getGanador } from '../controladores/ganador.Ctrl.js';

const router = Router();

// Ruta para obtener al ganador
router.get('/ganador', getGanador);

export default router;
