const express = require('express');
const router = express.Router();

const controlador = require('../controladores/robot'); 
const upload = require('../configuraciones/archivosMultimedia');
const validarToken = require('../controladores/validarToken')

router.get('/', (req, res) => {
    res.redirect('/registrarPlatillo');
});
router.get('/registrarPlatillo', (req, res) => {
    res.sendFile(__dirname+'/index.html');
});
router.get('/mostrarPlatillos/page/:id',validarToken, controlador.obtener_platillo); 
router.post('/registrarPlatillo',validarToken, upload, controlador.insertar_platillo); 

router.put('/modificarPlatillo/:id',validarToken, upload, controlador.modificar_platillo); 
router.delete('/eliminarPlatillo/:id',validarToken, controlador.eliminar_platillo); 

router.get('/all',validarToken,controlador.listar);
router.get('/buscarPlatillo',validarToken, controlador.buscar_platillo);
router.get('/contarPlatillos',validarToken, controlador.obtener_cantidad_platillos);
router.get('/obtener_pagina/:id',validarToken, controlador.obtener_posicion);
router.post('/login' , controlador.login);
router.post('/registro', controlador.registro_usuario);

module.exports = router;