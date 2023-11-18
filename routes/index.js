const express = require('express');
const router = express.Router();

// robots:
const usuario = require('../controladores/robot'); 
const admin = require('../controladores/admin');
const acceso = require('../controladores/incorporador');
// middlewares: 
const upload = require('../configuraciones/archivosMultimedia');
const validador = require('../controladores/validarToken');

router.get('/', (req, res) => {
    res.redirect('/registrarPlatillo');
});
router.get('/registrarPlatillo', (req, res) => {
    res.sendFile(__dirname+'/index.html');
});
router.get('/mostrarPlatillos/page/:id', validador.token, usuario.obtener_platillo); 
router.post('/registrarPlatillo', validador.token, upload, admin.insertar_platillo); 
router.put('/modificarPlatillo/:id', validador.token, upload, admin.modificar_platillo); 
router.delete('/eliminarPlatillo/:id', validador.token, admin.eliminar_platillo); 

router.get('/all', validador.token, usuario.listar);
router.get('/buscarPlatillo', validador.token, usuario.buscar_platillo);
router.get('/contarPlatillos', validador.token, usuario.contarPlatillos);
router.get('/obtener_pagina/:id', validador.token, usuario.obtener_posicion);

router.post('/login' , acceso.login);
router.post('/registro', acceso.registro_usuario);
router.post('/recuperarContra', acceso.recuperarContra);
router.post('/cambiarContra', validador.token, acceso.cambiarContra);

router.get('/obtenerCalificacion/:id', validador.token, usuario.obtenerCalificacion); 
router.put('/actualizarCalificacion/:id', validador.token, usuario.actualizarCalificacion);
router.get('/obtenerPlatillosCalificados', validador.token, admin.obtenerPlatillosCalificados);
router.get('/obtenerEstadisticas', validador.token, admin.obtenerEstadisticas);

module.exports = router;