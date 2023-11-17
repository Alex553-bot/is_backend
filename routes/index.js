const express = require('express');
const router = express.Router();

const controlador = require('../controladores/robot'); 
const upload = require('../configuraciones/archivosMultimedia');
const validador = require('../controladores/validarToken');

router.get('/', (req, res) => {
    res.redirect('/registrarPlatillo');
});
router.get('/registrarPlatillo', (req, res) => {
    res.sendFile(__dirname+'/index.html');
});
router.get('/mostrarPlatillos/page/:id', validador.token, controlador.obtener_platillo); 
router.post('/registrarPlatillo', validador.token, upload, controlador.insertar_platillo); 

router.put('/modificarPlatillo/:id', validador.token, upload, controlador.modificar_platillo); 
router.delete('/eliminarPlatillo/:id', validador.token, controlador.eliminar_platillo); 

router.get('/all', validador.token,controlador.listar);
router.get('/buscarPlatillo', validador.token, controlador.buscar_platillo);
router.get('/contarPlatillos', validador.token, controlador.contarPlatillos);
router.get('/obtener_pagina/:id', validador.token, controlador.obtener_posicion);
router.post('/login' , controlador.login);
router.post('/registro', controlador.registro_usuario);

router.get('/obtenerCalificacion/:id', validador.token, controlador.obtenerCalificacion); 
router.put('/actualizarCalificacion/:id', validador.token, controlador.actualizarCalificacion);
router.get('/obtenerPlatillosCalificados', validador.token, controlador.obtenerPlatillosCalificados);
router.get('/obtenerEstadisticas', validador.token, controlador.obtenerEstadisticas);
router.post('/recuperarContra', controlador.recuperarContra);
router.post('/cambiarContra', validador.token, controlador.cambiarContra);
module.exports = router;