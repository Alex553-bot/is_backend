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
router.get('/mostrarPlatillos/page/:id', controlador.obtener_platillo); 
router.post('/registrarPlatillo', upload, controlador.insertar_platillo); 

router.put('/modificarPlatillo/:id', upload, controlador.modificar_platillo); 
router.delete('/eliminarPlatillo/:id', controlador.eliminar_platillo); 
router.get('/buscarPlatillo/:id', controlador.buscar_platillo);
router.get('/cantidadPlatillos', controlador.obtener_cantidad_platillos);
router.post('/login' , controlador.login);
router.post('/registro', controlador.registro_usuario);

module.exports = router;
