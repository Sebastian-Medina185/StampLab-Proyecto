const express = require('express');
const router = express.Router();
const estadoController = require('../controllers/estadoController');

router.get('/', estadoController.getAllEstados);
router.get('/tipo/:tipo', estadoController.getEstadosByTipo);  // AGREGAR
router.get('/:id', estadoController.getEstadoById);
router.post('/', estadoController.createEstado);
router.put('/:id', estadoController.updateEstado);
router.delete('/:id', estadoController.deleteEstado);

module.exports = router;