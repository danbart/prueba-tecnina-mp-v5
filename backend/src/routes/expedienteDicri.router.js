const express = require('express');
const router = express.Router();

const expedienteDicriController = require('../controllers/expedienteDicri.controller');

router.get('/', expedienteDicriController.obtenerExpedientesDicri);
router.get('/:id', expedienteDicriController.obtenerExpedienteDicriPorId);
router.get('/:id/indicios', expedienteDicriController.obtenerIndiciosPorExpediente);
router.post('/:id/indicio', expedienteDicriController.crearIndicio);
router.put('/:id/indicio/:idIndicio', expedienteDicriController.updateIndicio);
router.get('/:id/historial/', expedienteDicriController.historialExpediente);
router.post('/', expedienteDicriController.crearExpedienteDicri);
router.post('/enviar-revision', expedienteDicriController.enviarExpedienteARevision);
router.post('/aprobar', expedienteDicriController.aprobarExpediente);
router.post('/rechazar', expedienteDicriController.rechazarExpediente);

module.exports = router;