const express = require('express');
const router = express.Router();

const controlador = require('../controladores/robot'); 
const upload = require('../configuraciones/archivosMultimedia');

router.get('/', (req, res) => {
    res.redirect('/registrarPlatillo');
});
router.get('/registrarPlatillo', (req, res) => {
    res.sendFile(__dirname+'/index.html');
});
router.get('/mostrarPlatillos/page/:id', controlador.obtener_platillo); 
router.post('/registrarPlatillo', upload, controlador.insertar_platillo); 

router.put('/modificarPlatillo/:id', upload, controlador.modificar_platillo); 
router.delete('/eliminarPlatillo/:id', controlador.eliminar_platillo); 

router.get('/all',controlador.listar);
router.get('/buscarPlatillo', controlador.buscar_platillo);
router.get('/contarPlatillos', controlador.obtener_cantidad_platillos);
router.get('/obtener_pagina/:id', controlador.obtener_posicion);

router.get('/obtenerCalificacion/:id', controlador.obtenerCalificacion); 
router.put('/actualizarCalificacion/:id', controlador.actualizarCalificacion);
router.get('/obtenerPlatillosCalificados', controlador.obtenerPlatillosCalificados);
router.get('/obtenerEstadisticas', controlador.obtenerEstadisticas);
module.exports = router;
